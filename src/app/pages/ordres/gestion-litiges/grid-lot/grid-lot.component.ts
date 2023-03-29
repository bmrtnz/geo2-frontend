import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { ConfirmationResultPopupComponent } from "app/shared/components/confirmation-result-popup/confirmation-result-popup.component";
import { InfoPopupComponent } from "app/shared/components/info-popup/info-popup.component";
import LitigeLigneFait from "app/shared/models/litige-ligne-fait.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import { LocalizePipe } from "app/shared/pipes";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { ColumnsChangeSelection, Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import DevExpress from "devextreme";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { formatNumber } from "devextreme/localization";
import { defer, EMPTY, from, interval, Observable, of, throwError } from "rxjs";
import { concatMap, concatMapTo, filter, map, mergeMap, takeWhile, tap, timeout, toArray } from "rxjs/operators";
import { GridsService } from "../../grids.service";

let self: GridLotComponent;
@Component({
  selector: "app-grid-lot",
  templateUrl: "./grid-lot.component.html",
  styleUrls: ["./grid-lot.component.scss"]
})
export class GridLotComponent implements OnInit, OnChanges {

  constructor(
    private litigesLignesService: LitigesLignesService,
    private gridConfiguratorService: GridConfiguratorService,
    private gridsService: GridsService,
    private localize: LocalizePipe,
  ) {
    self = this;
  }

