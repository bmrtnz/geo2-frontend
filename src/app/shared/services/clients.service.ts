import { Injectable } from '@angular/core';
import { Client } from '../models';
import { ApiService, RelayPage, APIRead, RelayPageVariables, APIPersist } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions, MutationOptions } from 'apollo-client';
import { map, take } from 'rxjs/operators';
import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';

@Injectable({
  providedIn: 'root'
})
export class ClientsService extends ApiService implements APIRead, APIPersist {

  baseFields = [
    'id',
    'valide',
    'raisonSocial',
    'pays { id description }',
    'ville',
    'secteur { id description }',
  ];

  allFields = [
    ...this.baseFields,
    'code',
    'siret',
    'ifco',
    'adresse1',
    'adresse2',
    'adresse3',
    'codePostal',
    'facturationRaisonSocial',
    'facturationAdresse1',
    'facturationAdresse2',
    'facturationAdresse3',
    'facturationCodePostal',
    'facturationVille',
    'facturationPays { id description }',
    'lieuFonctionEan',
    'langue { id description }',
    'tvaCee',
    'referenceCoface',
    'soumisCtifl',
    'typeClient { id description }',
    'compteComptable',
    'nbJourEcheance',
    'echeanceLe',
    'incoterm { id description }',
    'regimeTva { id description }',
    'devise { id description }',
    'commentaireHautFacture',
    'commentaireBasFacture',
    'commercial { id nomUtilisateur }',
    'assistante { id nomUtilisateur }',
    'moyenPaiement { id description }',
    'basePaiement { id description }',
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'Client');
  }

  getAll(variables?: RelayPageVariables) {
    const query = this.buildGetAll(this.baseFields);
    type Response = { allClient: RelayPage<Client> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allClient.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getDataSource(variables: RelayPageVariables = {}) {
    const query = this.buildGetAll(this.baseFields);
    type Response = { allClient: RelayPage<Client> };
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          this.pageSize = options.take;
          variables.offset = options.take;
          variables.page = options.skip / options.take;
          variables.search = options.filter ?
            this.mapDXFilterToRSQL(options.filter) :
            '';
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions)
          .pipe(
            map( res => this.asListCount(res.data.allClient)),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

  getOne(id: string) {
    const query = this.buildGetOne(this.allFields);
    type Response = { client: Client };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  save(variables: OperationVariables) {
    const mutation = this.buildSave(this.baseFields);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
