import { Injector, NgModule } from '@angular/core';
import { from, InMemoryCache } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { AuthService } from './shared/services';
import { environment } from '../environments/environment';

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
      httpLink.create({ uri, withCredentials: true })
    ]),
    cache: new InMemoryCache()
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
