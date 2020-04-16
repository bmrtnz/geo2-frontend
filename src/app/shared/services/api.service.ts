import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ApolloQueryResult, WatchQueryOptions, MutationOptions, OperationVariables } from 'apollo-client';
import { Observable } from 'rxjs';
import { FetchResult } from 'apollo-link';

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
  getAll(variables?: RelayPageVariables): Observable<ApolloQueryResult<unknown>>;
  getOne(id: string): Observable<ApolloQueryResult<unknown>>;
}

export interface APIPersist {
  update?(variables: OperationVariables): Observable<FetchResult<unknown, Record<string, any>, Record<string, any>>>;
}

export abstract class ApiService {

  keyField = 'id';

  constructor(
    private apollo: Apollo,
  ) { }

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
    query ${ query }($search: String, $page: Int = 0, $offset: Int = 10) {
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
   * Create query name from operation name
   * @param param0 operation name
   */
  private operationAsQueryName([first, ...rest]: string) {
    return [ first.toUpperCase(), ...rest ].join('');
  }

}
