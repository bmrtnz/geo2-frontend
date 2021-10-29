import { Injector, NgModule } from '@angular/core';
import { defaultDataIdFromObject, from, InMemoryCache, StoreObject } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { AuthService } from './shared/services';
import { environment } from '../environments/environment';
import { Edge } from './shared/services/api.service';

const uri = environment.apiEndpoint + '/graphql';

const errorLink = onError(({ networkError }) => {
  // @ts-ignore
  if (networkError && 'status' in networkError && networkError.status === 403) {
    // @ts-ignore
    console.log(networkError.status);

    // Logout user
    GraphQLModule.injector.get(AuthService).logOut();
  }
});

export function createApollo(httpLink: HttpLink) {
  const ENTITY_KEY = 'id';
  return {
    link: from([
      errorLink,
      httpLink.create({ uri, withCredentials: true })
    ]),
    cache: new InMemoryCache({
      dataIdFromObject(responseObject: Readonly<StoreObject> | Readonly<Edge>) {
        if (responseObject?.node?.id)
          return `${responseObject.node.__typename}:${responseObject.node.id}`;
        if (responseObject?.node?.key)
          return `${responseObject.node.__typename}:${responseObject.node.key}`;
        if (responseObject?.__typename?.startsWith('Geo') && ENTITY_KEY in responseObject)
          return `${responseObject.__typename}:${responseObject[ENTITY_KEY]}`;
        return defaultDataIdFromObject(responseObject);
      },
    }),
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {
  static injector: Injector;
  constructor(injector: Injector) {
    GraphQLModule.injector = injector;
  }
}
