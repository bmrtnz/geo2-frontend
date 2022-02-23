import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { takeWhile } from 'rxjs/operators';
import { FunctionsService } from 'app/shared/services/api/functions.service';
import { OrdreLigne } from '../../models/ordre-ligne.model';
import { APIRead, ApiService, RelayPage, SummaryInput } from '../api.service';
import { OperationVariables } from '@apollo/client/core';
import { AuthService } from '..';

export enum SummaryOperation {
  Marge = 'allOrdreLigneMarge',
  TotauxDetail = 'allOrdreLigneTotauxDetail',
  Totaux = 'allOrdreLigneTotaux'
}

@Injectable({
  providedIn: 'root'
})
export class OrdreLignesService extends ApiService implements APIRead {

  queryFilter = /.*(?:id)$/i;

  constructor(
    apollo: Apollo,
    public functionsService: FunctionsService,
    public authService: AuthService
  ) {
    super(apollo, OrdreLigne);
  }

  /**
   * @deprecated Use getDataSource_v2
   */
  getDataSource(depth = 1, filter?: RegExp) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(depth, filter);
          type Response = { allOrdreLigne: RelayPage<OrdreLigne> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreLigne)
              resolve(this.asInstancedListCount(res.data.allOrdreLigne));
          });
        }),
        byKey: this.byKey(depth, filter),
      }),
    });
  }

  private byKey(depth: number, filter: RegExp) {
    return key => new Promise(async (resolve) => {
      const query = await this.buildGetOne(depth, filter);
      type Response = { ordreLigne: OrdreLigne };
      const variables = { id: key };
      this.listenQuery<Response>(query, { variables }, res => {
        if (res.data && res.data.ordreLigne)
          resolve(new OrdreLigne(res.data.ordreLigne));
      });
    });
  }

  private byKey_v2(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { ordreLigne: OrdreLigne };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, res => {
          if (res.data && res.data.ordreLigne)
            resolve(new OrdreLigne(res.data.ordreLigne));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [
        { selector: 'numero',  }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll_v2(columns);
          type Response = { allOrdreLigne: RelayPage<OrdreLigne> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, {
            variables,
            fetchPolicy: 'network-only', // to work with editable dx-grid
          }, res => {
            if (res.data && res.data.allOrdreLigne)
              resolve(this.asInstancedListCount(res.data.allOrdreLigne));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne_v2(columns);
          type Response = { ordreLigne: OrdreLigne };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.ordreLigne)
              resolve(new OrdreLigne(res.data.ordreLigne));
          });
        }),
      }),
    });
  }


  getSummarisedDatasource(
    operation: SummaryOperation,
    columns: Array<string>,
    summary: SummaryInput[]
  ) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve, reject) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const queryGraph = this.buildGetSummaryGraph(
            operation,
            columns.map( c => `edges.node.${ c }`),
            summary,
          );
          type Response = { [operation: string]: RelayPage<OrdreLigne> };
          const variables = {
            ...this.mapLoadOptionsToVariables(options),
            summary,
          };

          this.apollo.query<Response>({
            query: gql(queryGraph),
            variables,
            fetchPolicy: 'no-cache',
          })
          .pipe(takeWhile(res => res.loading === false))
          .subscribe(({data}) => resolve(this.asInstancedListCount(data[operation])));

        }),
        byKey: this.byKey_v2(columns),
        insert: (values) => {
          const variables = { ordreLigne: values };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        update: (key, values) => {
          const variables = { ordreLigne: { id: key, ...values } };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        remove: (key) => {
          const variables = { id: key };
          return this.watchDeleteQuery({ variables }).toPromise();
        },
      }),
    });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.apollo.mutate<{ saveOrdreLigne: OrdreLigne }>({
      mutation: gql(this.buildSaveGraph(columns)),
      variables,
    });
  }

  lock(cell) {
    cell.cancel = true;
  }

  lockFields(e) {

    // Locking step
    const data = e.data;
    const bloquer = window.sessionStorage.getItem('blockage') ? true : false;

    switch (e.column.dataField) {

      case 'nombrePalettesCommandees': {
        if ((data.expedieStation === true
            || data.ordre.secteurCommercial.id === 'F'
            || bloquer === true)
          && data.ordre.type !== 'RPR'
          && data.ordre.type !== 'RPO'
          && data.ordre.societe.id !== 'BWS'
          && data.venteUnite.id !== 'UNITE'
          && data.achatUnite.id !== 'UNITE') this.lock(e);
        break;
      }
      case 'nombrePalettesIntermediaires': {
        if (data.expedieStation === true ||
            data.indicateurPalette === 1
            || bloquer === true
            ) this.lock(e);
        break;
      }
      case 'nombreColisPalette': {
        if (data.expedieStation === true
          || bloquer === true
          ) this.lock(e);
        break;
      }
      case 'nombreColisCommandes': {
        if (data.expedieStation === true
          || bloquer === true
          ) this.lock(e);
        break;
      }
      case 'proprietaireMarchandise': {
        if (data.expedieStation === true
            || bloquer === true
            || data.ordre.type === 'RDF'
            || data.ordre.type === 'REP'
            || (data.ordre.type === 'RPR'
              && data.ordre.commentaireUsageInterne.substring(0, 3) === 'B02'
              && data.ordre.entrepot.modeLivraison.id !== 'S')
              ) this.lock(e);
        break;
      }
      case 'fournisseur': { // Emballeur/Expéditeur
        if (data.expedieStation === true
            || bloquer === true
            || data.ordre.type === 'RDF'
            || data.ordre.type === 'REP'
            || (data.ordre.type === 'RPR'
              && !data.ordre.commentaireUsageInterne.includes('B02')
              && data.ordre.entrepot.modeLivraison !== 'S')
              ) this.lock(e);
        break;
      }
      case 'ventePrixUnitaire': {
        if ((data.venteACommission !== true
          && data.ordre.type !== 'REP'
          && data.ordre.type !== 'RPF')
          && bloquer === true
          ) this.lock(e);
        break;
      }
      case 'venteUnite': {
        if ((data.venteACommission !== true
          && data.ordre.type !== 'REP'
          && data.ordre.type !== 'RPF')
          && bloquer === true
          ) this.lock(e);
        break;
      }
      case 'gratuit': {
        if (data.venteACommission !== true
          && (data.expedieStation === true
            || bloquer === true)
          ) this.lock(e);
        break;
      }
      case 'achatPrixUnitaire': {
        if ((data.venteACommission !== true
          && data.ordre.type !== 'REP'
          && data.ordre.type !== 'RPF')
          && (data.expedieStation === true
            || bloquer === true)
          ) this.lock(e);
        break;
      }
      case 'achatUnite': {
        if ((data.venteACommission !== true
          && data.ordre.type !== 'REP'
          && data.ordre.type !== 'RPF')
          && bloquer === true
          ) this.lock(e);
        break;
      }
      case 'typePalette': {
        if (data.expedieStation === true
          || data.ordre.type === 'REP'
          || data.ordre.type === 'RPF'
          || bloquer === true
          ) this.lock(e);
        break;
      }
      case 'paletteInter': {
        if (data.expedieStation === true
          || data.ordre.type === 'REP'
          || data.ordre.type === 'RPF'
          || bloquer === true
          ) this.lock(e);
        break;
      }
      case 'fraisPrixUnitaire': {
        if (data.ordre.societe.id !== 'IMP'
          ) this.lock(e);
        break;
      }
      case 'articleKit': {
        if (data.ordre.bonAFacturer === true
          || bloquer === true
          ) this.lock(e);
        break;
      }
      case 'gtinColisKit': {
        if (data.ordre.bonAFacturer === true
          || data.ordre.ordreEDI?.id !== null
          ) this.lock(e);
        break;
      }

    }

  }

}

