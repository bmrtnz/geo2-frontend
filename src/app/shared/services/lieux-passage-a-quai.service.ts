import { Injectable } from '@angular/core';
import { LieuPassageAQuai } from '../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class LieuxPassageAQuaiService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'raisonSocial', 'pays { id description }', 'ville' ];
    const query = this.buildGetAll('allLieuPassageAQuai', fields);
    type Response = { allLieuPassageAQuai: RelayPage<LieuPassageAQuai> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allLieuPassageAQuai.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const fields = [
      'id',
      'valide',
      'raisonSocial',
      'pays { id description }',
      'ville',
      'adresse1',
      'adresse2',
      'adresse3',
      'codePostal',
      'lieuFonctionEan',
      'langue { id description }',
      'tvaCee',
      'nbJourEcheance',
      'echeanceLe',
      'regimeTva { id description }',
      'devise { id description }',
      'moyenPaiement { id description }',
      'basePaiement { id description }',
    ];
    const query = this.buildGetOne('lieuPassageAQuai', id, fields);
    type Response = { lieuPassageAQuai: LieuPassageAQuai };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

}
