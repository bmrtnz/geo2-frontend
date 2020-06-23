import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ApolloQueryResult, WatchQueryOptions, MutationOptions, OperationVariables } from 'apollo-client';
import { Observable, Subscriber } from 'rxjs';
import { FetchResult } from 'apollo-link';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import CustomStore, { CustomStoreOptions } from 'devextreme/data/custom_store';
import { take, map } from 'rxjs/operators';
import { AbstractControl } from '@angular/forms';
import { LoadOptions } from 'devextreme/data/load_options';
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
  edges: { node: T, __typename: string }[]
  pageInfo: PageInfo
  totalCount: number
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

export interface APIRead {
  getAll?(variables?: RelayPageVariables): Observable<ApolloQueryResult<any>>;
  getOne?(id: string): Observable<ApolloQueryResult<any>>;
  getDataSource(variables?: RelayPageVariables): DataSource;
}

export interface APIPersist {
  save(variables: OperationVariables): Observable<FetchResult<any, Record<string, any>, Record<string, any>>>;
}

export abstract class ApiService {

  pageSize = DEFAULT_PAGE_SIZE;
  baseFieldsSize = BASE_FIELDS_SIZE;
  keyField: string;
  gqlKeyType = DEFAULT_GQL_KEY_TYPE;
  model: typeof Model;
  storeConfiguration: CustomStoreOptions;

