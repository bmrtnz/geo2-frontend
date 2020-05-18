import {Injectable} from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { Entrepot } from '../models';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import { MutationOptions } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class EntrepotsService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'valide',
    'raisonSocial',
    'pays { id description }',
    'client { id raisonSocial }',
    'ville',
  ];

  allFields = [
    ...this.baseFields,
    'code',
    'commercial { id nomUtilisateur }',
    'assistante { id nomUtilisateur }',
    'modeLivraison',
    'adresse1',
    'adresse2',
    'adresse3',
    'codePostal',
    'lieuFonctionEanDepot',
    'lieuFonctionEanAcheteur',
    'langue { id description }',
    'tvaCee',
    'typePalette { id description }',
    'incoterm { id description }',
    'mentionClientSurFacture',
    'regimeTva { id description }',
    'transporteur { id raisonSocial }',
    'baseTarifTransport { id description }',
    'baseTarifTransit { id description }',
    'typeCamion { id description }',
    'transitaire { id raisonSocial }',
    'gestionnaireChep',
    'referenceChep',
    'declarationEur1',
    'envoieAutomatiqueDetail',
    'controlReferenceClient',
    'instructionLogistique',
    'instructionSecretaireCommercial',
    'prixUnitaireTarifTransit',
    'prixUnitaireTarifTransport',
    'typeTiers',
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'Entrepot');
  }

  getOne(id: string) {
    const query = this.buildGetOne(this.allFields);
    type Response = { entrepot: Entrepot };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource(inputVariables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(this.baseFields);
          type Response = { allEntrepot: RelayPage<Entrepot> };

          // Merge search
          const search = [];
          const loadVariables = this.mapLoadOptionsToVariables(options);
          if (inputVariables.search) search.push(inputVariables.search);
          if (loadVariables.search) search.push(loadVariables.search);
          const variables = {
            ...loadVariables,
            search: search.join(' and ')
          };

          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allEntrepot)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(this.baseFields);
          type Response = { entrepot: Entrepot };
          const variables = { ...inputVariables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.entrepot),
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
