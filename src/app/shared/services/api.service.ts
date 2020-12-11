import { OnDestroy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ApolloQueryResult, FetchResult, gql, MutationOptions, OperationVariables, WatchQueryOptions } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore, { CustomStoreOptions } from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { from, Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { filter, map, mergeMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { Model } from '../models/model';

const DEFAULT_KEY = 'id';
const DEFAULT_GQL_KEY_TYPE = 'String';
const DEFAULT_PAGE_SIZE = 10;
const BASE_FIELDS_SIZE = 7;

export type PageInfo = {
  startCursor?: string
  endCursor?: string
  hasPreviousPage?: boolean
  hasNextPage?: boolean
};

export type DistinctInfo = {
  count: number
  key: string
  items: DistinctInfo[]
};

export type RelayPage<T> = {
  edges: Edge<T>[]
  pageInfo: PageInfo
  totalCount: number
};

export type Edge<T = any> = {
  node: T,
  __typename: string,
};

export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type OrderedField = {
  property: string
  direction?: Direction
  ignoreCase?: boolean
};

export type Pageable = {
  pageNumber: number
  pageSize: number
  sort?: {
    orders: OrderedField[],
  }
};

export type RelayPageVariables = OperationVariables & {
  search?: string
  pageable: Pageable
};

export type LocateVariables = {
  pageSize?: number
  type?: string
  key: any[]
};

export interface APIRead {
  getAll?(variables?: RelayPageVariables): Observable<ApolloQueryResult<any>>;
  getOne?(id: string):
    Observable<ApolloQueryResult<any>> |
    Promise<Observable<ApolloQueryResult<any>>>;
  getDataSource(): DataSource;
}

export interface APIPersist {
  save(variables: OperationVariables):
    Promise<Observable<FetchResult<any, Record<string, any>, Record<string, any>>>> |
    Observable<FetchResult<any, Record<string, any>, Record<string, any>>>;
  delete?(variables: OperationVariables):
    Promise<Observable<FetchResult<any, Record<string, any>, Record<string, any>>>> |
    Observable<FetchResult<any, Record<string, any>, Record<string, any>>>;
}

export abstract class ApiService implements OnDestroy {

  pageSize = DEFAULT_PAGE_SIZE;
  baseFieldsSize = BASE_FIELDS_SIZE;
  keyField: string | string[];
  gqlKeyType = DEFAULT_GQL_KEY_TYPE;
  model: typeof Model & (new () => Model);
  storeConfiguration: CustomStoreOptions;
  destroy = new Subject<boolean>();

  constructor(
    private apollo: Apollo,
    model: typeof Model & (new () => Model),
  ) {
    this.model = model;
    this.keyField = this.model.getKeyField() || DEFAULT_KEY;
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }

  /**
   * Map RelayPage as ArrayStore DataSource
   * @param relayPage Input RelayPage
   */
  public asDataSource<T = any>(relayPage: RelayPage<T>) {
    return new DataSource({
      store: this.asArrayStore(relayPage),
      paginate: true,
      pageSize: this.pageSize,
    });
  }

  /**
   * Map RelayPage as ArrayStore
   * @param relayPage Input RelayPage
   */
  public asArrayStore<T = any>(relayPage: RelayPage<T>) {
    return new ArrayStore({
      key: this.keyField,
      data: this.asList(relayPage),
    });
  }

  /**
   * Map RelayPage as Object
   * @param relayPage Input RelayPage
   */
  public asListCount<T = any>(relayPage: RelayPage<T>) {
    return {
      data: this.asList(relayPage),
      totalCount: relayPage.totalCount,
    };
  }

  /**
   * Map RelayPage as Model instance
   * @param relayPage Input RelayPage
   */
  public asInstancedListCount<T = any>(relayPage: RelayPage<T>) {
    return {
      data: this.asList(relayPage).map(v => new this.model(v)),
      totalCount: relayPage.totalCount,
    };
  }

  /**
   * Map RelayPage as Array
   * @param relayPage Input RelayPage
   */
  public asList<T = any>(relayPage: RelayPage<T>) {
    return relayPage.edges.map(({ node }) => node);
  }

  /**
   * Filter dirty controls and map value
   * @param controls Form controls
   */
  public extractDirty(controls: {
    [key: string]: AbstractControl;
  }) {
    const clean = (value) => {
      if (value && value.__typename)
        for (const field of Object.keys(value))
          if (field !== this.keyField)
            delete value[field];
      return value;
    };
    return Object.entries(controls)
      .filter(([key, control]) => key === this.keyField || control.dirty)
      .map(([key, control]) => {
        const value = JSON.parse(JSON.stringify(control.value));
        const cleanValue = typeof value === 'object' && value && value.length !== undefined ?
          (value as []).map(v => clean(v)) :
          clean(value);
        return { [key]: cleanValue };
      })
      .reduce((acm, current) => ({ ...acm, ...current }));
  }

  /**
   * Locate page and index of entity in paginated list
   * @param inputVariables Page location variables
   */
  public locatePage(inputVariables: LocateVariables) {
    const type = `Geo${this.model.name}`;
    const pageSize = this.pageSize;
    const query = this.buildLocate();

    return this.
      query<{ locatePage: number }>(query, {
        variables: { pageSize, type, ...inputVariables },
      } as WatchQueryOptions<any>)
      .pipe(
        map(res => res.data),
        take(1),
      );
  }

  /**
   * Fill DataSource from RelayPage
   * @param relayPage Input RelayPage
   * @param dataSource Input Datasource
   */
  protected fillDataSource<T = any>(relayPage: RelayPage<T>, dataSource: DataSource) {
    this.asList(relayPage)
      .forEach((entity: T) => (dataSource.store() as ArrayStore).insert(entity));
    dataSource.reload();
    return dataSource;
  }

  /**
   * Run GraphQL query
   * @param gqlQuery GraphQL query
   * @param options Query options
   */
  protected query<T>(gqlQuery: string, options?: WatchQueryOptions) {
    return this.apollo
      .watchQuery<T>({
        query: gql(gqlQuery),
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
        ...options,
      })
      .valueChanges;
  }

  /**
   * Run GraphQL query ( paginated )
   * @param gqlQuery GraphQL query
   * @param fetchNext Do next fetch callback
   * @param options Query options
   */
  protected queryAll<T>(
    gqlQuery: string,
    fetchNext: (res: ApolloQueryResult<T>) => boolean,
    options?: WatchQueryOptions,
  ) {
    const nextPage = (observer: Subscriber<ApolloQueryResult<T>>, page = 0) => this
      .query<T>(gqlQuery, { ...options, variables: { ...options.variables, page } })
      .pipe(take(1))
      .subscribe((res) => {
        observer.next(res);
        if (fetchNext(res)) nextPage(observer, page + 1);
        else observer.complete();
      });
    return new Observable<ApolloQueryResult<T>>(observer => nextPage(observer));
  }

  /**
   * Run GraphQL mutation
   * @param gqlMutation GraphQL mutation
   */
  protected mutate(gqlMutation: string, options?: MutationOptions) {
    return this.apollo
      .mutate({
        mutation: gql(gqlMutation),
        ...options,
      })
      .pipe(take(1));
  }

  /**
   * Build paginated query
   * @param depth Sub model selection depth
   * @param filter Regexp field filter
   */
  protected async buildGetAll(depth?: number, filter?: RegExp) {
    const operation = `all${this.model.name}`;
    const alias = this.withUpperCaseFirst(operation);
    return `
      query ${alias}($search: String, $pageable: PaginationInput!) {
        ${operation}(search:$search, pageable:$pageable) {
          edges {
            node {
              ${await this.model.getGQLFields(depth, filter, null, {noList: true}).toPromise()}
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
   * @param filter Regexp field filter
   */
  protected async buildGetOne(depth?: number, filter?: RegExp) {
    const operation = this.withLowerCaseFirst(this.model.name);
    const alias = this.withUpperCaseFirst(operation);
    return `
      query ${alias}($${this.keyField}: ${this.gqlKeyType}!) {
        ${operation}(${this.keyField}:$${this.keyField}) {
          ${await this.model.getGQLFields(depth, filter).toPromise()}
        }
      }
    `;
  }

  /**
   * Build save query
   * @param depth Save response depth
   * @param filter Fields filter
   */
  protected async buildSave(depth?: number, filter?: RegExp) {
    const entity = this.withLowerCaseFirst(this.model.name);
    const operation = `save${this.model.name}`;
    const type = `Geo${this.model.name}Input`;
    const alias = this.withUpperCaseFirst(operation);
    return `
      mutation ${alias}($${entity}: ${type}!) {
        ${operation}(${entity}: $${entity}) {
          ${await this.model.getGQLFields(depth, filter).toPromise()}
        }
      }
    `;
  }

  /**
   * Build delete query
   */
  protected buildDelete() {
    const entity = this.withLowerCaseFirst(this.model.name);
    const type = `Geo${this.model.name}Input`;
    const operation = `delete${this.model.name}`;
    const alias = this.withUpperCaseFirst(operation);
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
    const alias = this.withUpperCaseFirst(operation);
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
  protected createCustomStore(options?: CustomStoreOptions) {
    this.storeConfiguration = options;
    return new CustomStore({
      key: this.keyField,
      ...options,
    });
  }

  /**
   * Build and prepare distinct query
   * @param options DX LoadOptions object
   * @deprecated Use 'watchDistinctQuery' instead
   */
  protected getDistinct(options: LoadOptions) {

    // API only support one field
    const field = options.group.length ? options.group[0].selector : options.group.selector;
    const distinctQuery = this.buildDistinct();
    type DistinctResponse = { distinct: RelayPage<DistinctInfo> };

    // Full filter fix
    // Using the full filter ( row + header ) will fail, because it doesn't contain logical operator
    if (options.filter) {
      const withDepth = options.filter
        .find(res => typeof res === 'object');
      const withOperator = options.filter
        .find(res => ['or', 'and'].includes(res));
      if (withDepth && !withOperator)
        options.filter = [options.filter[0], 'and', options.filter[1]];
    }

    const variables = this.mergeVariables(
      { field },
      this.mapLoadOptionsToVariables(options),
    );
    return this.
      query<DistinctResponse>(distinctQuery, { variables } as WatchQueryOptions<any>)
      .pipe(
        map(res => this.asListCount(res.data.distinct)),
        take(1),
      );
  }

  /**
   * Build locate query
   */
  protected buildLocate() {
    const operation = `locatePage`;
    const alias = this.withUpperCaseFirst(operation);
    return `
      query ${alias}($pageSize: Int!, $type: String!, $key: [String]!) {
        ${operation}(pageSize: $pageSize, type: $type, key: $key)
      }
    `;
  }

  /**
   * Transform first character to uppercase
   * @param param0 value
   */
  private withUpperCaseFirst([first, ...rest]: string) {
    return [first.toUpperCase(), ...rest].join('');
  }

  /**
   * Transform first character to lowercase
   * @param param0 value
   */
  private withLowerCaseFirst([first, ...rest]: string) {
    return [first.toLowerCase(), ...rest].join('');
  }

  /**
   * Map DX Search to DX Filter
   * @param options DX CustomSource load options
   */
  protected mapDXSearchToDXFilter(options: LoadOptions) {
    return typeof options.searchExpr === 'object' ?
      (options.searchExpr as [])
        .map(expr => [expr, options.searchOperation, options.searchValue])
        .join('-or-')
        .split('-')
        .map((value: any) => {
          const mapped = value.split(',');
          return mapped.length > 1 ? mapped : mapped.shift();
        }) :
      [options.searchExpr, options.searchOperation, options.searchValue];
  }

  /**
   * Map DX filters to RSQL
   * @param dxFilter DX filters arrays
   */
  protected mapDXFilterToRSQL(dxFilter: any[]) {

    // Avoid modify original
    let clonedFilter = JSON.parse(JSON.stringify(dxFilter));

    // Make filter structure consistant: [string|[]]
    if (typeof clonedFilter[0] === 'string')
      clonedFilter = [clonedFilter];

    const next = (filter: any[], index = 0) => {
      const node = filter[index];
      if (typeof node === 'object') { // comparison

        // Deep filter
        if (typeof node[0] === 'object') {
          filter[index] = `(${next(node).join(' ')})`;
        } else {
          /* tslint:disable-next-line:prefer-const */
          let [selector, operator, value] = node;
          const dxOperator = operator;

          // Map operator
          switch (operator) {
            case '=': operator = '=='; break;
            case 'contains': operator = '=ilike='; break;
            case 'startswith': operator = '=ilike='; break;
            case 'endswith': operator = '=ilike='; break;
            case 'notcontains': operator = '=inotlike='; break;
            case '<>': operator = '!='; break;
          }

          // Map value
          if (selector === 'this') {
            const mappedFilter = Object
              .entries(value)
              .filter(([key]) => key !== '__typename')
              .map(([k, v]) => JSON.stringify([k, '=', v]))
              .join(`¤${JSON.stringify('and')}¤`)
              .split('¤')
              .map(v => JSON.parse(v));
            filter[index] = this.mapDXFilterToRSQL(mappedFilter);
          } else {

            if (['contains', 'notcontains'].includes(dxOperator))
              value = `%${value}%`;
            if (dxOperator === 'startswith') value = `${value}%`;
            if (dxOperator === 'endswith') value = `%${value}`;
            value = JSON.stringify(value);
            filter[index] = [selector, operator, value].join('');

          }
        }
      } else filter[index] = node;
      if (index < filter.length - 1)
        return next(filter, index + 1);
      else return filter;
    };
    return next(clonedFilter).flat().join(' ');
  }

  protected mapLoadOptionsToVariables(options: LoadOptions) {
    const variables: RelayPageVariables = {
      pageable: {
        pageNumber: options.skip / options.take || 0,
        pageSize: options.take || DEFAULT_PAGE_SIZE,
      },
    };
    this.pageSize = options.take;

    // Search / filter
    const search = [];
    if (options.filter) // row/header filters
      search.push(this.mapDXFilterToRSQL(options.filter));
    if (options.searchValue) // global search
      search.push(this
        .mapDXFilterToRSQL(this.mapDXSearchToDXFilter(options)));
    variables.search = search
      .map(v => `(${v})`)
      .join(' and ');

    // Sort
    if (options.sort)
      variables.pageable.sort = {
        orders: options.sort
          .map(({ selector: property, desc }) => ({
            property,
            direction: desc ? Direction.DESC : Direction.ASC
          } as OrderedField)),
      };

    return variables;
  }

  /**
   * Merge variables, last item as priority if merge is impossible
   * @param variables Variables list
   */
  protected mergeVariables(...variables: OperationVariables[] | RelayPageVariables[]) {
    return variables.reduce((acm, current) => ({
      ...acm,
      ...current,
      // search: `${ acm.search || '' }${ current.search ? `and ${ current.search }` : '' }`,
      search: [acm ? acm.search : '', current ? current.search : '']
        .filter(v => v)
        .map(v => `(${v})`)
        .join(' and '),
    }));
  }

  /**
   * Utility method to listen for paginated query request
   * @param query GraphQL query
   * @param options Apollo WatchQueryOptions
   * @param cbk Callback called each time data is received
   */
  protected loadPaginatedQuery<T>(
    query: string,
    options: Partial<WatchQueryOptions<RelayPageVariables>>,
    cbk: (res: ApolloQueryResult<T>) => void,
  ) {
    const done = new Subject<ApolloQueryResult<T>>();
    this.query<T>(query, {
      fetchPolicy: 'cache-and-network',
      ...options,
    } as WatchQueryOptions<RelayPageVariables>)
    .pipe(
      takeUntil(this.destroy),
      filter( res => !!Object.keys(res.data).length),
      takeUntil(done),
    )
    .subscribe(res => {
      cbk(res);
      done.next(res);
      if (!res.loading)
        done.complete();
    });
    return done;
  }

  /**
   * Utility method to listen for `getOne()` query
   * @param options Apollo WatchQueryOptions
   */
  protected watchGetOneQuery<T>(
    options: Partial<WatchQueryOptions<OperationVariables>>,
  ) {
    const done = new Subject<ApolloQueryResult<T>>();
    from(this.buildGetOne())
    .pipe(
      takeUntil(this.destroy),
      takeUntil(done),
      mergeMap( query => this.query<T>(query, {
        fetchPolicy: 'cache-and-network',
        ...options,
      } as WatchQueryOptions)),
      filter( res => !!Object.keys(res.data).length),
    )
    .subscribe(res => {
      done.next(res);
      if (!res.loading)
        done.complete();
    });
    return done;
  }

  /**
   * Utility method to listen for distrinct query request
   * @param options Apollo WatchQueryOptions
   * @param cbk Callback called each time data is received
   */
  protected loadDistinctQuery<T = { distinct: RelayPage<DistinctInfo> }>(
    options: Partial<LoadOptions>,
    cbk: (res: ApolloQueryResult<T>) => void,
  ) {
    const done = new Subject();

    // API only support one field
    const field = options.group.length ? options.group[0].selector : options.group.selector;
    const distinctQuery = this.buildDistinct();

    // Full filter fix
    // Using the full filter ( row + header ) will fail, because it doesn't contain logical operator
    if (options.filter) {
      const withDepth = options.filter
        .find(r => typeof r === 'object');
      const withOperator = options.filter
        .find(r => ['or', 'and'].includes(r));
      if (withDepth && !withOperator)
        options.filter = [options.filter[0], 'and', options.filter[1]];
    }

    const variables = this.mergeVariables(
      { field },
      this.mapLoadOptionsToVariables(options),
    );

    return this.query<T>(distinctQuery, {
      fetchPolicy: 'cache-and-network',
      variables,
    } as WatchQueryOptions<RelayPageVariables>)
    .pipe(
      takeUntil(this.destroy),
      takeUntil(done)
    )
    .subscribe( res => {
      cbk(res);
      if (!res.loading) {
        done.next(res);
        done.complete();
      }
    });
  }

}
