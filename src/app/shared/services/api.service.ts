import { Inject, Injectable, OnDestroy } from "@angular/core";
import {
  ApolloQueryResult,
  FetchResult,
  gql,
  MutationOptions,
  OperationVariables,
  WatchQueryOptions
} from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import { Model } from "app/shared/models/model";
import { LookupStore } from "basic";
import { BaseGroupDescriptor, LoadOptions } from "devextreme/data";
import ArrayStore from "devextreme/data/array_store";
import CustomStore, { CustomStoreOptions, Options } from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { from, lastValueFrom, Observable, Subject } from "rxjs";
import { filter, map, mergeMap, take, takeUntil } from "rxjs/operators";

const DEFAULT_KEY = "id";
const DEFAULT_GQL_KEY_TYPE = "String";
const DEFAULT_PAGE_SIZE = 10;
const BASE_FIELDS_SIZE = 7;
const PAGINATION_FIELDS = [
  "pageInfo.hasNextPage",
  "pageInfo.hasPreviousPage",
  "pageInfo.startCursor",
  "pageInfo.endCursor",
  "totalPage",
  "totalCount",
];

export type PageInfo = {
  startCursor?: string;
  endCursor?: string;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
};

export type DistinctInfo = {
  count: number;
  key: string;
  items: DistinctInfo[];
};

export type RelayPage<T> = {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
  summary?: number[];
};

export type Edge<T = any> = {
  node: T;
  __typename: string;
};

export enum Direction {
  ASC = "ASC",
  DESC = "DESC",
}

export type OrderedField = {
  property: string;
  direction?: Direction;
  ignoreCase?: boolean;
};

export enum SummaryType {
  SUM = "sum",
  AVG = "avg",
  MIN = "min",
  MAX = "max",
  COUNT = "count",
}

export type SummaryInput = {
  /**
   * Specifies the column that provides data for a summary item.
   */
  selector: string;

  /**
   * Specifies how to aggregate data for the summary item.
   */
  summaryType: SummaryType | string;
};

export type Pageable = {
  pageNumber: number;
  pageSize: number;
  sort?: {
    orders: OrderedField[];
  };
};

export type RelayPageVariables = OperationVariables & {
  search?: string;
  pageable: Pageable;
  summary?: SummaryInput[];
};

export type LocateVariables = {
  pageSize?: number;
  type?: string;
  key: any | any[];
};

export interface APIRead {
  getAll?(columns: string[], variables?: OperationVariables): Observable<any>;
  getOne?(
    id: string | number,
    columns?: Array<string>
  ):
    | Observable<ApolloQueryResult<any>>
    | Promise<Observable<ApolloQueryResult<any>>>;

  /**
   * @deprecated use getDataSource_v2
   */
  getDataSource?(): DataSource;

  /**
   * @param Columns The fields you want to retrieve.
   */
  getDataSource_v2?(Columns: Array<string>): DataSource;
}

export interface APIPersist {
  save?(
    variables: OperationVariables
  ):
    | Promise<
      Observable<FetchResult<any, Record<string, any>, Record<string, any>>>
    >
    | Observable<FetchResult<any, Record<string, any>, Record<string, any>>>;
  save_v2?(
    columns: Array<string>,
    variables: OperationVariables
  ):
    | Promise<
      Observable<FetchResult<any, Record<string, any>, Record<string, any>>>
    >
    | Observable<FetchResult<any, Record<string, any>, Record<string, any>>>;
  delete?(
    variables: OperationVariables
  ):
    | Promise<
      Observable<FetchResult<any, Record<string, any>, Record<string, any>>>
    >
    | Observable<FetchResult<any, Record<string, any>, Record<string, any>>>;
}

export interface APICount<CountResponse> {
  count(filter?: any[]): Observable<ApolloQueryResult<CountResponse>>;
}

export interface APIDistinct {
  getDistinctEntityDatasource(
    fieldName,
    descriptionField?,
    searchExpr?
  ): Observable<DataSource>;
}

@Injectable()
export abstract class ApiService implements OnDestroy {
  pageSize = DEFAULT_PAGE_SIZE;
  baseFieldsSize = BASE_FIELDS_SIZE;
  keyField: string | string[];
  gqlKeyType = DEFAULT_GQL_KEY_TYPE;
  model: typeof Model & (new () => Model);
  storeConfiguration: CustomStoreOptions;
  destroy = new Subject<boolean>();

  constructor(
    protected apollo: Apollo,
    @Inject("model") model?: typeof Model & (new () => Model)
  ) {
    this.model = model;
    this.keyField = this?.model?.getKeyField() || DEFAULT_KEY;
  }

