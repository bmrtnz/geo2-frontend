import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import { Historique } from '../models';
import { ApiService, RelayPage, RelayPageVariables } from './api.service';



export enum HistoryType {
  CLIENT = 'CLIENT',
  FOURNISSEUR = 'FOURNISSEUR',
  ARTICLE = 'ARTICLE',
}

enum HistoryModel {
  CLIENT = 'HistoriqueClient',
  FOURNISSEUR = 'HistoriqueFournisseur',
  ARTICLE = 'HistoriqueArticle',
}

enum HistoryModule {
  CLIENT = 'historique-client',
  FOURNISSEUR = 'historique-fournisseur',
  ARTICLE = 'historique-article',
}

// export enum HistoryModule = {
//   CLIENT = historique-client',
//   FOURNISSEUR = historique-fournisseur',
//   ARTICLE = historique-article',
// };

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService extends ApiService {

  listRegexp = /.*\.(?:id)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Historique);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {
          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allHistorique: RelayPage<Historique> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
            .pipe(
              map(res => this.asListCount(res.data.allHistorique)),
              take(1),
            )
            .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { historique: Historique };
          const variables = { id: key };
          return this.query<Response>(query, { variables } as WatchQueryOptions<any>)
            .pipe(
              map(res => res.data.historique),
              take(1),
            )
            .toPromise();
        },
      }),
    });
  }

  async saveByType(type: HistoryType, properties: OperationVariables) {
    const withLowerCaseFirst = ([first, ...rest]: string) => [first.toLowerCase(), ...rest].join('');
    this.model = (await import(`../models/${HistoryModule[type]}.model`)).default;
    const mutation = await this.buildSave(2);
    return this.mutate(mutation, {
      variables: {
        [withLowerCaseFirst(HistoryModel[type])]: properties,
      }
    } as any).pipe(take(1));
  }

}
