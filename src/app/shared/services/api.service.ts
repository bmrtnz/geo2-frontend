import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ApolloQueryResult, WatchQueryOptions, MutationOptions, OperationVariables } from 'apollo-client';
import { Observable, Subscriber } from 'rxjs';
import { FetchResult } from 'apollo-link';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

export type PageInfo = {
  startCursor?: string;
  endCursor?: string;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
};

export type RelayPage<T> = {
  edges: { node: T, __typename: string }[];
  pageInfo: PageInfo;
};

export type RelayPageVariables = OperationVariables & {
  search?: string;
  page?: number;
  offset?: number;
};

export interface APIRead {
  getAll(variables?: RelayPageVariables): Observable<ApolloQueryResult<any>>;
  getOne(id: string): Observable<ApolloQueryResult<any>>;
  getDataSource?(variables?: OperationVariables): Observable<DataSource>;
}

export interface APIPersist {
  update?(variables: OperationVariables): Observable<FetchResult<any, Record<string, any>, Record<string, any>>>;
}

export abstract class ApiService {

  keyField = 'id';
  pageSize = 10;

  constructor(
    private apollo: Apollo,
  ) { }

  /**
   * Map RelayPage as DataSource
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
   * Map RelayPage as Array
   * @param relayPage Input RelayPage
   */
  public asList<T = any>(relayPage: RelayPage<T>) {
    return relayPage.edges.map(({node}) => node );
  }

  /**
   * Run GraphQL query
   * @param gqlQuery GraphQL query
   */
  protected query<T>(gqlQuery: string, options?: WatchQueryOptions) {
    return this.apollo
    .watchQuery<T>({
      query: gql(gqlQuery),
      ...options,
    })
    .valueChanges;
  }

  protected queryAll<T>(
    gqlQuery: string,
    fetchNext: (res: ApolloQueryResult<T>) => boolean,
    options?: WatchQueryOptions,
  ) {
    const nextPage = (observer: Subscriber<ApolloQueryResult<T>>, page = 0) => this
    .query<T>(gqlQuery, {...options, variables: {...options.variables, page}})
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
    });
  }

  /**
   * Build paginated query
   * @param operation Operation name
   * @param fields Fetched fields
   */
  protected buildGetAll(operation: string, fields: string[]) {
    const query = this.operationAsQueryName(operation);
    return `
    query ${ query }($search: String, $page: Int = 0, $offset: Int = ${this.pageSize}) {
      ${ operation }(search:$search, page:$page, offset:$offset) {
        edges {
          node {
            ${ fields.join('\n') }
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
    }
  `;
  }

  protected buildGetOne(operation: string, id: string|number, fields: string[]) {
    const query = this.operationAsQueryName(operation);
    return `
    query ${ query }($id: String!) {
      ${ operation }(${ this.keyField }:$id) {
        ${ fields.join('\n') }
      }
    }
  `;
  }

  /**
   * Create DX Datasource with configured key
   */
  protected createDataSource() {
    return new DataSource({
      store: new ArrayStore({
        key: this.keyField,
      }),
    });
  }

  /**
   * Create query name from operation name
   * @param param0 operation name
   */
  private operationAsQueryName([first, ...rest]: string) {
    return [ first.toUpperCase(), ...rest ].join('');
  }

}