  /**
   * It takes a list of operations, a list of variables and an optional alias and returns a string that
   * represents the GraphQL query
   * @param type - the type of the query, either "query" or "mutation"
   * @param operations - an array of objects that contain the name of the operation, the body
   * of the operation (if any) and the parameters of the operation.
   * @param variables - an array of variables
   * that will be used in the query.
   * @param alias - The name of the query, mutation or subscription.
   * @returns The GraphQL query.
   */
  static buildGraph(
    type: "query" | "mutation",
    operations: {
      name: string;
      body?: Array<string> | Set<string>;
      alias?: string;
      params?: { name: string; value: any; isVariable: boolean }[];
    }[],
    variables: { name: string; type: string; isOptionnal: boolean }[] = [],
    alias = operations?.[0].name.ucFirst()
  ) {
    const mapVariables = (vars) =>
      vars.map((v) => `$${v.name}: ${v.type}${v.isOptionnal ? "" : "!"}`);

    const mapParams = (prms) =>
      prms.map((p) => `${p.name}: ${p.isVariable ? "$" : ""}${p.value}`);

    const mapPaths = (pths) => Model.getGQL(pths).toGraphQL();

    const mapOperations = (ops) =>
      ops.map(
        (o) => `${o.alias ? `${o.alias}: ` : ""} ${o.name}
      ${o?.params ? `(${mapParams(o.params)})` : ""}
      ${o?.body
            ? `{
        ${mapPaths(o?.body)}
      }`
            : ""
          }`
      );

    return `${type} ${alias}${variables?.length ? `(${mapVariables(variables)})` : ""
      } { ${mapOperations(operations)} }`;
  }

  static mapForSave(variables: { [key: string]: any }) {
    return Object.entries(variables)
      .flatMap(([key, value]) => {
        if (value === null) return { [key]: null };
        if (typeof value?.id !== "undefined" && value?.id === null)
          return { [key]: null };
        if (Array.isArray(value)) return { [key]: value };
        if (typeof value === "object" && value !== null) {
          if (typeof value.length !== "undefined")
            return { [key]: value.map((v) => this.mapForSave(v)) };
          return { [key]: this.mapForSave(value) };
        }
        return { [key]: value };
      })
      .reduce((acm, crt) => ({ ...acm, ...crt }));
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }

  /**
   * Map RelayPage as Object
   * @param relayPage Input RelayPage
   */
  public asListCount<T = any>(relayPage: RelayPage<T>) {
    return {
      data: this.asList<T>(relayPage),
      totalCount: relayPage.totalCount,
    };
  }

  /**
   * Map RelayPage as Model instance
   * @param relayPage Input RelayPage
   */
  public asInstancedListCount<T = any>(
    relayPage: RelayPage<T>,
    mapper = (v: Record<string, any>) => new (this.model as any)(v) as T
  ) {
    return {
      data: this.asList<T>(relayPage).map(mapper),
      totalCount: relayPage.totalCount,
      ...(this.isSummarisedRelayPage(relayPage)
        ? { summary: relayPage.summary }
        : {}),
    };
  }

  public isSummarisedRelayPage<T = any>(
    relayPage: RelayPage<T>
  ): relayPage is RelayPage<T> {
    return relayPage?.summary !== undefined;
  }

  /**
   * Map RelayPage as Array
   * @param relayPage Input RelayPage
   */
  private asList<T = any>(relayPage: RelayPage<T>) {
    return relayPage.edges.map(({ node }) => node);
  }

  /**
   * Locate page and index of entity in paginated list
   * @param inputVariables Page location variables
   */
  public locatePage(inputVariables: LocateVariables) {
    const type = `Geo${this.model.name}`;
    const pageSize = this.pageSize;
    const query = this.buildLocate();

    return this.query<{ locatePage: number }>(query, {
      fetchPolicy: "no-cache",
      variables: { pageSize, type, ...inputVariables },
    } as WatchQueryOptions<any>).pipe(
      takeUntil(this.destroy),
      map((res) => res.data),
      take(1)
    );
  }

  /**
   * Run GraphQL query
   * @param gqlQuery GraphQL query
   * @param options Query options
   */
  protected query<T>(gqlQuery: string, options?: WatchQueryOptions) {
    return this.apollo.watchQuery<T>({
      query: gql(gqlQuery),
      fetchPolicy: "cache-and-network",
      ...options,
    }).valueChanges;
  }

  /**
   * Build paginated query
   * @param depth Sub model selection depth
   * @param regExpFilter Regexp field filter
   * @param operationName Name of the operation, default to `all{ModelName}`
   * @param option Object of configurations
   * @deprecated use buildGetAll_v2
   */
  protected async buildGetAll(
    depth?: number,
    regExpFilter?: RegExp,
    operationName?: string,
    option?: { forceFilter?: boolean }
  ) {
    const operation = operationName ?? `all${this.model.name}`;
    const alias = operation.ucFirst();
    return `
      query ${alias}($search: String, $pageable: PaginationInput!) {
        ${operation}(search:$search, pageable:$pageable) {
          edges {
            node {
              ${await this.model
        .getGQLFields(depth, regExpFilter, null, {
          noList: true,
          forceFilter: option?.forceFilter,
        })
        .toPromise()}
            }
          }
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          }
          totalCount
        }
      }
    `;
  }

