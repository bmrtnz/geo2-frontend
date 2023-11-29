import { Component, Input, OnInit, ViewChild } from "@angular/core";
import Envois from "app/shared/models/envois.model";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { RaisonsAnnuleRemplaceService } from "app/shared/services/api/raisons-annule-remplace.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable, of, throwError } from "rxjs";
import { concatMapTo, map } from "rxjs/operators";
import { FluxArService } from "../flux-ar.service";

@Component({
  selector: "app-grid-annule-remplace",
  templateUrl: "./grid-annule-remplace.component.html",
  styleUrls: ["./grid-annule-remplace.component.scss"],
})
export class GridAnnuleRemplaceComponent implements OnInit {
  readonly AR_ENVOIS_FIELDS = [
    "id",
    "typeTiers.id",
    "typeTiers.description",
    "codeTiers",
    "dateDemande", // date_entete
    "dateSoumission", // date_lignes
    "dateEnvoi", // date_envois
    "numeroAcces2", // raison anule et remplace
    // extra fields for other grids display
    "flux.id",
    "nomContact",
    "moyenCommunication.id",
    "numeroAcces1",
    "imprimante.id",
  ];

  firstReason: any;
  public copyPasteVisible: boolean;
  public raisonsList: string[];
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public canBeSent: boolean;
  columnChooser = environment.columnChooser;
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @Input() ordre: { id: string } & Partial<Ordre>;

  constructor(
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public raisonsAnnuleRemplaceService: RaisonsAnnuleRemplaceService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    private functionsService: FunctionsService,
    private envoisService: EnvoisService,
    private ar: FluxArService
  ) {
    this.raisonsList = [];
    this.raisonsAnnuleRemplaceService
      .getDataSource_v2(["description"])
      .load()
      .then((res) => {
        res.map((inst) => this.raisonsList.push(inst.description));
      });
  }

  ngOnInit() {
    if (!this?.dataGrid?.dataSource) {
      this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
        Grid.AnnuleRemplace
      );
      this.columns = from(this.gridConfig).pipe(
        map((config) => config.columns)
      );
    }
  }

  onContentReady(event) {
    // Workaround for select all rows after loading data (without timeout do always select all)
    // if (!this.canSelectAll) return;
    // setTimeout(() => {
    //   event.component.selectAll();
    //   this.canSelectAll = false;
    //   this.canBeSent = true;
    // }, 500);
  }

  onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onValueChanged(event, cell) {
    if (cell.setValue) cell.setValue(event.value);
  }

  handleRaisonAR() {
    this.firstReason = (
      this.dataGrid?.dataSource as DataSource
    ).items()[0].numeroAcces2;
    let sameText = true;
    (this.dataGrid?.dataSource as DataSource).items().map((ds) => {
      if (ds.numeroAcces2 !== this.firstReason) sameText = false;
    });
    this.copyPasteVisible =
      !!this.firstReason &&
      !sameText &&
      (this.dataGrid?.dataSource as DataSource).items().length > 1;
  }

  displayCapitalize(data) {
    return data
      ? data.charAt(0).toUpperCase() + data.slice(1).toLowerCase()
      : null;
  }

  copyPasteFirstRow() {
    (this.dataGrid.dataSource as DataSource)
      .items()
      .map((ds) => (ds.numeroAcces2 = this.firstReason));
    this.dataGrid.instance.refresh();
  }

  // Used to override std arrows behaviour
  onSelectBoxInitialized(e) {
    const selectBox = e.component;
    selectBox.registerKeyHandler('downArrow', () => this.moveRows(selectBox, 1));
    selectBox.registerKeyHandler('upArrow', () => this.moveRows(selectBox, -1));
  }

  moveRows(selectBox, dir) {
    if (!selectBox.option('opened')) {
      this.dataGrid.instance.closeEditCell();
      const nextCell = {
        row: this.dataGrid.focusedRowIndex + dir,
        col: this.dataGrid.focusedColumnIndex
      };
      if (this.dataGrid.instance.getCellElement(nextCell.row, nextCell.col) && nextCell.row >= 0)
        this.dataGrid.instance.editCell(nextCell.row, nextCell.col);
    } else return true;
  }

  onKeyDown({ event }: { event: { originalEvent: KeyboardEvent } }) {
    const keyCode = event.originalEvent?.code;
    const columnOptions = this.dataGrid.instance.columnOption(this.dataGrid.focusedColumnIndex - 1);
    if (!["ArrowUp", "ArrowDown"].includes(keyCode) || columnOptions.name !== "numeroAcces2") return;
    const nextCell = {
      row: this.dataGrid.focusedRowIndex + (keyCode === "ArrowDown" ? 1 : -1),
      col: this.dataGrid.focusedColumnIndex
    };
    if (this.dataGrid.instance.getCellElement(nextCell.row, nextCell.col) && nextCell.row >= 0)
      this.dataGrid.instance.editCell(nextCell.row, nextCell.col);
  }

  reload() {
    this.canBeSent = false;
    this.functionsService
      .ofAREnvois(this.ordre.id)
      .pipe(
        concatMapTo(
          this.envoisService.getList(
            `ordre.id==${this.ordre.id} and traite==R`,
            this.AR_ENVOIS_FIELDS
          )
        ),
        map((res) => res.data.allEnvoisList)
      )
      .subscribe({
        next: (data) => {
          const uniqueTiers = [...new Set(data.map((e) => e.codeTiers))].map(
            (tier) => data.find((e) => e.codeTiers === tier)
          );
          this.dataGrid.dataSource = new DataSource(
            JSON.parse(JSON.stringify(uniqueTiers))
          ).on("changed", () => {
            this.handleRaisonAR();
          });
          setTimeout(() => {
            this.dataGrid.instance.selectAll();
            this.canBeSent = true;
          }, 1000);
        },
        error: (message) => notify({ message }, "error", 7000),
      });
  }

  public done() {
    const selection: Array<Partial<Envois>> =
      this.dataGrid.instance.getSelectedRowsData();
    if (!selection.every((envoi) => envoi.numeroAcces2))
      return throwError(
        Error(
          "Le motif d'annulation est obligatoire pour les envois sélectionnés"
        )
      );
    this.dataGrid.instance.getVisibleRows().forEach((row) => {
      if (row.isSelected)
        this.ar.setReason(row.data.codeTiers, row.data.numeroAcces2);
      else this.ar.pushIgnoredTier(row.data.codeTiers);
    });
    return of(selection);
  }
}
