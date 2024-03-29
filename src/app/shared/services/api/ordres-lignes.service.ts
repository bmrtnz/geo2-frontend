import { Injectable } from "@angular/core";
import { OperationVariables } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import OrdreLigneLitigePick from "app/shared/models/ordre-ligne-litige-pick.model";
import Ordre, { Statut } from "app/shared/models/ordre.model";
import {
  functionBody,
  FunctionResponse,
  FunctionsService
} from "app/shared/services/api/functions.service";
import { LoadOptions } from "devextreme/data";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { map, takeWhile } from "rxjs/operators";
import { AuthService, LocalizationService } from "..";
import { OrdreLigne } from "../../models/ordre-ligne.model";
import { APIRead, ApiService, DistinctInfo, RelayPage, SummaryInput } from "../api.service";
import { FormUtilsService } from "../form-utils.service";
import dxDataGrid from "devextreme/ui/data_grid";
import { Workbook } from "exceljs";
import { exportDataGrid } from "devextreme/excel_exporter";
import { saveAs } from "file-saver";
import { DateManagementService } from "../date-management.service";
import notify from "devextreme/ui/notify";
import hideToasts from "devextreme/ui/toast/hide_toasts";

export enum SummaryOperation {
  Marge = "allOrdreLigneMarge",
  TotauxDetail = "allOrdreLigneTotauxDetail",
  Totaux = "allOrdreLigneTotaux",
}

let self;

@Injectable({
  providedIn: "root",
})
export class OrdreLignesService extends ApiService implements APIRead {

  queryFilter = /.*(?:id)$/i;

  /**
   * DxDatasource remove hook
   * @param id OrdreLigne id
   */
  public remove = (id: string) =>
    this.apollo
      .mutate({
        mutation: gql(this.buildDeleteGraph()),
        variables: { id },
        fetchPolicy: "no-cache",
      })
      .toPromise();

  constructor(
    apollo: Apollo,
    public functionsService: FunctionsService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
  ) {
    super(apollo, OrdreLigne);
    self = this;
  }

  // Used for "REPORTER" buttons on grid commandes
  public reportedItems() {
    return [
      { dataField: "proprietaireMarchandise.id", name: "reportProprietaire", caption: "proprietaireMarchandise.id", fields: ["proprietaireMarchandise.id", "fournisseur.id"] },
      { dataField: "fournisseur.id", name: "reportExpediteur", caption: "fournisseur.id", fields: ["fournisseur.id"] },
      { dataField: "ventePrixUnitaire", name: "reportPrixVente", caption: "ventePUEtUnite", fields: ["ventePrixUnitaire", "venteUnite.id"] },
      { dataField: "achatDevisePrixUnitaire", name: "reportPrixAchat", caption: "achatDevisePUEtUnite", fields: ["achatDevisePrixUnitaire", "achatUnite.id"] },
      { dataField: "venteUnite.id", name: "reportPrixVente", caption: "venteUnite.id", fields: ["venteUnite.id"], hidden: true },
      { dataField: "achatUnite.id", name: "reportPrixAchat", caption: "achatUnite.id", fields: ["achatUnite.id"], hidden: true },
      { dataField: "typePalette.id", name: "reportTypePalette", caption: "typePalette.id", fields: ["typePalette.id"] },
      { dataField: "libelleDLV", name: "reportLibelleDLV", caption: "libelleDLV", fields: ["libelleDLV"], mandatoryValue: true },
    ];
  }

  updateReportBtns(grid) {
    this.reportedItems().map((item) => {
      item.fields.map(field => {
        const currClass = grid.instance.columnOption(field, "cssClass") ?? "";
        if (this.authService.currentUser[item.name] || item.mandatoryValue === true) {
          if (!currClass.includes("headerCellBtnTemplate-show")) grid.instance.columnOption(field, "cssClass", currClass + " headerCellBtnTemplate-show");
        } else {
          grid.instance.columnOption(field, "cssClass", currClass.replace("headerCellBtnTemplate-show", ""));
        }
      });
    });
    grid.instance.refresh();
  }

