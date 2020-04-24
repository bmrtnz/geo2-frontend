import { Injectable } from '@angular/core';
import { Fournisseur } from '../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class FournisseursService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'raisonSocial', 'pays { id description }', 'ville' ];
    const query = this.buildGetAll('allFournisseur', fields);
    type Response = { allFournisseur: RelayPage<Fournisseur> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allFournisseur.pageInfo.hasNextPage,
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
      'stockActif',
      'adresse1',
      'adresse2',
      'adresse3',
      'codePostal',
      'latitude',
      'longitude',
      'bureauAchat { id raisonSocial }',
      'lieuFonctionEAN',
      'langue { id description }',
      'tvaCee',
      'type { id description }',
      'compteComptable',
      'idTracabilite',
      'agrementBW',
      'codeStation',
      'nbJourEcheance',
      'echeanceLe',
      'regimeTva { id description }',
      'devise { id description }',
      'moyenPaiement { id description }',
      'basePaiement { id description }',
      'formeJuridique',
      'siretAPE',
      'rcs',
    ];
    const query = this.buildGetOne('fournisseur', id, fields);
    type Response = { fournisseur: Fournisseur };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

}
