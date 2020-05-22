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
    'typeVente { id description }',
    'compteComptable',
    'nbJourEcheance',
    'echeanceLe',
    'delaiBonFacturer',
    'incoterm { id description }',
    'regimeTva { id description }',
    'devise { id description }',
    'commentaireHautFacture',
    'commentaireBasFacture',
    'commercial { id nomUtilisateur }',
    'assistante { id nomUtilisateur }',
    'moyenPaiement { id description }',
    'basePaiement { id description }',
    'controlReferenceClient',
    'instructionCommercial',
    'agrement',
    'blocageAvoirEdi',
    'enCoursTemporaire',
    'enCoursBlueWhale',
    'tauxRemiseParFacture',
    'tauxRemiseHorsFacture',
    'fraisExcluArticlePasOrigineFrance',
    'fraisMarketing',
    'fraisPlateforme',
    'groupeClient { id description }',
    'courtier { id raisonSocial }',
    'paloxRaisonSocial { id raisonSocial }',
    'delaiBonFacturer',
    'debloquerEnvoieJour',
    'clotureAutomatique',
    'fraisRamasse',
    'courtageModeCalcul { id description }',
    'refusCoface',
    'enCoursDateLimite',
    'fraisMarketingModeCalcul { id description }',
    // 'formatDluo',
    'dateDebutIfco',
    // 'nbJourLimiteLitige',
    'detailAutomatique',
    // 'venteACommission'
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'Client');
  }

  getOne(id: string) {
    const query = this.buildGetOne(this.allFields);
    type Response = { client: Client };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource(inputVariables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(this.baseFields);
          type Response = { allClient: RelayPage<Client> };
          const variables = {
            ...inputVariables,
            ...this.mapLoadOptionsToVariables(options),
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allClient)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(this.baseFields);
          type Response = { client: Client };
          const variables = { ...inputVariables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.client),
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
