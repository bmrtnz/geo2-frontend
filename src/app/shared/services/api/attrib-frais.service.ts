import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import AttribFrais from 'app/shared/models/attrib-frais.model';
import { takeWhile } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AttribFraisService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo, AttribFrais);
  }

  getOne_v2(id: string, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ attribFrais: AttribFrais }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      })
      .pipe(takeWhile((res) => res.loading === false));
  }
}
