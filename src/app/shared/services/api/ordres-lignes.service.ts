import { Injectable } from "@angular/core";
import { OperationVariables } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import { FunctionsService } from "app/shared/services/api/functions.service";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import notify from "devextreme/ui/notify";
import { takeWhile } from "rxjs/operators";
import { AuthService } from "..";
import { OrdreLigne } from "../../models/ordre-ligne.model";
import { APIRead, ApiService, RelayPage, SummaryInput } from "../api.service";

export enum SummaryOperation {
  Marge = "allOrdreLigneMarge",
  TotauxDetail = "allOrdreLigneTotauxDetail",
  Totaux = "allOrdreLigneTotaux"
}

@Injectable({
  providedIn: "root"
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
        { selector: "numero", }
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
            fetchPolicy: "network-only", // to work with editable dx-grid
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
            columns.map(c => `edges.node.${c}`),
          );
          type Response = { [operation: string]: RelayPage<OrdreLigne> };
          const variables = {
            ...this.mapLoadOptionsToVariables(options),
            summary,
          };

          this.apollo.query<Response>({
            query: gql(queryGraph),
            variables,
            fetchPolicy: "no-cache",
          })
            .pipe(takeWhile(res => !res.loading))
            .subscribe(({ data }) => resolve(this.asInstancedListCount(data[operation])));

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
    const bloquer = window.sessionStorage.getItem("blockage") === "true" ? true : false;

    switch (e.column.dataField) {

      case "nombrePalettesCommandees": {
        if ((data.logistique.expedieStation === true
          || data.ordre.secteurCommercial.id === "F"
          || bloquer === true)
          && data.ordre.type.id !== "RPR"
          && data.ordre.type.id !== "RPO"
          && data.ordre.societe.id !== "BWS"
          && data.venteUnite.id !== "UNITE"
          && data.achatUnite.id !== "UNITE") this.lock(e);
        break;
      }
      case "nombrePalettesIntermediaires": {
        if (data.logistique.expedieStation === true ||
          data.indicateurPalette === 1
          || bloquer === true
        ) this.lock(e);
        break;
      }
      case "nombreColisPalette": {
        if (data.logistique.expedieStation === true
          || bloquer === true
        ) this.lock(e);
        break;
      }
      case "nombreColisCommandes": {
        if (data.logistique.expedieStation === true
          || bloquer === true
        ) this.lock(e);
        break;
      }
      case "proprietaireMarchandise": {
        if (data.logistique.expedieStation === true
          || bloquer === true
          || data.ordre.type.id === "RDF"
          || data.ordre.type.id === "REP"
          || (data.ordre.type.id === "RPR"
            && data.ordre.commentaireUsageInterne.substring(0, 3) === "B02"
            && data.ordre.entrepot.modeLivraison !== "S")
        ) this.lock(e);
        break;
      }
      case "fournisseur": { // Emballeur/Expéditeur
        if (data.logistique.expedieStation === true
          || bloquer === true
          || data.ordre.type.id === "RDF"
          || data.ordre.type.id === "REP"
          || (data.ordre.type.id === "RPR"
            && !data.ordre.commentaireUsageInterne.includes("B02")
            && data.ordre.entrepot.modeLivraison !== "S")
        ) this.lock(e);
        break;
      }
      case "ventePrixUnitaire": {
        if ((data.ordre.venteACommission !== true
          && data.ordre.type.id !== "REP"
          && data.ordre.type.id !== "RPF")
          && bloquer === true
        ) this.lock(e);
        break;
      }
      case "venteUnite": {
        if ((data.ordre.venteACommission !== true
          && data.ordre.type.id !== "REP"
          && data.ordre.type.id !== "RPF")
          && bloquer === true
        ) this.lock(e);
        break;
      }
      case "gratuit": {
        if (data.ordre.venteACommission !== true
          && (data.ordre.bonAFacturer === true
            || bloquer === true)
        ) this.lock(e);
        break;
      }
      case "achatDevisePrixUnitaire": {
        if ((data.ordre.venteACommission !== true
          && data.ordre.type.id !== "REP"
          && data.ordre.type.id !== "RPF")
          && (data.logistique.expedieStation === true
            || bloquer === true)
        ) this.lock(e);
        break;
      }
      case "achatUnite": {
        if ((data.ordre.venteACommission !== true
          && data.ordre.type.id !== "REP"
          && data.ordre.type.id !== "RPF")
          && bloquer === true
        ) this.lock(e);
        break;
      }
      case "typePalette": {
        if (data.logistique.expedieStation === true
          || data.ordre.type.id === "REP"
          || data.ordre.type.id === "RPF"
          || bloquer === true
        ) this.lock(e);
        break;
      }
      case "paletteInter": {
        if (data.logistique.expedieStation === true
          || data.ordre.type.id === "REP"
          || data.ordre.type.id === "RPF"
          || bloquer === true
        ) this.lock(e);
        break;
      }
      case "fraisPrixUnitaire": {
        if (data.ordre.societe.id !== "IMP"
        ) this.lock(e);
        break;
      }
      case "articleKit": {
        if (data.ordre.bonAFacturer === true
          || bloquer === true
        ) this.lock(e);
        break;
      }
      case "gtinColisKit": {
        if (data.ordre.bonAFacturer === true
          || data.ordre.ordreEDI?.id !== null
        ) this.lock(e);
        break;
      }

    }

  }

  lockFieldsDetails(e) {

    // Locking step
    const data = e.data;

    // Special case
    if (e.column.dataField === "achatQuantite") {
      if (["COLIS", "KILO", "PAL"].includes(data.achatUnite?.id)) this.lock(e);
    }
    if (e.column.dataField === "venteQuantite") {
      if (["COLIS", "KILO", "PAL"].includes(data.venteUnite?.id)) this.lock(e);
    }

    // Standard Lock
    switch (e.column.dataField) {

      case "nombrePalettesExpediees":
      case "nombreColisExpedies":
      case "poidsNetExpedie":
      case "poidsBrutExpedie":
      case "venteQuantite":
      case "venteUnite.description":
      case "achatQuantite":
      case "achatUnite.description":
      case "typePalette":
      case "paletteInter": {
        if (data.logistique.expedieStation ||
          !(data.ordre.client.modificationDetail !== false ||
            data.ordre.secteurCommercial.id === "PAL" ||
            this.authService.currentUser.geoClient === "2" ||
            data.ordre.societe.id === "IMP" ||
            data.ordre.societe.id === "UDC" ||
            data.article.cahierDesCharge.espece.id.substring(0, 5) === "EMBAL" ||
            data.ordre.type.id === "RPR" ||
            data.ordre.type.id === "RPO" ||
            data.article.matierePremiere.variete.modificationDetail ||
            data.ordre.societe.id === "IUK"
          )) this.lock(e);
        break;
      }
    }
  }

  public getList(search: string, columns: Array<string>) {
    return this.apollo
      .query<{ allOrdreLigneList: OrdreLigne[] }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
      })
      .pipe(takeWhile((res) => !res.loading));
  }

  getListDataSource(columns: Array<string>) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            const { search } = this.mapLoadOptionsToVariables(options);
            const res = await this.getList(search, columns).toPromise();
            resolve({
              data: res.data.allOrdreLigneList,
              totalCount: res.data.allOrdreLigneList.length,
            });
          }),
        byKey: this.byKey_v2(columns),
      }),
    });
  }

}