  constructor(
    private apollo: Apollo,
    model: typeof Model,
  ) {
    this.model = model;
    this.keyField = this.model.getKeyField() || DEFAULT_KEY;
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
   * Map RelayPage as Object for CustomStore
   * @param relayPage Input RelayPage
   */
  public asListCount<T = any>(relayPage: RelayPage<T>) {
    return {
      data: this.asList(relayPage),
      totalCount: relayPage.totalCount,
    };
  }

  /**
   * Map RelayPage as Array
   * @param relayPage Input RelayPage
   */
  public asList<T = any>(relayPage: RelayPage<T>) {
    return relayPage.edges.map(({node}) => node );
  }

  /**
   * Filter dirty controls and map value
   * @param controls Form controls
   */
  public extractDirty(controls: {
    [key: string]: AbstractControl;
  }) {
    return Object.entries(controls)
    .filter(([key, control]) => key === this.keyField || control.dirty )
    .map(([key, control]) => {
      const value = JSON.parse(JSON.stringify(control.value));
      if (value.__typename)
        for (const field of Object.keys(value))
          if (field !== 'id')
            delete value[field];
      return { [key]: value };
    })
    .reduce((acm, current) => ({...acm, ...current}));
  }

  /**
   * Fill DataSource from RelayPage
   * @param relayPage Input RelayPage
   * @param dataSource Input Datasource
   */
  protected fillDataSource<T = any>(relayPage: RelayPage<T>, dataSource: DataSource) {
    this.asList( relayPage )
    .forEach( (entity: T) => (dataSource.store() as ArrayStore).insert(entity));
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
      ...options,
    })
    .valueChanges
    .pipe(take(1));
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
    .query<T>(gqlQuery, {...options, variables: {...options.variables, page}})
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
  protected buildGetAll(depth?: number, filter?: RegExp) {
    const operation = `all${this.model.name}`;
    const alias = this.withUpperCaseFirst(operation);
    return `
      query ${ alias }($search: String, $pageable: PaginationInput!) {
        ${ operation }(search:$search, pageable:$pageable) {
          edges {
            node {
              ${ this.model.getGQLFields(depth, filter) }
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
  protected buildGetOne(depth?: number, filter?: RegExp) {
    const operation = this.withLowerCaseFirst(this.model.name);
    const alias = this.withUpperCaseFirst(operation);
    return `
      query ${ alias }($${ this.keyField }: ${ this.gqlKeyType }!) {
        ${ operation }(${ this.keyField }:$${ this.keyField }) {
          ${ this.model.getGQLFields(depth, filter) }
        }
      }
    `;
  }

  /**
   * Build save query
   * @param depth Save response depth
   * @param filter Fields filter
   */
  protected buildSave(depth?: number, filter?: RegExp) {
    const entity = this.withLowerCaseFirst(this.model.name);
    const operation = `save${this.model.name}`;
    const type = `Geo${this.model.name}Input`;
    const alias = this.withUpperCaseFirst(operation);
    return `
      mutation ${ alias }($${ entity }: ${ type }!) {
        ${ operation }(${ entity }: $${ entity }) {
          ${ this.model.getGQLFields(depth, filter) }
        }
      }
    `;
  }

  /**
   * Build delete query
   */
  protected buildDelete() {
    const operation = `delete${this.model.name}`;
    const alias = this.withUpperCaseFirst(operation);
    return `
      mutation ${ alias }($${ this.keyField }: ${ this.gqlKeyType }!) {
        ${ operation }(${ this.keyField }: $${ this.keyField }) {
          id
        }
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
      query ${ alias }($field: String!, $search: String, $pageable: PaginationInput!) {
        ${ operation }(type: "${ type }", field: $field, search: $search, pageable: $pageable) {
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
      key: options.key || this.keyField,
      ...options,
    });
  }

  /**
   * Build and prepare distinct query
   * @param options DX LoadOptions object
   * @param inputVariables User variables
   */
  protected getDistinct(options: LoadOptions, inputVariables?: OperationVariables | RelayPageVariables) {
    const field = options.group[0].selector;
    const distinctQuery = this.buildDistinct();
    type DistinctResponse = { distinct: RelayPage<DistinctInfo> };
    const distinctVariables = {
      ...inputVariables,
      field,
      ...this.mapLoadOptionsToVariables(options),
    };
    return this.
    query<DistinctResponse>(distinctQuery, {
      variables: distinctVariables,
    } as WatchQueryOptions<any>)
    .pipe(
      map( res => this.asListCount(res.data.distinct)),
      take(1),
    );
  }

  /**
   * Transform first character to uppercase
   * @param param0 value
   */
  private withUpperCaseFirst([first, ...rest]: string) {
    return [ first.toUpperCase(), ...rest ].join('');
  }

  /**
   * Transform first character to lowercase
   * @param param0 value
   */
  private withLowerCaseFirst([first, ...rest]: string) {
    return [ first.toLowerCase(), ...rest ].join('');
  }

  /**
   * Map DX Search to DX Filter
   * @param options DX CustomSource load options
   */
  protected mapDXSearchToDXFilter(options: LoadOptions) {
    return typeof options.searchExpr === 'object' ?
      (options.searchExpr as [])
      .map( expr => [expr, options.searchOperation, options.searchValue])
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

    if (typeof dxFilter[0] === 'string')
      dxFilter = [dxFilter];

    const next = (filter: any[], index = 0) => {
      const node = filter[index];
      if (typeof node === 'object') { // comparison

        // Deep filter
        if (typeof node[0] === 'object')
          filter[index] = next(node).join(' ');
        else {
          const [selector, operator, value] = node;

          // Map operator
          let mappedOperator = '';
          switch (operator) {
            case '=': mappedOperator = '=='; break;
            case 'contains': mappedOperator = '=ilike='; break;
            case 'startswith': mappedOperator = '=ilike='; break;
            case 'endswith': mappedOperator = '=ilike='; break;
            case 'notcontains': mappedOperator = '=inotlike='; break;
            case '<>': mappedOperator = '!='; break;
            default: mappedOperator = operator; break;
          }

          // Map value
          let mappedValue = value;
          if (['contains', 'notcontains'].includes(operator))
            mappedValue = `%${mappedValue}%`;
          if (operator === 'startswith') mappedValue = `${mappedValue}%`;
          if (operator === 'endswith') mappedValue = `%${mappedValue}`;
          mappedValue = parseInt(value, 2) || `"${mappedValue}"`;

          filter[index] =  [selector, mappedOperator, mappedValue].join('');
        }
      } else filter[index] =  node;
      if (index < filter.length - 1)
        return next(filter, index + 1);
      else return filter;
    };
    return next(dxFilter).flat().join(' ');
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
    variables.search = null;
    if (options.filter)
      variables.search = this.mapDXFilterToRSQL(options.filter);
    if (options.searchValue)
      variables.search = this
      .mapDXFilterToRSQL(this.mapDXSearchToDXFilter(options));

    // Sort
    if (options.sort)
      variables.pageable.sort = {
        orders: options.sort
        .map(({selector: property, desc}) => ({
          property,
          direction: desc ? Direction.DESC : Direction.ASC
        } as OrderedField)),
      };

    return variables;
  }

}
