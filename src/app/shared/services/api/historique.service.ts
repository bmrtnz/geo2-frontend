import { Injectable } from '@angular/core';
import { gql, MutationOptions, OperationVariables } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { from } from 'rxjs';
import { mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Historique } from '../../models';
import { ApiService, RelayPage } from '../api.service';

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
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allHistorique: RelayPage<Historique> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allHistorique)
              resolve(this.asInstancedListCount(res.data.allHistorique));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { historique: Historique };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.historique)
              resolve(new this.model(res.data.historique));
          });
        }),
      }),
    });
  }

  saveByType(type: HistoryType, properties: OperationVariables) {
    const withLowerCaseFirst = ([first, ...rest]: string) => [first.toLowerCase(), ...rest].join('');
    return from(import(`../../models/${HistoryModule[type]}.model`))
    .pipe(
      tap( model => this.model = model.default),
      switchMap( _ => this.buildSave(2)),
      takeUntil(this.destroy),
      mergeMap( query => this.apollo.mutate({
        mutation: gql(query),
        fetchPolicy: 'no-cache',
        variables: {
          [withLowerCaseFirst(HistoryModel[type])]: properties,
        },
      } as MutationOptions)),
      take(1),
    );
  }

}
