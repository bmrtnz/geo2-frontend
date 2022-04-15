import { Injectable } from "@angular/core";
import DeviseRef from "app/shared/models/devise-ref.model";
import { Apollo, gql } from "apollo-angular";
import { ApiService } from "../api.service";
import { takeWhile } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class DevisesRefsService extends ApiService {
    constructor(apollo: Apollo) {
        super(apollo, DeviseRef);
        this.gqlKeyType = "GeoDeviseRefKeyInput";
    }

    getOne(id: string, columns: Array<string>) {
        return this.apollo
            .query<{ deviseRef: DeviseRef }>({
                query: gql(this.buildGetOneGraph(columns)),
                variables: { id },
            })
            .pipe(takeWhile((res) => !res.loading));
    }

    getList(search: string, columns: Array<string>) {
        return this.apollo
            .query<{ allDeviseRefList: DeviseRef[] }>({
                query: gql(this.buildGetListGraph(columns)),
                variables: { search },
            })
            .pipe(takeWhile((res) => !res.loading));
    }
}
