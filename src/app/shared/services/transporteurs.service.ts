import { Injectable } from '@angular/core';
import { Transporteur } from '../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class TransporteursService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'raisonSocial', 'pays { id description }', 'ville' ];
    const query = this.buildGetAll('allTransporteur', fields);
    type Response = { allTransporteur: RelayPage<Transporteur> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allTransporteur.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const fields = [
      'id',
      'valide',
      'langue { id description }',
      'raisonSocial',
      'pays { id description }',
      'ville',
      'adresse1',
      'adresse2',
      'adresse3',
      'codePostal',
      'lieuFonctionEan',
      'tvaCee',
      'clientRaisonSocial { id raisonSocial }',
      'compteComptable',
      'nbJourEcheance',
      'echeanceLe',
      'regimeTva { id description }',
      'devise { id description }',
      'moyenPaiement { id description }',
      'basePaiement { id description }',
    ];
    const query = this.buildGetOne('transporteur', id, fields);
    type Response = { transporteur: Transporteur };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

}