  /**
   * Build list query
   * @param depth Sub model selection depth
   * @param regExpFilter Regexp field filter
   * @param operationName Name of the operation, default to `all{ModelName}`
   * @param option Object of configurations
   */
  protected async buildGetList(columns: Array<string>, operationName?: string) {
    const operation = operationName ?? `list${this.model.name}`;
    const alias = operation.ucFirst();
    return `
      query ${alias}($search: String) {
        ${operation}(search:$search) {
          ${await this.model.getGQLObservable(columns).toPromise()}
        }
      }
    `;
  }

  /**
   * Build paginated query
   * @param columns The fields you want to retrieve.
   * @param operationName Name of the operation, default to `all{ModelName}`.
   * @protected
   */
  protected async buildGetAll_v2(
    columns: Array<string> | Set<string>,
    operationName?: string
  ) {
    const operation = operationName ?? `all${this.model.name}`;
    const alias = operation.ucFirst();
    return `
      query ${alias}($search: String, $pageable: PaginationInput!) {
        ${operation}(search:$search, pageable:$pageable) {
          edges {
            node {
              ${await this.model.getGQLObservable(columns).toPromise()}
            }
          }
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          }
          totalCount
        }
      }
    `;
  }

  /**
   * Build getOne query
   * @param depth Sub model selection depth
   * @param regExpFilter Regexp field filter
   * @deprecated use buildGetOne_v2
   */
  protected async buildGetOne(depth?: number, regExpFilter?: RegExp) {
    const operation = this.withLowerCaseFirst(this.model.name);
    const alias = operation.ucFirst();
    return `
      query ${alias}($${this.keyField}: ${this.gqlKeyType}!) {
        ${operation}(${this.keyField}:$${this.keyField}) {
          ${await this.model.getGQLFields(depth, regExpFilter).toPromise()}
        }
      }
    `;
  }
  /**
   * Build getOne query
   * @param columns The fields you want to retrieve.
   */
  protected async buildGetOne_v2(columns: Array<string> | Set<string>) {
    const operation = this.withLowerCaseFirst(this.model.name);
    const alias = operation.ucFirst();
    if (Array.isArray(this.keyField)) this.keyField = "id";
    return `
      query ${alias}($${this.keyField}: ${this.gqlKeyType}!) {
        ${operation}(${this.keyField}:$${this.keyField}) {
          ${await this.model.getGQLObservable(columns).toPromise()}
        }
      }
    `;
  }

  /**
   * Build count query
   * @param columns The fields you want to retrieve.
   */
  protected async buildCount() {
    const operation = `count${this.model.name}`;
    const alias = operation.ucFirst();
    return `
      query ${alias}($search: String) {
        ${operation}(search: $search)
      }
    `;
  }

  /**
   * Build save query
   * @param depth Save response depth
   * @param regExpFilter Fields filter
   * @deprecated Use buildSave_v2
   */
  protected async buildSave(depth?: number, regExpFilter?: RegExp) {
    const entity = this.withLowerCaseFirst(this.model.name);
    const operation = `save${this.model.name}`;
    const type = `Geo${this.model.name}Input`;
    const alias = operation.ucFirst();
    return `
      mutation ${alias}($${entity}: ${type}!) {
        ${operation}(${entity}: $${entity}) {
          ${await this.model.getGQLFields(depth, regExpFilter).toPromise()}
        }
      }
    `;
  }

  /**
   * Build save query
   * @param depth Save response depth
   * @param regExpFilter Fields filter
   */
  protected async buildSave_v2(columns: Array<string>) {
    const entity = this.withLowerCaseFirst(this.model.name);
    const operation = `save${this.model.name}`;
    const type = `Geo${this.model.name}Input`;
    const alias = operation.ucFirst();
    return `
      mutation ${alias}($${entity}: ${type}!) {
        ${operation}(${entity}: $${entity}) {
          ${await this.model.getGQLObservable(columns).toPromise()}
        }
      }
    `;
  }

  /**
   * Build save-all query
   * @param depth Save response depth
   * @param regExpFilter Fields filter
   */
  protected async buildSaveAll(depth?: number, regExpFilter?: RegExp) {
    const entity = `all${this.model.name}`;
    const operation = `saveAll${this.model.name}`;
    const type = `Geo${this.model.name}Input`;
    const alias = operation.ucFirst();
    return `
      mutation ${alias}($${entity}: [${type}]!) {
        ${operation}(${entity}: $${entity}) {
          ${await this.model.getGQLFields(depth, regExpFilter).toPromise()}
        }
      }
    `;
  }

