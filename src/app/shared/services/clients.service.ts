import { Injectable } from '@angular/core';
import { Client } from '../models';
import { ApiService, RelayPage, APIRead, RelayPageVariables } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import { map } from 'rxjs/operators';
import ArrayStore from 'devextreme/data/array_store';

@Injectable({
  providedIn: 'root'
})
export class ClientsService extends ApiService implements APIRead {

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
    'lieuFonctionEAN',
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
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const query = this.buildGetAll('allClient', this.baseFields);
    type Response = { allClient: RelayPage<Client> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allClient.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getDataSource(variables?: OperationVariables) {
    const query = this.buildGetAll('allClient', this.baseFields);
    const datasource = this.createDataSource();
    type Response = { allClient: RelayPage<Client> };
    return this.queryAll<Response>(
      query,
      (res) => res.data.allClient.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    )
    .pipe(
      map( res => {
        this.asList( res.data.allClient )
        .forEach((client: Client) => (datasource.store() as ArrayStore).insert(client));
        datasource.reload();
        return datasource;
      }),
    );
  }

  getOne(id: string) {
    const query = this.buildGetOne('client', id, this.allFields);
    type Response = { client: Client };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  // update(variables: OperationVariables) {
  //   return this.mutate(`
  //     mutation SaveClient($client: GeoClientInput!) {
  //       saveClient(client: $client) {
  //         id
  //       }
  //     }
  //   `, { variables } as MutationOptions);
  // }

}
