import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { ConfirmationResultPopupComponent } from "app/shared/components/confirmation-result-popup/confirmation-result-popup.component";
import { BaseTarif } from "app/shared/models";
import LitigeCause from "app/shared/models/litige-cause.model";
import LitigeConsequence from "app/shared/models/litige-consequence.model";
import LitigeLigneFait from "app/shared/models/litige-ligne-fait.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import { LocalizePipe } from "app/shared/pipes";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import {
  ColumnsChangeSelection,
  Grid,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import DevExpress from "devextreme";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { formatNumber } from "devextreme/localization";
import { defer, from, interval, Observable, of, throwError } from "rxjs";
import {
  concatMap,
  concatMapTo,
  filter,
  map,
  mergeMap,
  takeWhile, timeout,
  toArray
} from "rxjs/operators";
import { GridsService } from "../../grids.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { AuthService } from "app/shared/services";

let self: GridLotComponent;

@Component({
  selector: "app-grid-lot",
  templateUrl: "./grid-lot.component.html",
  styleUrls: ["./grid-lot.component.scss"],
})
export class GridLotComponent implements OnInit, OnChanges {

  public hasZeroQuantities: boolean;

  constructor(
    private litigesLignesService: LitigesLignesService,
    private gridConfiguratorService: GridConfiguratorService,
    public formUtilsService: FormUtilsService,
    public authService: AuthService,
    private gridsService: GridsService,
    private localize: LocalizePipe
  ) {
    self = this;
  }
  @Input() headerData: {
    responsable?: Litige["responsableTiersCode"];
    cause?: LitigeCause["id"];
    consequence?: LitigeConsequence["id"];
  };