  /**
   * Build delete query
   */
  protected buildDelete() {
    const entity = "id";
    const type = "String";
    const operation = `delete${this.model.name}`;
    const alias = operation.ucFirst();
    return `
      mutation ${alias}($${entity}: ${type}!) {
        ${operation}(${entity}: $${entity})
      }
    `;
  }

  /**
   * Build distinct query
   */
  protected buildDistinct() {
    const operation = `distinct`;
    const alias = operation.ucFirst();
    const type = `Geo${this.model.name}`;
    return `
      query ${alias}($field: String!, $search: String, $pageable: PaginationInput!) {
        ${operation}(type: "${type}", field: $field, search: $search, pageable: $pageable) {
          edges {
            node {
              count
              key
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalPage
          totalCount
        }
      }
    `;
  }

  /**
   * Create DX CustomStore with preconfigured key
   * @param options DXCustomStore options
   */
  public createCustomStore(options?: CustomStoreOptions) {
    this.storeConfiguration = options;
    return new CustomStore({
      key: this.keyField,
      ...options,
    });
  }

  /**
   * Build locate query
   */
  public buildLocate() {
    const operation = `locatePage`;
    const alias = operation.ucFirst();
    return `
      query ${alias}($pageSize: Int!, $type: String!, $key: [String]!) {
        ${operation}(pageSize: $pageSize, type: $type, key: $key)
      }
    `;
  }

  /**
   * Transform first character to lowercase
   * @param param0 value
   */
  private withLowerCaseFirst([first, ...rest]: string) {
    return [first.toLowerCase(), ...rest].join("");
  }

  /**
   * Map DX Search to DX Filter
   * @param options DX CustomSource load options
   */
  public mapDXSearchToDXFilter(options: LoadOptions) {
    return typeof options.searchExpr === "object"
      ? (options.searchExpr as [])
        .map((expr) => [expr, options.searchOperation, options.searchValue])
        .join("¤or¤")
        .split("¤")
        .map((value: any) => {
          const mapped = value.split(",");
          return mapped.length > 1 ? mapped : mapped.shift();
        })
      : [options.searchExpr, options.searchOperation, options.searchValue];
  }

  /**
   * Map DX filters to RSQL
   * @param dxFilter DX filters arrays
   */
  public mapDXFilterToRSQL(dxFilter: any[]) {
    // Avoid modify original
    let clonedFilter = JSON.parse(JSON.stringify(dxFilter));

    // Make filter structure consistant: [string|[]]
    if (typeof clonedFilter[0] === "string") clonedFilter = [clonedFilter];

    const next = (currentFilter: any[], negate = false, index = 0) => {
      let node = currentFilter[index];
      if (typeof node === "object") {
        // comparison

        // Map negation
        if (node?.[0] === "!") {
          node = node[1];
          negate = !negate;
        }

        // Deep filter
        if (typeof node?.[0] === "object") {
          currentFilter[index] = `(${next(node, negate).join(" ")})`;
        } else {
          /* eslint-disable-next-line prefer-const */
          let [selector, operator, value] = node;
          const dxOperator = operator;
          operator = this.mapOperator(operator, negate);

          // Format object
          if (typeof value === "object" && value) {
            const firstField = Object.entries(value)
              .filter(([key]) => key !== "__typename")
              .shift();
            selector =
              selector !== "this"
                ? `${selector}.${firstField.shift()}`
                : firstField.shift();
            value = firstField.shift();
          }

          // Map value
          if (selector === "this" && value) {
            const mappedFilter = Object.entries(value)
              .filter(([key]) => key !== "__typename")
              .map(([k, v]) => JSON.stringify([k, "=", v]))
              .join(`¤${JSON.stringify("and")}¤`)
              .split("¤")
              .map((v) => JSON.parse(v));
            currentFilter[index] = this.mapDXFilterToRSQL(mappedFilter);
          } else {
            if (["contains", "notcontains"].includes(dxOperator))
              value = `%${value}%`;
            if (dxOperator === "startswith") value = `${value}%`;
            if (dxOperator === "endswith") value = `%${value}`;
            value = JSON.stringify(value);
            currentFilter[index] = [selector, operator, value].join("");
          }
        }
      } else {
        currentFilter[index] = negate ? this.switchLogicalOperator(node) : node;
      }
      if (index < currentFilter.length - 1)
        return next(currentFilter, negate, index + 1);
      else return currentFilter;
    };
    return next(clonedFilter).flat().join(" ");
  }

  /**
   * Map DXFilter opetator to RSQL operator
   */
  private mapOperator(operator: string, negate = false) {
    switch (operator) {
      case "=":
        return negate ? "!=" : "==";
      case "<>":
        return negate ? "==" : "!=";
      case ">":
        return negate ? "<=" : ">";
      case "<":
        return negate ? ">=" : "<";
      case ">=":
        return negate ? "<" : ">=";
      case "<=":
        return negate ? ">" : "<=";
      case "contains":
        return negate ? "=inotlike=" : "=ilike=";
      case "notcontains":
        return negate ? "=ilike=" : "=inotlike=";
      case "in":
        return negate ? "=notin=" : "=in=";
      case "startswith":
        return negate ? "=inotlike=" : "=ilike=";
      case "endswith":
        return negate ? "=ilike=" : "=ilike=";
      case "isnull":
        return negate ? "=isnotnull=" : "=isnull=";
      case "isnotnull":
        return negate ? "=isnull=" : "=isnotnull=";
    }
  }

