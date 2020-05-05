import { Injectable } from '@angular/core';
import { Fournisseur } from '../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables, MutationOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';

@Injectable({
  providedIn: 'root'
})
export class FournisseursService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'raisonSocial',
    'pays { id description }',
    'ville',
  ];

  fullFields = [
    ...this.baseFields,
    'valide',
    'stockActif',
    'adresse1',
    'adresse2',
    'adresse3',
    'codePostal',
    'latitude',
    'longitude',
    'bureauAchat { id raisonSocial }',
    'lieuFonctionEan ',
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

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'Fournisseur');
  }

  getAll(variables?: RelayPageVariables) {
    const query = this.buildGetAll(this.baseFields);
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
    const query = this.buildGetOne(this.fullFields);
    type Response = { fournisseur: Fournisseur };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getDataSource(variables: RelayPageVariables = {}) {
    const query = this.buildGetAll(this.baseFields);
    type Response = { allFournisseur: RelayPage<Fournisseur> };
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          this.pageSize = options.take;
          variables.offset = options.take;
          variables.page = options.skip / options.take;
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions)
          .pipe(
            map( res => this.asListCount(res.data.allFournisseur)),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

  save(variables: OperationVariables) {
    const mutation = this.buildSave(this.baseFields);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