  @Input() lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];

  @ViewChild(DxDataGridComponent) public grid: DxDataGridComponent;
  @ViewChild(ConfirmationResultPopupComponent)
  private confirmPopup: ConfirmationResultPopupComponent;

  /** Fields processed by `byCellTemplate` */
  public readonly byTemplateConfig = {
    "ligne.clientNombrePalettes": "ligne.ordreLigne.nombrePalettesExpediees",
    "ligne.clientNombreColisReclamation":
      "ligne.ordreLigne.nombreColisExpedies",
    "ligne.clientPoidsNet": "ligne.ordreLigne.poidsNetExpedie",
  };

  public dataSource: DataSource;
  public columns: Observable<GridColumn[]>;

  private static calcAvoirRemise(ligne: Partial<LitigeLigne>) {
    let tarif = 0;

    if (ligne.clientUniteFactureCode === "COLIS")
      tarif = ligne.clientPrixUnitaire * ligne.clientNombreColisReclamation;
    if (ligne.clientUniteFactureCode === "PAL")
      tarif = ligne.clientPrixUnitaire * ligne.clientNombrePalettes;
    if (ligne.clientUniteFactureCode === "KILO")
      tarif = ligne.clientPrixUnitaire * ligne.clientPoidsNet;
    if (ligne.clientUniteFactureCode === "TONNE")
      tarif = (ligne.clientPrixUnitaire * ligne.clientPoidsNet) / 1000;
    tarif = ligne.clientPrixUnitaire * ligne.clientQuantite;

    if (ligne.ordreLigne.ristourne)
      if (ligne.ordreLigne.article.normalisation.produitMdd)
        tarif *= (100 - ligne.ordreLigne.ordre.remiseSurFactureMDDTaux) / 100;
      else tarif *= (100 - ligne.ordreLigne.ordre.tauxRemiseFacture) / 100;

    return tarif;
  }

  private static calculateQuantite(
    baseTarif: BaseTarif["id"],
    ligne: Partial<LitigeLigne>
  ) {
    if (baseTarif === "PAL") return ligne.clientNombrePalettes;
    if (["COL", "COLIS"].includes(baseTarif)) return ligne.clientNombreColisReclamation;
    if (baseTarif === "KILO") return ligne.clientPoidsNet;
    if (baseTarif === "TONNE") return ligne.clientPoidsNet / 1_000;
    if (baseTarif === "CAMION") return 0;
    if (baseTarif === "FORFAIT") return 1;
    const nbPiece = ligne.ordreLigne.article.emballage.uniteParColis ?? 1;
    return ligne.clientNombreColisReclamation * nbPiece;
  }

  private setClientQuantite(
    newData: Partial<LitigeLigneFait>,
    value: any,
    rowData: Partial<LitigeLigneFait>
  ) {
    // Returns if litige is closed on client side
    if (rowData.ligne.litige.clientCloture) return;
    const baseTarif = rowData.ligne.clientIndicateurForfait
      ? "UNITE"
      : rowData.ligne.clientUniteFactureCode;
    if (!newData?.ligne) newData.ligne = {};
    newData.ligne.clientQuantite = GridLotComponent.calculateQuantite(
      baseTarif,
      { ...rowData.ligne, ...newData.ligne }
    );
  }

  private setResponsableQuantite(
    newData: Partial<LitigeLigneFait>,
    value: any,
    rowData: Partial<LitigeLigneFait>
  ) {
    // Returns if litige is closed on fournisseur side
    if (rowData.ligne.litige.fournisseurCloture || rowData.ligne.litige.ordreAvoirFournisseur?.id) return;

    const baseTarif = rowData.ligne.responsableIndicateurForfait
      ? "UNITE"
      : rowData.ligne.responsableUniteFactureCode;
    if (!newData?.ligne) newData.ligne = {};
    const latestData = { ...rowData.ligne, ...newData.ligne };
    if (
      this.headerData?.responsable === "F" ||
      ["A", "B"].includes(this.headerData?.consequence) ||
      this.headerData?.cause === "W64"
    ) {
      newData.ligne.responsableNombrePalettes = latestData.clientNombrePalettes;
      newData.ligne.responsableNombreColis =
        latestData.clientNombreColisReclamation;
      newData.ligne.responsablePoidsNet = latestData.clientPoidsNet;
      newData.ligne.responsableQuantite = GridLotComponent.calculateQuantite(
        baseTarif,
        latestData
      );
    } else {
      newData.ligne.responsableNombrePalettes = 0;
      newData.ligne.responsableNombreColis = 0;
      newData.ligne.responsablePoidsNet = 0;
      newData.ligne.responsableQuantite = 0;
    }
  }

  private setQuantite(newData, value, rowData) {
    const clientForfait = newData.ligne.clientIndicateurForfait ?? rowData.ligne.clientIndicateurForfait;
    if (clientForfait)
      newData.ligne.clientQuantite = 1;
    else
      this.setClientQuantite(newData, value, rowData);

    const responsableForfait = newData.ligne.responsableIndicateurForfait ?? rowData.ligne.responsableIndicateurForfait;
    if (responsableForfait)
      newData.ligne.responsableQuantite = 1;
    else
      this.setResponsableQuantite(newData, value, rowData);
  }

  public setPrixUnitaires(newData, value, currentRowData) {
    // Focus on forfait responsable - Uggly but works
    setTimeout(() => {
      self.grid.instance.editCell(
        self.grid.instance.getRowIndexByKey(currentRowData.ligne.id),
        "prixUnitaire"
      );
      setTimeout(() => {
        const myInput = document.querySelector(".dx-state-focused");
        myInput?.nextElementSibling?.querySelector("input").focus();
      });
    }, 100);
  }

  public gridConfigHandler = (event) =>
    this.gridConfiguratorService.init(Grid.LitigeLignesLot, {
      ...event,
      onColumnsChange: this.onColumnsChange.bind(this),
    });

  ngOnInit(): void {
    this.columns = this.gridConfiguratorService.fetchColumns(
      Grid.LitigeLignesLot
    );
    this.gridsService.register("LitigeLignesLot", this.grid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lot.currentValue !== changes.lot.previousValue) {
      this.fillGrid(
        this.gridConfiguratorService.fetchColumns(Grid.LitigeLignesLot)
      );
    }
  }

  private onColumnsChange({ current }: ColumnsChangeSelection) {
    this.columns = of(current);
    this.fillGrid(of(current));
  }

  private async fillGrid(columns: Observable<GridColumn[]>) {
    this.dataSource = await columns
      .pipe(
        filter(() => !!this.lot),
        concatMap((resolvedColumns) =>
          this.fetchDatasource(resolvedColumns, ...this.lot)
        )
      )
      .toPromise();
  }

  private fetchDatasource(
    columns: GridColumn[],
    litigeID: Litige["id"],
    numeroGroupement?: LitigeLigne["numeroGroupementLitige"]
  ) {
    return of(columns).pipe(
      GridConfiguratorService.filterNonVirtual(),
      GridConfiguratorService.getVisible(),
      GridConfiguratorService.getFields(),
      map((fields) => [
        ...fields,
        "ligne.id",
        "ligne.litige.id",
        "ligne.clientNombrePalettes",
        "ligne.clientNombreColisReclamation",
        "ligne.responsablePoidsNet",
        "ligne.ordreLigne.numero",
        "ligne.ordreLigne.article.id",
        "ligne.ordreLigne.article.articleDescription.id",
        "ligne.ordreLigne.nombrePalettesExpediees",
        "ligne.ordreLigne.nombreColisExpedies",
        "ligne.ordreLigne.poidsNetExpedie",
        "ligne.ordreLigne.proprietaireMarchandise.code",
        "ligne.ordreLigne.fournisseur.code",
        // mandatory for "avoir remise" calculation
        "ligne.ordreLigne.ristourne",
        "ligne.ordreLigne.article.normalisation.produitMdd",
        "ligne.ordreLigne.ordre.tauxRemiseFacture",
        "ligne.ordreLigne.ordre.remiseSurFactureMDDTaux",
        // mandatory for "quantite" calculation
        "ligne.ordreLigne.article.emballage.uniteParColis",
        "ligne.litige.ordreAvoirFournisseur.id",
        "ligne.litige.responsableTiers",
        // mandatory for locking fields
        "ligne.litige.clientCloture",
        "ligne.litige.fournisseurCloture",
      ]),
      map((fields) =>
        // upgrade fields that require sub selections
        fields.map((field) => {
          if (field === "ligne.cause") return "ligne.cause.id";
          if (field === "ligne.consequence") return "ligne.consequence.id";
          return field;
        })
      ),
      map((fields) =>
        this.litigesLignesService.allLitigeLigneFaitDatasource(
          litigeID,
          numeroGroupement ?? "",
          new Set(fields)
        )
      )
    );
  }

  public onCellPrepared(e) {
    if (e.rowType === "data" && e.column.dataField === "ligne.clientQuantite") {
      if (!e.value) this.hasZeroQuantities = true;
    }
  }

  onEditingStart(cell) {
    if (["ligne.clientPoidsNet",
      "ligne.clientNombreColisReclamation",
      "ligne.clientNombrePalettes"
    ].includes(cell.column.dataField) && this.headerData?.consequence === "F")
      cell.cancel = true;

    // Disallow changing unit price if cloture client / fournisseur
    if (cell.column.dataField === "prixUnitaire") {
      setTimeout(() => {
        const inputs = document.querySelectorAll(".grid-litige-lots .merged input");
        if (cell.data.ligne.litige.clientCloture) {
          (inputs[0] as HTMLInputElement).disabled = true;
          self.setPrixUnitaires(null, null, cell.data);
        }
        if (cell.data.ligne.litige.fournisseurCloture)
          (inputs[1] as HTMLInputElement).disabled = true;
      }, 10);
    }
  }

  /**
   * Met a jour l'ensemble des lignes de la grille (le lot) avec les données en parametre
   * Si une seule ligne est fournie, les données seront clonées dans toutes les lignes du lot
   */
  public updateLot(data: Partial<LitigeLigne> | Partial<LitigeLigne>[]) {
    this.hasZeroQuantities = false;
    return interval(100).pipe(
      concatMapTo(defer(() => of(this.grid?.dataSource as DataSource))),
      takeWhile((datasource) => !datasource?.items()?.length, true),
      filter((datasource) => !!datasource?.items()?.length),
      concatMap((datasource) => {
        this.getItems(datasource).forEach((item, rowIndex) => {
          if (Array.isArray(data)) {
            const index = data.findIndex((row) => row.id === item.ligne.id);
            if (index >= 0) {
              Object.entries(data[index]).forEach(([field, value]) => {
                this.grid.instance.cellValue(rowIndex, `ligne.${field}`, value);
              });
            }
          } else
            Object.entries(data).forEach(([field, value]) => {
              this.grid.instance.cellValue(rowIndex, `ligne.${field}`, value);
            });
        });
        return Promise.resolve(this.getItems(datasource));
      }),
      timeout(10000)
    );
  }

  /** Persist grid changes */
  public persist() {
    const hasEditData = this.grid.instance.hasEditData();
    return defer(() => this.grid.instance.saveEditData()).pipe(
      concatMapTo(of(hasEditData)),
    );
  }

  /** Reloads grid data and repaints data rows, wrapper around `dxDataGrid.refresh` */
  public refresh() {
    // needed to reinitialize the datasource query parameters
    return this.fillGrid(
      this.gridConfiguratorService.fetchColumns(Grid.LitigeLignesLot)
    )
      .then(() => this.grid.instance.refresh());
  }

  public calculateClientAvoir(rowData: Partial<LitigeLigneFait>) {
    return rowData.ligne.clientPrixUnitaire * rowData.ligne.clientQuantite;
  }

  public calculateResponsableAvoir(rowData: Partial<LitigeLigneFait>) {
    return (
      rowData.ligne.devisePrixUnitaire * rowData.ligne.responsableQuantite
    );
  }

  public calculateCaption(column: GridColumn) {
    return this.localize.transform(
      `${Grid.LitigeLignesLot}-${column.dataField.split(".").pop()}`
    );
  }

  public formatToClientCurrency(value) {
    const items = (self.grid?.dataSource as DataSource)?.items();
    if (!items.length) return value.toString();
    const currency = items?.[0].ligne.ordreLigne.ordre.devise.id;
    return formatNumber(value, {
      type: "currency",
      precision: 2,
      currency,
    } as DevExpress.ui.Format);
  }

  public formatToResponsableCurrency(value) {
    const items = (self.grid?.dataSource as DataSource)?.items();
    if (!items.length) return value.toString();
    const currency = items?.[0].ligne.deviseCode;
    return formatNumber(value, {
      type: "currency",
      precision: 2,
      currency,
    } as DevExpress.ui.Format);
  }

  public getTotalSummaries(summaryItemName: string) {
    return this.grid.instance.getTotalSummaryValue(summaryItemName);
  }

  public getItems(datasource: DataSource = this.grid.dataSource as DataSource) {
    return datasource.items() as Partial<LitigeLigneFait>[];
  }

  /** Get a `litige-ligne` row value with a changed state */
  private getChanged(field: string, key: LitigeLigne["id"]) {
    return this.grid.editing.changes.find((change) => change.key === key)?.data
      .ligne?.[field];
  }

  public validate(rows: Array<Partial<LitigeLigneFait>>) {
    return from(rows).pipe(
      mergeMap((row) => {
        const changed = this.getChanged(
          "clientNombreColisReclamation",
          row.ligne.id
        );
        if (changed && changed > row.ligne.ordreLigne.nombreColisExpedies)
          return throwError(
            Error(
              this.localize.transform(
                "lot-litlig-col-reclam-greater-exped-error",
                rows.indexOf(row) + 1
              )
            )
          );
        return of(row);
      }),
      mergeMap((row) => {
        const changed = this.getChanged("clientNombrePalettes", row.ligne.id);
        if (changed && changed > row.ligne.ordreLigne.nombrePalettesExpediees) {
          let content = this.localize.transform(
            "lot-litlig-pal-reclam-greater-exped-error",
            rows.indexOf(row) + 1
          );
          content += "<br>" + this.localize.transform("prompt-continu");
          return this.confirmPopup
            .openAs("WARNING", content)
            .pipe(
              concatMap((res) =>
                res
                  ? of(row)
                  : throwError(
                    Error(this.localize.transform("validation-canceled"))
                  )
              )
            );
        }
        return of(row);
      }),
      mergeMap((row) => {
        const changed = this.getChanged("clientPoidsNet", row.ligne.id);
        if (changed && changed > row.ligne.ordreLigne.poidsNetExpedie)
          return throwError(
            Error(
              this.localize.transform(
                "lot-litlig-poids-reclam-greater-exped-error",
                rows.indexOf(row) + 1
              )
            )
          );
        return of(row);
      }),
      toArray()
    );
  }

  public calculateCustomSummary(options) {
    if (options.name === "avoirRemise") {
      switch (options.summaryProcess) {
        case "start":
          // Initializing "totalValue" here
          options.totalValue = 0;
          break;
        case "calculate":
          options.totalValue += GridLotComponent.calcAvoirRemise(
            options.value.ligne
          );
          // Modifying "totalValue" here
          break;
      }
    }
  }

  public setCellValue(
    newData: Partial<LitigeLigneFait>,
    value: any,
    rowData: Partial<LitigeLigneFait>
  ) {
    const context: any = this;
    context.defaultSetCellValue(newData, value, rowData);
    // Do not change anything when touching pal/col/poids if client keeps product
    if (self.headerData?.consequence === "F" &&
      (newData.ligne?.hasOwnProperty("clientPoidsNet") ||
        newData.ligne?.hasOwnProperty("clientNombrePalettes") ||
        newData.ligne?.hasOwnProperty("clientNombreColisReclamation"))) {
      newData.ligne.responsableNombrePalettes = 0;
      newData.ligne.responsableNombreColis = 0;
      newData.ligne.responsablePoidsNet = 0;
      return;
    }
    self.hasZeroQuantities = false;
    if (newData.hasOwnProperty("prixUnitaire")) return;
    if (newData.ligne?.hasOwnProperty("clientPrixUnitaire")) return self.setPrixUnitaires(newData, value, rowData);
    if (self.headerData?.consequence !== "F") self.setQuantite(newData, value, rowData);
  }

  onEditorPreparing(e) {
    // Positionnement curseur tout à gauche - CDT 527
    if (e.parentType == "dataRow" && e.dataField == "ligne.commentaireResponsable")
      e.editorOptions.onFocusIn = (elem) => this.formUtilsService.scrollLeftInputText(elem);
  }

  onToolbarPreparing(e) {
    // Hide save button
    e.toolbarOptions.items[0].visible = false;
  }
}