  /**
   * Switch logical operator (and/or)
   */
  private switchLogicalOperator(operator: string) {
    operator = operator.toLowerCase();
    if (operator === "and") return "or";
    if (operator === "or") return "and";
  }

  public mapLoadOptionsToVariables(
    options: LoadOptions & { isLoadingAll?; exportPage?; exportTake?}
  ) {
    const variables: RelayPageVariables = {
      pageable: {
        pageNumber: options.isLoadingAll
          ? options.exportPage
          : options.skip / options.take || 0,
        pageSize: options.isLoadingAll
          ? options.exportTake
          : options.take || DEFAULT_PAGE_SIZE,
      },
    };
    this.pageSize = options.take;

    // Search / filter
    const search = [];
    if (options.filter)
      // row/header filters
      search.push(this.mapDXFilterToRSQL(options.filter));
    if (options.searchValue)
      // global search
      search.push(this.mapDXFilterToRSQL(this.mapDXSearchToDXFilter(options)));
    variables.search = search.map((v) => `(${v})`).join(" and ");

    // Sort
    if (options.sort)
      variables.pageable.sort = {
        orders: (options.sort as Array<any>).map(
          ({ selector: property, desc }) =>
          ({
            property,
            direction: desc ? Direction.DESC : Direction.ASC,
          } as OrderedField)
        ),
      };

    // totalSummary
    if (options.totalSummary)
      variables.summary = (options.totalSummary as Array<any>).map(
        ({ selector, summaryType }) => ({
          selector,
          summaryType: SummaryType[summaryType],
        })
      );

    return variables;
  }

  /**
   * Merge variables, last item as priority if merge is impossible
   * @param variables Variables list
   */
  public mergeVariables(
    ...variables: OperationVariables[] | RelayPageVariables[]
  ) {
    return variables.reduce((acm, current) => ({
      ...acm,
      ...current,
      search: [acm ? acm.search : "", current ? current.search : ""]
        .filter((v) => v)
        .map((v) => `(${v})`)
        .join(" and "),
    }));
  }

  /**
   * Utility method to listen for query request, useful within DX datasource
   * @param query GraphQL query
   * @param options Apollo WatchQueryOptions
   * @param cbk Callback called each time data is received
   ** @deprecated Use `Apollo` api in combination with `@see Api.buildGraph`
   */
  public listenQuery<T>(
    query: string,
    options: Partial<
      WatchQueryOptions<RelayPageVariables | OperationVariables>
    >,
    cbk: (res: ApolloQueryResult<T>) => void
  ) {
    const done = new Subject<ApolloQueryResult<T>>();
    this.query<T>(query, {
      fetchPolicy: "cache-and-network",
      ...options,
    } as WatchQueryOptions<RelayPageVariables>)
      .pipe(
        takeUntil(this.destroy),
        filter((res) => !!Object.keys(res.data).length),
        takeUntil(done)
      )
      .subscribe((res) => {
        cbk(res);
        done.next(res);
        if (!res.loading) done.complete();
      });
    return done;
  }

  /**
   * Utility method to listen for `getOne()` query
   * @param options Apollo WatchQueryOptions
   * @param depth Query fields depth
   * @param fieldsFilter Query fields filter
   *    * @deprecated Use `Apollo` api in combination with `@see buildGetOneGraph`
   */
  public watchGetOneQuery<T>(
    options: Partial<WatchQueryOptions<OperationVariables>>,
    depth = 1,
    fieldsFilter?: RegExp
  ) {
    const done = new Subject<ApolloQueryResult<T>>();
    from(this.buildGetOne(depth, fieldsFilter))
      .pipe(
        takeUntil(this.destroy),
        takeUntil(done),
        mergeMap((query) =>
          this.query<T>(query, {
            fetchPolicy: "cache-and-network",
            ...options,
          } as WatchQueryOptions)
        ),
        filter((res) => !!Object.keys(res.data).length)
      )
      .subscribe((res) => {
        done.next(res);
        if (!res.loading) done.complete();
      });
    return done;
  }

  /**
   * @deprecated Use `Apollo` api in combination with `@see buildCountGraph`
   */
  public watchCountQuery<R>(search?: string) {
    return from(this.buildCount()).pipe(
      takeUntil(this.destroy),
      mergeMap(
        (query) =>
          this.apollo.watchQuery<R>({
            query: gql(query),
            fetchPolicy: "network-only",
            returnPartialData: true,
            variables: { search },
          }).valueChanges
      ),
      filter((res) => !!Object.keys(res.data).length)
    );
  }

