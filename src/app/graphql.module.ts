import { Injector, NgModule } from "@angular/core";
import {
    defaultDataIdFromObject,

    InMemoryCache,
    StoreObject
} from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";
import { APOLLO_OPTIONS } from "apollo-angular";
import { HttpLink } from "apollo-angular/http";
import { environment } from "../environments/environment";
import { GridConfig } from "./shared/models";
import { AuthService } from "./shared/services";
import { GridsConfigsService } from "./shared/services/api/grids-configs.service";

const uri = environment.apiEndpoint + "/graphql";

const errorLink = onError(({ networkError }) => {
    // @ts-ignore
    if (networkError?.status === 403) {
        // Logout user
        GraphQLModule.injector.get(AuthService).logOut();
    }
});

export function createApollo(httpLink: HttpLink) {
    const ENTITY_KEY = "id";
    return {
        link: errorLink.concat(httpLink.create({ uri, withCredentials: true })),
        cache: new InMemoryCache({
            dataIdFromObject(responseObject: Readonly<StoreObject>) {
                if (responseObject?.__typename === "GeoGridConfig")
                    return GridsConfigsService.getCacheID(
                        responseObject as unknown as GridConfig,
                    );

                if (
                    responseObject?.__typename?.startsWith("Geo") &&
                    ENTITY_KEY in responseObject
                )
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