  getOne_v2(id: string, columns: Array<string> | Set<string>) {
    return this.apollo.query<{ ordreLigne: Partial<OrdreLigne> }>({
      query: gql(this.buildGetOneGraph(columns)),
      variables: { id },
    });
  }

  getDataSource(depth = 1, filter?: RegExp) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll(depth, filter);
            type Response = { allOrdreLigne: RelayPage<OrdreLigne> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allOrdreLigne)
                resolve(this.asInstancedListCount(res.data.allOrdreLigne));
            });
          }),
        byKey: this.byKey(depth, filter),
      }),
    });
  }

  private byKey(depth: number, filter: RegExp) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne(depth, filter);
        type Response = { ordreLigne: OrdreLigne };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
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
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.ordreLigne)
            resolve(new OrdreLigne(res.data.ordreLigne));
        });
      });
  }

  private insert(values) {
    const variables = { ordreLigne: values };
    return self.watchSaveQuery({ variables }).toPromise();
  }

  private update(id, values) {
    const variables = { ordreLigne: FormUtilsService.cleanTypenames({ id, ...values }) };
    return lastValueFrom(self.watchSaveQuery({ variables }));
  }

  getDataSource_v2(columns: Array<string>, pageSize?) {
    return new DataSource({
      reshapeOnPush: true,
      sort: [{ selector: "numero" }],
      pageSize: pageSize ? pageSize : 20,
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll_v2(columns);
            type Response = { allOrdreLigne: RelayPage<OrdreLigne> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              {
                variables,
                fetchPolicy: "network-only", // to work with editable dx-grid
              },
              (res) => {
                if (res.data && res.data.allOrdreLigne)
                  resolve(this.asInstancedListCount(res.data.allOrdreLigne));
              }
            );
          }),
        byKey: this.byKey_v2(columns),
        insert: this.insert,
        update: this.update,
        remove: this.remove as unknown as (key: any) => PromiseLike<void>,
      }),
    });
  }

  public getDistinctEntityDatasource(
    fieldName,
    descriptionField?,
    searchExpr?
  ) {
    return this.getDistinctDatasource(
      "GeoOrdreLigne",
      fieldName,
      descriptionField,
      searchExpr
    );
  }

  getSummarisedDatasource(
    operation: SummaryOperation,
    columns: Array<string>,
    summary: SummaryInput[]
  ) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve, reject) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const queryGraph = this.buildGetSummaryGraph(operation, columns);
            type Response = { [operation: string]: RelayPage<OrdreLigne> };
            const variables = {
              ...this.mapLoadOptionsToVariables(options),
              summary,
            };

            // to have correct group summaries
            if (operation === SummaryOperation.TotauxDetail)
              variables.pageable.pageSize = 100;

            this.apollo
              .query<Response>({
                query: gql(queryGraph),
                variables,
                fetchPolicy: "no-cache",
              })
              .pipe(takeWhile((res) => !res.loading))
              .subscribe(({ data }) =>
                resolve(this.asInstancedListCount(data[operation]))
              );
          }),
        byKey: this.byKey_v2(columns),
        insert: this.insert,
        update: this.update,
        remove: this.remove as unknown as (key: any) => PromiseLike<void>,
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


  lockFields(e, allowMutations?) {
    // Locking step
    const data = e.data;
    const bloquer = window.sessionStorage.getItem("blockage") === "true" ? true : false;

    // Global case
    if ([Statut.ANNULE.toString(), Statut.A_FACTURER.toString(), Statut.FACTURE.toString(), Statut.FACTURE_EDI.toString()].includes(Statut[data.ordre?.statut]))
      return this.lock(e);

    // Special case: lock every cell except some when vente à commission is true & !allowmutations + "codePromo" #24462
    if (!allowMutations) {
      if (data.ordre.venteACommission === true) {
        if (!["ventePrixUnitaire", "venteUnite.id", "achatDevisePrixUnitaire", "achatUnite.id", "gratuit", "codePromo.id"].includes(e.column.dataField)) {
          return this.lock(e);
        } else {
          return;
        }
      } else {
        // Special case: unlock every cell except some when !allowmutations
        // Added "achatDevisePrixUnitaire", "achatUnite.id" 10-01-2023 CDT:569 + "codePromo" #24462
        if (!["ventePrixUnitaire", "venteUnite.id", "achatDevisePrixUnitaire", "achatUnite.id", "gratuit", "codePromo.id"].includes(e.column.dataField)) {
          return this.lock(e);
        } else {
          return;
        }
      }
    }


    switch (e.column.dataField) {
      case "nombrePalettesCommandees": {
        if (
          (data.logistique?.expedieStation === true ||
            data.ordre.secteurCommercial.id === "F" ||
            bloquer === true) &&
          data.ordre.type?.id !== "RPR" &&
          data.ordre.type?.id !== "RPO" &&
          data.ordre.societe.id !== "BWS" &&
          data.venteUnite?.id !== "UNITE" &&
          data.achatUnite?.id !== "UNITE"
        )
          this.lock(e);
        break;
      }
      case "nombrePalettesIntermediaires": {
        if (
          data.logistique?.expedieStation === true ||
          data.indicateurPalette === 1 ||
          bloquer === true
        )
          this.lock(e);
        break;
      }
      case "nombreColisPalette": {
        if (data.logistique?.expedieStation === true || bloquer === true)
          this.lock(e);
        break;
      }
      case "nombreColisCommandes": {
        if (data.logistique?.expedieStation === true || bloquer === true)
          this.lock(e);
        break;
      }
      case "proprietaireMarchandise.id": {
        if (
          data.logistique?.expedieStation === true ||
          bloquer === true ||
          data.ordre.type?.id === "RDF" ||
          data.ordre.type?.id === "REP" ||
          (data.ordre.type?.id === "RPR" &&
            data.ordre.commentaireUsageInterne.substring(0, 3) === "B02" &&
            data.ordre.entrepot.modeLivraison !== "S")
        )
          this.lock(e);
        break;
      }
      case "fournisseur.id": {
        // Emballeur/Expéditeur
        if (
          data.logistique?.expedieStation === true ||
          bloquer === true ||
          data.ordre.type?.id === "RDF" ||
          data.ordre.type?.id === "REP" ||
          (data.ordre.type?.id === "RPR" &&
            !data.ordre.commentaireUsageInterne.includes("B02") &&
            data.ordre.entrepot.modeLivraison !== "S")
        )
          this.lock(e);
        break;
      }
      // Lignes commentées Dde BW 06/11/2023 #23099

      // case "ventePrixUnitaire": {
      //   if (
      //     data.ordre.venteACommission !== true &&
      //     data.ordre.type?.id !== "REP" &&
      //     data.ordre.type?.id !== "RPF"
      //   )
      //     this.lock(e);
      //   break;
      // }
      // case "venteUnite.id": {
      //   if (
      //     data.ordre.venteACommission !== true &&
      //     data.ordre.type?.id !== "REP" &&
      //     data.ordre.type?.id !== "RPF"
      //   )
      //     this.lock(e);
      //   break;
      // }
      // case "gratuit": {
      //   if (
      //     data.ordre.venteACommission !== true &&
      //     (data.ordre.bonAFacturer === true)
      //   )
      //     this.lock(e);
      //   break;
      // }
      case "achatDevisePrixUnitaire":
      case "achatUnite.id": {
        if (
          data.ordre.venteACommission === true ||
          data.ordre.type?.id === "REP" ||
          data.ordre.type?.id === "RPF" ||
          data.ordre.type?.id === "RPO" ||
          data.ordre.type?.id === "RPR" ||
          data.ordre.type?.id === "REF" ||
          data.proprietaireMarchandise?.code.substring(0, 2) === "BW"
        ) {
        } else {
          if (data.logistique?.expedieStation === true || bloquer === true) this.lock(e);
        }
        break;
      }
      case "typePalette.id": {
        if (
          data.logistique?.expedieStation === true ||
          data.ordre.type?.id === "REP" ||
          data.ordre.type?.id === "RPF" ||
          bloquer === true
        )
          this.lock(e);
        break;
      }
      case "paletteInter.id": {
        if (
          data.logistique?.expedieStation === true ||
          data.ordre.type?.id === "REP" ||
          data.ordre.type?.id === "RPF" ||
          bloquer === true
        )
          this.lock(e);
        break;
      }
      case "fraisPrixUnitaire": {
        if (data.ordre.societe.id !== "IMP"
        ) this.lock(e);
        this.lock(e); // Modif Léa #17301 + modifs Bruno 26/07/2023 #21724
        break;
      }
      case "fraisUnite.id": {
        if (data.ordre.societe.id !== "IMP"
        ) this.lock(e);
        this.lock(e); // Dde Bruno 26/07/2023 #21724
        break;
      }
      case "articleKit": {
        if (data.ordre.bonAFacturer === true || bloquer === true) this.lock(e);
        break;
      }
      case "gtinColisKit": {
        if (
          data.ordre.bonAFacturer === true ||
          (data.ordre.ordreEDI?.id !== null &&
            data.ordre.ordreEDI?.id !== undefined)
        )
          this.lock(e);
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
        if (
          data.logistique?.expedieStation ||
          !(
            data.ordre.client.modificationDetail !== false ||
            data.ordre.secteurCommercial?.id === "PAL" ||
            this.authService.currentUser.geoClient === "2" ||
            data.ordre.societe.id === "IMP" ||
            data.ordre.societe.id === "UDC" ||
            data.article.cahierDesCharge?.espece?.id.substring(0, 5) ===
            "EMBAL" ||
            data.ordre.type.id === "RPR" ||
            data.ordre.type.id === "RPO" ||
            data.article.matierePremiere?.variete?.modificationDetail ||
            data.ordre.societe.id === "IUK"
          )
        )
          this.lock(e);
        break;
      }
    }
  }

  public getList(search: string, columns: Array<string>) {
    return this.apollo
      .query<{ allOrdreLigneList: OrdreLigne[] }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
        fetchPolicy: "no-cache",
      })
      .pipe(takeWhile((res) => !res.loading));
  }

  getListDataSource(columns: Array<string>) {
    return new DataSource({
      reshapeOnPush: false,
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const { search } = this.mapLoadOptionsToVariables(options);
            const res = await this.getList(search, columns).toPromise();
            const data = JSON.parse(JSON.stringify(res.data.allOrdreLigneList));
            resolve({
              data,
              totalCount: res.data.allOrdreLigneList.length,
            });
          }),
        byKey: this.byKey_v2(columns),
        insert: this.insert,
        update: this.update,
        remove: this.remove as unknown as (key: any) => PromiseLike<void>,
      }),
    });
  }

  getPreloadedDataSource(columns: Array<string>, search?: string) {
    return new DataSource({
      store: new CustomStore({
        key: this.keyField,
        byKey: this.byKey_v2(columns),
        load: options => lastValueFrom(this.apollo
          .query<{ [key: string]: Array<OrdreLigne> }>({
            query: gql(this.buildGetListGraph(columns)),
            variables: { search },
            fetchPolicy: "network-only",
          })
          .pipe(map((res) => JSON.parse(JSON.stringify(res.data[`all${this.model.name}List`]))))),
        update: this.update,
        remove: this.remove as unknown as (key: any) => PromiseLike<void>,
      }),
    });
  }

  public fGetInfoResa(orlRef: string) {
    return this.apollo.query<{
      fGetInfoResa: FunctionResponse<{
        ll_tot_qte_ini: number;
        ll_tot_qte_res: number;
        ll_tot_mvt_qte: number;
        ll_tot_nb_resa: number;
      }>;
    }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "fGetInfoResa",
              body: functionBody,
              params: [{ name: "orlRef", value: "orlRef", isVariable: true }],
            },
          ],
          [{ name: "orlRef", type: "String", isOptionnal: false }]
        )
      ),
      variables: { orlRef },
      fetchPolicy: "network-only",
    });
  }

  public reindex(lignes: string[], body: string[]) {
    return this.apollo.mutate<{ reindex: Partial<OrdreLigne>[] }>({
      mutation: gql(
        ApiService.buildGraph(
          "mutation",
          [
            {
              name: "reindex",
              body,
              params: [{ name: "lignes", value: "lignes", isVariable: true }],
            },
          ],
          [{ name: "lignes", type: "[String]", isOptionnal: false }]
        )
      ),
      variables: { lignes },
      fetchPolicy: "network-only",
    });
  }

  public wLitigePickOrdreOrdligV2(ordreID: Ordre["id"], body: string[]) {
    return this.apollo.query<{
      wLitigePickOrdreOrdligV2: Partial<OrdreLigneLitigePick>[];
    }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "wLitigePickOrdreOrdligV2",
              body,
              params: [{ name: "ordreID", value: "ordreID", isVariable: true }],
            },
          ],
          [{ name: "ordreID", type: "String", isOptionnal: false }]
        )
      ),
      variables: { ordreID },
      fetchPolicy: "network-only",
    });
  }

  public fCreeOrdreReplacementLigne(
    litigeLigneID: string,
    ordreID: string,
    ordreOriginID: string,
    ordreLigneOriginID: string,
    societeID: string
  ) {
    return this.functionsService.queryFunction("fCreeOrdreReplacementLigne", [
      { name: "litigeLigneID", type: "String", value: litigeLigneID },
      { name: "ordreID", type: "String", value: ordreID },
      { name: "ordreOriginID", type: "String", value: ordreOriginID },
      { name: "ordreLigneOriginID", type: "String", value: ordreLigneOriginID },
      { name: "societeID", type: "String", value: societeID },
    ]);
  }

  public supprLignesNonExped(
    ordreRef: string,
  ) {
    return this.functionsService.queryFunction("supprLignesNonExped", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }

  /**
   * Génère un fichier xlsx ajusté #23673
   */
  public async onExporting(datagrid: dxDataGrid, component) {
    notify(this.localizeService.localize("export-running"), "info", 9999999);
    component.changeGrouping(); // Special grouping needed
    // Waiting for the grid to be fully ready
    await firstValueFrom(component.contentReadyEvent).then(() => {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet();
      exportDataGrid({
        component: datagrid,
        worksheet,
        customizeCell: ({ gridCell, excelCell }) => {
          // Cleaning top header summary && groupFooter
          if ((gridCell.rowType === "group" && component.summaryFields.includes(gridCell.column.dataField)) ||
            (gridCell.rowType === "groupFooter" && component.customSummaryFields.includes(gridCell.column.dataField)))
            excelCell.value = "";
          // Center aligning everything except article & ordre group
          if (!["article.articleDescription.descriptionReferenceLongue",
            "article.articleDescription.descriptionReferenceCourte",
            "ordre.numero"]
            .includes(gridCell.column.dataField)) {
            excelCell.alignment = { horizontal: 'center' };
          }
          if (gridCell.rowType === "data") {
            // Canceled orders rows should be in red
            if (gridCell.data?.ordre.flagAnnule) excelCell.font = { color: { argb: 'FF325A' } };
          }
        }
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
          const name = `${this.localizeService.localize(
            "order-history"
          )} - ${this.dateManagementService.formatDate(new Date(), "dd-MM-yyyy")}`;
          saveAs(new Blob([buffer], { type: "application/octet-stream" }), `${name}.xlsx`);
          component.changeGrouping(component.switchLivraison?.value); // Back to initial state
          hideToasts();
          notify(this.localizeService.localize("file-downloaded"), "success");
        });
      }).catch((err) => console.error(err));
    })
  }

}