  /**
   * Utility method to listen for distinct query request
   * @param options Apollo WatchQueryOptions
   * @param cbk Callback called each time data is received
   * @deprecated Use `Apollo` api in combination with `@see buildDistinctGraph`
   */
  public loadDistinctQuery<
    T = {
      distinct: RelayPage<DistinctInfo>;
      totalCount: number;
      totalPage: number;
    }
  >(options: Partial<LoadOptions>, cbk: (res: ApolloQueryResult<T>) => void) {
    const done = new Subject();

    // API only support one field
    const field = Array.isArray(options.group)
      ? (options.group[0] as BaseGroupDescriptor<T>).selector
      : (options.group as BaseGroupDescriptor<T>).selector;
    const distinctQuery = this.buildDistinct();

    // Full filter fix
    // Using the full filter ( row + header ) will fail, because it doesn't contain logical operator
    if (options.filter) {
      const withDepth = options.filter.find((r) => typeof r === "object");
      const withOperator = options.filter.find((r) =>
        ["or", "and"].includes(r)
      );
      if (withDepth && !withOperator)
        options.filter =
          options.filter.length > 1
            ? [options.filter[0], "and", options.filter[1]]
            : options.filter;
    }

    const variables = this.mergeVariables(
      { field },
      this.mapLoadOptionsToVariables(options)
    );

    return this.query<T>(distinctQuery, {
      fetchPolicy: "cache-and-network",
      variables,
    } as WatchQueryOptions<RelayPageVariables>)
      .pipe(
        takeUntil(this.destroy),
        takeUntil(done),
        filter((res) => !!Object.keys(res.data).length)
      )
      .subscribe((res) => {
        cbk(res);
        if (!res.loading) {
          done.next(res);
          done.complete();
        }
      });
  }

  /**
   * Utility method to listen for `save()` query
   * @param options Apollo MutationOptions
   * @param depth Query fields depth
   * @param fieldsFilter Query fields filter
   * @deprecated Use watchSaveQuery_v2
   */
  public watchSaveQuery(
    options: Partial<MutationOptions>,
    depth = 1,
    fieldsFilter?: RegExp
  ) {
    return from(this.buildSave(depth, fieldsFilter)).pipe(
      takeUntil(this.destroy),
      mergeMap((query) =>
        this.apollo.mutate({
          mutation: gql(query),
          ...options,
          variables: ApiService.mapForSave(options.variables),
        } as MutationOptions)
      ),
      take(1)
    );
  }

  /**
   * Utility method to listen for `save()` query
   * @param options Apollo MutationOptions
   * @param depth Query fields depth
   * @param fieldsFilter Query fields filter
   * @deprecated Use `Apollo` api in combination with `@see buildSaveGraph`
   */
  public watchSaveQuery_v2(
    options: Partial<MutationOptions>,
    columns: Array<string>
  ) {
    return from(this.buildSave_v2(columns)).pipe(
      takeUntil(this.destroy),
      mergeMap((query) =>
        this.apollo.mutate({
          mutation: gql(query),
          ...options,
          variables: ApiService.mapForSave(options.variables),
        } as MutationOptions)
      ),
      take(1)
    );
  }

  /**
   * Utility method to listen for `saveAll()` query
   * @param options Apollo MutationOptions
   * @param depth Query fields depth
   * @param fieldsFilter Query fields filter
   * @deprecated Use `Apollo` api in combination with `@see buildSaveAllGraph`
   */
  public watchSaveAllQuery(
    options: Partial<MutationOptions>,
    depth = 1,
    fieldsFilter?: RegExp
  ) {
    return from(this.buildSaveAll(depth, fieldsFilter)).pipe(
      takeUntil(this.destroy),
      mergeMap((query) =>
        this.apollo.mutate({
          mutation: gql(query),
          fetchPolicy: "no-cache",
          ...options,
        } as MutationOptions)
      ),
      take(1)
    );
  }

  /**
   * Utility method to listen for `delete()` query
   * @param options Apollo MutationOptions
   * @deprecated Use `Apollo` api in combination with `@see buildDeleteGraph`
   */
  public watchDeleteQuery(options: Partial<MutationOptions>) {
    return this.apollo
      .mutate({
        mutation: gql(this.buildDelete()),
        fetchPolicy: "no-cache",
        ...options,
      } as MutationOptions)
      .pipe(takeUntil(this.destroy), take(1));
  }

