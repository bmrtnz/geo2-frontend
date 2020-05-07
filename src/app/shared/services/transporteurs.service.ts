import { Injectable } from '@angular/core';
import { Transporteur } from '../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables, MutationOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';

@Injectable({
  providedIn: 'root'
})
export class TransporteursService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'raisonSocial',
    'pays { id description }',
    'ville',
  ];

  fullFields = [
    ...this.baseFields,
    'valide',
    'langue { id description }',
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

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'Transporteur');
  }

  getOne(id: string) {
    const query = this.buildGetOne(this.fullFields);
    type Response = { transporteur: Transporteur };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    const query = this.buildGetAll(this.baseFields);
    type Response = { allTransporteur: RelayPage<Transporteur> };
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          variables = {
            ...variables,
            ...this.mapLoadOptionsToVariables(options),
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allTransporteur)),
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
