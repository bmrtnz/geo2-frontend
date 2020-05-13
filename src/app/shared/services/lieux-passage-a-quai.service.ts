import { Injectable } from '@angular/core';
import { LieuPassageAQuai } from '../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables, MutationOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';

@Injectable({
  providedIn: 'root'
})
export class LieuxPassageAQuaiService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'raisonSocial',
    'pays { id description }',
    'ville',
  ];

  fullFields = [
    ...this.baseFields,
    'valide',
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

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'LieuPassageAQuai');
  }

  getOne(id: string) {
    const query = this.buildGetOne(this.fullFields);
    type Response = { lieuPassageAQuai: LieuPassageAQuai };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getDataSource(inputVariables?: OperationVariables | RelayPageVariables) {
    const query = this.buildGetAll(this.baseFields);
    type Response = { allLieuPassageAQuai: RelayPage<LieuPassageAQuai> };
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const variables = {
            ...inputVariables,
            ...this.mapLoadOptionsToVariables(options),
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allLieuPassageAQuai)),
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