  /** Build DX LookupStore using paginated/backend queries */
  getLookupStore<T>(
    columns: Array<string>,
    search?: string,
    params: Partial<LookupStore> = {}
  ) {
    const keyField = this.model.getKeyField() as string;
    const labelField = this.model.getLabelField() as string;
    const body = [keyField, labelField, ...columns];
    const fetchPolicy = "cache-first";
    return {
      paginate: true,
      sort: [{ selector: keyField }],
      store: this.createCustomStore({
        load: (options) =>
          this.apollo
            .query<{ [key: string]: RelayPage<T> }>({
              query: gql(this.buildGetPageGraph(body)),
              variables: this.mergeVariables(
                this.mapLoadOptionsToVariables(options),
                { search }
              ),
              fetchPolicy,
            })
            .pipe(
              map((res) =>
                res.data[`all${this.model.name}`].edges.map(({ node }) => node)
              )
            )
            .toPromise(),
        byKey: (id) =>
          this.apollo
            .query<{ [key: string]: T }>({
              query: gql(this.buildGetOneGraph(body)),
              variables: { id },
              fetchPolicy,
            })
            .pipe(map((res) => res.data[this.model.name.lcFirst()]))
            .toPromise(),
      }),
      ...params,
    } as LookupStore;
  }

  /** Build DX LookupStore using preloaded data */
  async getPreloadedLookupStore<T>(
    columns: Array<string>,
    search?: string,
    params: Partial<LookupStore> = {}
  ) {
    const data = await this.apollo
      .query<{ [key: string]: Array<T> }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
        fetchPolicy: "cache-first",
      })
      .pipe(map((res) => res.data[`all${this.model.name}List`]))
      .toPromise();
    return {
      paginate: true,
      sort: [{ selector: "id" }],
      store: new ArrayStore({ data }),
      ...params,
    } as LookupStore;
  }

  async getPreloadedDatasource<T>(
    columns: Array<string>,
    search?: string,
    params: Partial<Options> = {}
  ) {
    const data = await lastValueFrom(this.apollo
      .query<{ [key: string]: Array<T> }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
        fetchPolicy: "cache-first",
      })
      .pipe(map((res) => res.data[`all${this.model.name}List`])));
    return new DataSource({
      store: new ArrayStore({ data }),
      ...params,
    });
  }

  /**
   * It builds a graphql query that fetches a single entity of the model
   * @param body - The body of the query.
   * @returns The GraphQL query.
   */
  protected buildGetOneGraph(body: Array<string> | Set<string>) {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: this.model.name.lcFirst(),
          body,
          params: [
            {
              name: this.model.getKeyField().toString(),
              value: this.model.getKeyField().toString(),
              isVariable: true,
            },
          ],
        },
      ],
      [
        {
          name: this.model.getKeyField().toString(),
          type: this.gqlKeyType,
          isOptionnal: false,
        },
      ]
    );
  }

  /**
   * It builds a graph of queries,
   * which is a list of queries, each query being a query to get a list of entities
   * @param body - The body of the query.
   * @returns The GraphQL query.
   */
  protected buildGetListGraph(body: Array<string> | Set<string>) {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: `all${this.model.name}List`,
          body,
          params: [{ name: "search", value: "search", isVariable: true }],
        },
      ],
      [{ name: "search", type: "String", isOptionnal: true }]
    );
  }

  /**
   * It builds a graphql query that will fetch a page of data
   * @param {string} operationName - The name of the operation to build.
   * @param {string[]} body - The body of the query.
   * @returns The GraphQL query that will be executed.
   */
  protected buildGetPageGraph(body: string[] | Set<string>) {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: `all${this.model.name}`,
          body: [
            "pageInfo.startCursor",
            "pageInfo.endCursor",
            "pageInfo.hasPreviousPage",
            "pageInfo.hasNextPage",
            "totalCount",
            ...[...body].map((c) => `edges.node.${c}`),
          ],
          params: [
            { name: "search", value: "search", isVariable: true },
            { name: "pageable", value: "pageable", isVariable: true },
          ],
        },
      ],
      [
        { name: "search", type: "String", isOptionnal: true },
        { name: "pageable", type: "PaginationInput", isOptionnal: false },
      ]
    );
  }

  /**
   * It builds a graphql query that will fetch the data needed to display the summary of the list of
   * summaries
   * @param {string} operationName - The name of the operation to build.
   * @param {string[]} body - The body of the query.
   * @returns The GraphQL query that will be executed.
   */
  protected buildGetSummaryGraph(operationName: string, body: string[]) {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: operationName,
          body: [
            "pageInfo.startCursor",
            "pageInfo.endCursor",
            "pageInfo.hasPreviousPage",
            "pageInfo.hasNextPage",
            "totalCount",
            `summary(summaries:$summary, of:"${operationName}")`,
            ...body.map((c) => `edges.node.${c}`),
          ],
          params: [
            { name: "search", value: "search", isVariable: true },
            { name: "pageable", value: "pageable", isVariable: true },
          ],
        },
      ],
      [
        { name: "search", type: "String", isOptionnal: true },
        { name: "pageable", type: "PaginationInput", isOptionnal: false },
        { name: "summary", type: "[SummaryInput]", isOptionnal: false },
      ]
    );
  }

  /**
   * It builds a graphql mutation that will save a GeoModel
   * @param body - The body of the mutation.
   * @returns The GraphQL mutation.
   */
  protected buildSaveGraph(body?: Array<string>) {
    return ApiService.buildGraph(
      "mutation",
      [
        {
          name: `save${this.model.name}`,
          body,
          params: [
            {
              name: this.model.name.lcFirst(),
              value: this.model.name.lcFirst(),
              isVariable: true,
            },
          ],
        },
      ],
      [
        {
          name: this.model.name.lcFirst(),
          type: `Geo${this.model.name}Input`,
          isOptionnal: false,
        },
      ]
    );
  }

  /**
   * It builds a graphql mutation that will save a collection of GeoModel
   * @param body - The body of the mutation.
   * @returns The GraphQL mutation.
   */
  protected buildSaveAllGraph(body: Array<string>) {
    return ApiService.buildGraph(
      "mutation",
      [
        {
          name: `saveAll${this.model.name}`,
          body,
          params: [
            {
              name: `all${this.model.name}`,
              value: `all${this.model.name}`,
              isVariable: true,
            },
          ],
        },
      ],
      [
        {
          name: `all${this.model.name}`,
          type: `[Geo${this.model.name}Input]`,
          isOptionnal: false,
        },
      ]
    );
  }

  /**
   * It builds a query that returns all distinct values of a given field
   * @param body - The body of the query.
   * @returns The query is being returned as a string.
   */
  protected buildDistinctQuery(body: Array<string>) {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: `allDistinct${this.model.name}`,
          params: [
            { name: "search", value: "search", isVariable: true },
            { name: "pageable", value: "pageable", isVariable: true },
          ],
          body: [
            "pageInfo.startCursor",
            "pageInfo.endCursor",
            "pageInfo.hasPreviousPage",
            "pageInfo.hasNextPage",
            "totalCount",
            ...body,
          ],
        },
      ],
      [
        { name: "search", type: "String", isOptionnal: true },
        { name: "pageable", type: "PaginationInput", isOptionnal: false },
      ]
    );
  }

  /**
   * Build a mutation that delete an entity by his key
   */
  protected buildDeleteGraph(keyType = "String") {
    return ApiService.buildGraph(
      "mutation",
      [
        {
          name: `delete${this.model.name}`,
          params: [{ name: "id", value: "id", isVariable: true }],
        },
      ],
      [{ name: "id", type: keyType, isOptionnal: false }]
    );
  }

  /**
   * Build a distinct query graph
   */
  protected buildDistinctGraph(withDescription = false) {
    const body = [...PAGINATION_FIELDS, "edges.node.count", "edges.node.key"];

    if (withDescription) body.push("edges.node.description");

    return ApiService.buildGraph(
      "query",
      [
        {
          name: `distinct`,
          body,
          params: [
            { name: "field", value: "field", isVariable: true },
            {
              name: "descriptionField",
              value: "descriptionField",
              isVariable: true,
            },
            { name: "type", value: "type", isVariable: true },
            { name: "pageable", value: "pageable", isVariable: true },
            { name: "search", value: "search", isVariable: true },
          ],
        },
      ],
      [
        { name: "field", type: "String", isOptionnal: false },
        {
          name: "descriptionField",
          type: "String",
          isOptionnal: !withDescription,
        },
        { name: "type", type: "String", isOptionnal: false },
        { name: "pageable", type: "PaginationInput", isOptionnal: false },
        { name: "search", type: "String", isOptionnal: true },
      ]
    );
  }

  protected getDistinctDatasource(
    type,
    fieldName,
    descriptionField?,
    searchExpr?,
    fetchPol?
  ) {
    return this.apollo
      .query<{
        distinct: RelayPage<{
          count: number;
          key: string;
          description: string;
        }>;
      }>({
        query: gql(this.buildDistinctGraph(descriptionField !== undefined)),
        variables: {
          field: fieldName, // E.g. "espece.id"
          descriptionField: descriptionField ? descriptionField : null,
          type,
          search: searchExpr,
          pageable: {
            sort: { orders: [{ property: fieldName }] },
            pageNumber: 0,
            pageSize: 500,
          } as Pageable,
        },
        fetchPolicy: fetchPol,
      })
      .pipe(
        map(
          (res) =>
            new DataSource({
              store: new ArrayStore({
                data: res.data.distinct.edges,
              }),
              key: "key",
            })
        )
      );
  }

  /**
   * It builds a graphql query that fetches a single entity of the model
   * @param body - The body of the query.
   * @returns The GraphQL query.
   */
  protected buildCountGraph() {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: `count${this.model.name}`,
          params: [{ name: "search", value: "search", isVariable: true }],
        },
      ],
      [{ name: "search", type: "String", isOptionnal: true }]
    );
  }
}