  @Input() lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];

  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;
  @ViewChild(ConfirmationResultPopupComponent) private confirmPopup: ConfirmationResultPopupComponent;

  /** Fields processed by `byCellTemplate` */
  public readonly byTemplateConfig = {
    "ligne.clientNombrePalettes": "ligne.ordreLigne.nombrePalettesExpediees",
    "ligne.clientNombreColisReclamation": "ligne.ordreLigne.nombreColisExpedies",
    "ligne.clientPoidsNet": "ligne.ordreLigne.poidsNetExpedie",
  };

  public dataSource: DataSource;
  public columns: Observable<GridColumn[]>;
  public gridConfigHandler = event =>
    this.gridConfiguratorService.init(Grid.LitigeLignesLot, {
      ...event,
      onColumnsChange: this.onColumnsChange.bind(this),
    })

  ngOnInit(): void {
    this.columns = this.gridConfiguratorService.fetchColumns(Grid.LitigeLignesLot);
    this.gridsService.register("LitigeLignesLot", this.grid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lot.currentValue !== changes.lot.previousValue) {
      this.fillGrid(this.gridConfiguratorService.fetchColumns(Grid.LitigeLignesLot));
    }
  }

  private onColumnsChange({ current }: ColumnsChangeSelection) {
    this.columns = of(current);
    this.fillGrid(of(current));
  }

  private async fillGrid(columns: Observable<GridColumn[]>) {
    this.dataSource = await (columns).pipe(
      filter(() => !!this.lot),
      concatMap(resolvedColumns => this.fetchDatasource(resolvedColumns, ...this.lot)),
    ).toPromise();
  }

  private fetchDatasource(
    columns: GridColumn[],
    litigeID: Litige["id"],
    numeroGroupement?: LitigeLigne["numeroGroupementLitige"],
  ) {
    return of(columns).pipe(
      GridConfiguratorService.filterNonVirtual(),
      GridConfiguratorService.getVisible(),
      GridConfiguratorService.getFields(),
      map(fields => [
        ...fields,
        "ligne.id",
        "ligne.litige.id",
        "ligne.clientNombrePalettes",
        "ligne.clientNombreColisReclamation",
        "ligne.ordreLigne.article.id",
        "ligne.ordreLigne.article.articleDescription.id",
        "ligne.ordreLigne.nombrePalettesExpediees",
        "ligne.ordreLigne.nombreColisExpedies",
        "ligne.ordreLigne.poidsNetExpedie",
        "ligne.ordreLigne.article.id",
        "ligne.ordreLigne.proprietaireMarchandise.code",
        "ligne.ordreLigne.fournisseur.code",
      ]),
      map(fields =>
        // upgrade fields that require sub selections
        fields.map(field => {
          if (field === "ligne.cause")
            return "ligne.cause.id";
          if (field === "ligne.consequence")
            return "ligne.consequence.id";
          return field;
        })
      ),
      map(fields => this.litigesLignesService
        .allLitigeLigneFaitDatasource(litigeID, numeroGroupement ?? "", new Set(fields))),
    );
  }

  /**
   * Met a jour l'ensemble des lignes de la grille (le lot) avec les données en parametre
   * Si une seule ligne est fournie, les données seront clonées dans toutes les lignes du lot
   */
  public updateLot(data: Partial<LitigeLigne> | Partial<LitigeLigne>[]) {
    return interval(100)
      .pipe(
        concatMapTo(defer(() => of(this.grid?.dataSource as DataSource))),
        takeWhile(datasource => !datasource?.items()?.length, true),
        filter(datasource => !!datasource?.items()?.length),
        concatMap(datasource => {
          this.getItems(datasource).forEach((item, rowIndex) => {
            if (Array.isArray(data)) {
              const index = data.findIndex(row => row.id === item.ligne.id);
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
        timeout(10000),
      );
  }

  /** Persist grid changes */
  public persist() {
    return defer(() => this.grid.instance.saveEditData());
  }

  /** Reloads grid data and repaints data rows, wrapper around `dxDataGrid.refresh` */
  public refresh() {
    return this.grid.instance.refresh();
  }

  public calculateClientAvoir(rowData: Partial<LitigeLigneFait>) {
    return rowData.ligne.clientQuantite * rowData.ligne.clientPrixUnitaire;
  }

  public calculateResponsableAvoir(rowData: Partial<LitigeLigneFait>) {
    return rowData.ligne.responsableQuantite * rowData.ligne.responsablePrixUnitaire;
  }

  public calculateCaption(column: GridColumn) {
    return this.localize.transform(`${Grid.LitigeLignesLot}-${column.dataField.split(".").pop()}`);
  }

  public formatToClientCurrency(value) {
    const items = (self.grid?.dataSource as DataSource)?.items();
    if (!items.length) return value;
    const currency = items?.[0].ligne.ordreLigne.ordre.devise.id;
    return formatNumber(value, {
      type: "currency",
      precision: 2,
      currency
    } as DevExpress.ui.format);
  }

  public formatToResponsableCurrency(value) {
    const items = (self.grid?.dataSource as DataSource)?.items();
    if (!items.length) return value;
    const currency = items?.[0].ligne.deviseCode;
    return formatNumber(value, {
      type: "currency",
      precision: 2,
      currency
    } as DevExpress.ui.format);
  }

  public getTotalSummaries(summaryItemName: string) {
    return this.grid.instance.getTotalSummaryValue(summaryItemName);
  }

  public getItems(datasource: DataSource = (this.grid.dataSource as DataSource)) {
    return (datasource.items() as Partial<LitigeLigneFait>[]);
  }

  /** Get a `litige-ligne` row value with a changed state */
  private getChanged(field: string, key: LitigeLigne["id"]) {
    return this.grid.editing.changes
      .find(change => change.key === key)
      ?.data.ligne?.[field];
  }

  public validate(rows: Array<Partial<LitigeLigneFait>>) {
    return from(rows).pipe(
      mergeMap(row => {
        const changed = this.getChanged("clientNombreColisReclamation", row.ligne.id);
        if (changed && changed > row.ligne.ordreLigne.nombreColisExpedies)
          return throwError(Error(this.localize.transform("lot-litlig-col-reclam-greater-exped-error", rows.indexOf(row) + 1)));
        return of(row);
      }),
      mergeMap(row => {
        const changed = this.getChanged("clientNombrePalettes", row.ligne.id);
        if (changed && changed > row.ligne.ordreLigne.nombrePalettesExpediees) {
          let content = this.localize.transform("lot-litlig-pal-reclam-greater-exped-error", rows.indexOf(row) + 1);
          content += "<br>" + this.localize.transform("prompt-continu");
          return this.confirmPopup.openAs("WARNING", content)
            .pipe(concatMap(res => res ? of(row) : throwError(Error(this.localize.transform("validation-canceled")))));
        }
        return of(row);
      }),
      mergeMap(row => {
        const changed = this.getChanged("clientPoidsNet", row.ligne.id);
        if (changed && changed > row.ligne.ordreLigne.poidsNetExpedie)
          return throwError(Error(this.localize.transform("lot-litlig-poids-reclam-greater-exped-error", rows.indexOf(row) + 1)));
        return of(row);
      }),
      toArray(),
    );
  }

}

