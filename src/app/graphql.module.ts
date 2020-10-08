import { Injector, NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from 'environments/environment';
import { from } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { AuthService } from './shared/services';

const uri = environment.apiEndpoint;

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
  return {
    link: from([
      errorLink,
      httpLink.create({uri, withCredentials: true})
    ]),
    cache: new InMemoryCache()
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
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
