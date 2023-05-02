import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { AuthService } from "app/shared/services";
import { SummaryType } from "app/shared/services/api.service";
import { alert } from "devextreme/ui/dialog";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { TabContext } from "../../root/root.component";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../../grids.service";
import { ModifDetailLignesPopupComponent } from "../../modif-detail-lignes-popup/modif-detail-lignes-popup.component";
import { LignesChargementService } from "app/shared/services/api/lignes-chargement.service";
import LigneChargement from "app/shared/models/ligne-chargement.model";
import { Operation } from "app/shared/services/api/lignes-chargement.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";

@Component({
  selector: "app-grid-lignes-groupage-chargements",
  templateUrl: "./grid-lignes-groupage-chargements.component.html",
  styleUrls: ["./grid-lignes-groupage-chargements.component.scss"],
})
export class GridLignesGroupageChargementsComponent
  implements AfterViewInit, OnChanges
{
  @Input() public ordre: Ordre;
  @Input() public gridCdes: any;
  @Input() public gridEnv: any;
  @Input() public readOnlyGrid;
  @Output() public gridCommandes: any;
  @Output() public gridEnvois: any;
  @Output() closePopup = new EventEmitter();
  @Output() updateGridCde = new EventEmitter();
  @Output() updateOrder = new EventEmitter();

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public allowMutations = false;
  public totalItems: {
    column: string;
    summaryType: SummaryType;
    displayFormat?: string;
  }[] = [];
  public gridFilter: any[];
  public gridExpFiltered: boolean;
  public gridRowsTotal: number;
  private dataField: string;
  private ligneOrdre: Partial<LigneChargement>;
  public unsavedData: boolean;

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(ModifDetailLignesPopupComponent, { static: false })
  modifDetailPopup: ModifDetailLignesPopupComponent;

  constructor(
    public lignesChargementService: LignesChargementService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
    public gridUtilsService: GridUtilsService,
    private gridsService: GridsService,
    public tabContext: TabContext,
    public currentCompanyService: CurrentCompanyService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.LignesGroupageChargements
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  ngAfterViewInit() {
    this.gridsService.register("GroupageChargement", this.datagrid);
  }

  ngOnChanges() {
    this.allowMutations = !Ordre.isCloture(this.ordre);
    this.gridCommandes = this.gridCdes;
    this.gridEnvois = this.gridEnv;
  }

  async enableFilters(e?) {
    if (!this.datagrid) return;
    if (this?.ordre?.id) {
      const fields = this.columns.pipe(
        map((columns) =>
          columns.map((column) => {
            return column.dataField;
          })
        )
      );

      this.dataSource = this.lignesChargementService.getDataSource(
        {
          campagne: this.ordre.campagne.id,
          codeChargement: this.ordre.codeChargement,
        },
        new Set(await fields.toPromise())
      );

      this.datagrid.dataSource = this.dataSource;
      this.gridUtilsService.resetGridScrollBar(this.datagrid);
    } else if (this.datagrid) this.datagrid.dataSource = null;
  }

  saveGridEditData() {
    setTimeout(() => this.datagrid.instance.saveEditData());
  }

  onContentReady(e) {
    this.gridRowsTotal = this.datagrid.instance.getVisibleRows()?.length;
    this.unsavedData = this.datagrid.instance.hasEditData();
  }

  onEditorPreparing(e) {
    if (e.parentType === "dataRow") {
      e.editorOptions.onValueChanged = (elem) => {
        const rows = this.datagrid.instance.getVisibleRows();

        if (
          ![
            "dateDepartPrevue",
            "dateLivraisonPrevue",
            "dateDepartPrevueFournisseur",
            "numeroCamion",
            "ordreChargement",
          ].includes(this.dataField)
        )
          return;

        ///////////////////////////////
        // Update other cells value
        ///////////////////////////////

        switch (this.dataField) {
          case "dateDepartPrevue":
          case "dateLivraisonPrevue": {
            // Copy paste on all rows
            rows.map((res) => this.updateRowsAndDs(res, elem));
            break;
          }
          case "dateDepartPrevueFournisseur": {
            // Copy paste on same fournisseur rows
            rows
              .filter(
                (l) =>
                  l.data.codeFournisseur === this.ligneOrdre.codeFournisseur
              )
              .map((res) => this.updateRowsAndDs(res, elem));
            break;
          }
          case "ordreChargement":
          case "numeroCamion": {
            // Copy paste on same order rows
            rows
              .filter((l) => l.data.ordre.id === this.ligneOrdre.ordre.id)
              .map((res) => this.updateRowsAndDs(res, elem));
            break;
          }
        }
        this.dataField = "";
        this.saveData();
      };
    }
  }

  updateRowsAndDs(res, elem) {
    // Saving value
    this.datagrid.instance.cellValue(res.rowIndex, this.dataField, elem.value);
    // Updating datasource
    (this.datagrid.dataSource as DataSource)
      .items()
      .filter((r) => r.ligne.id === res.data.ligne.id)[0][this.dataField] =
      elem.value;
    // Updating row data
    // this.datagrid.instance.getVisibleRows()[res.rowIndex].data[this.dataField] = elem.value;
  }

  onToolbarPreparing(e) {
    // Hide save/undo buttons
    if (!this.readOnlyGrid) {
      e.toolbarOptions.items[0].visible = false;
      e.toolbarOptions.items[1].visible = false;
    }
  }

  onCellClick(e) {
    this.dataField = "";
    if (e.rowType !== "data") return;
    this.dataField = e.column.dataField;
    this.ligneOrdre = e.row?.data;
    if (this.dataField === "numeroOrdre") {
      e.event.stopImmediatePropagation();
      this.tabContext.openOrdre(e.data.numeroOrdre, e.data.ordre.campagne.id);
    }
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      e.rowElement.classList.add("cursor-pointer");
    }
  }

  onCellPrepared(e) {
    const field = e.column.dataField;

    if (e.rowType === "data") {
      // Higlight editable columns
      if (
        [
          "dateDepartPrevue",
          "dateLivraisonPrevue",
          "dateDepartPrevueFournisseur",
          "numeroCamion",
          "ordreChargement",
        ].includes(e.column.dataField)
      ) {
        e.cellElement.classList.add("grey-light-column"); // grey bkg
      }
    }

    // Adjust numero ordre cell info/style
    if (field === "numeroOrdre") {
      e.cellElement.classList.add("text-underlined-pointer");
      e.cellElement.setAttribute(
        "title",
        this.localizeService.localize("hint-click-ordre")
      );
    }
  }

  onSelectionChanged(e) {
    // Only one order can be selected at once
    if (e.selectedRowsData?.length > 1) {
      if (
        e.selectedRowsData[e.selectedRowsData.length - 1].ordre.id !==
        e.selectedRowsData[0].ordre.id
      ) {
        e.selectedRowKeys.pop();
        e.component.deselectRows(e.selectedRowKeys);
      }
    }
  }

  saveData(quitPopup?) {
    const modified = "modified"; // Curiously, unknown default property
    const modifiedRows = this.datagrid.instance
      .getVisibleRows()
      .filter((r) => r[modified]);
    if (modifiedRows.length) {
      // Loop through edited rows
      this.datagrid.instance.beginCustomLoading("");
      const allLigneChargement = [];
      modifiedRows.map((row) => {
        const d = row.data;
        allLigneChargement.push({
          id: d.id,
          numeroCamion: d.numeroCamion,
          ordreChargement: d.ordreChargement,
          dateDepartPrevue: d.dateDepartPrevue.split("T")[0] + "T00:00",
          dateLivraisonPrevue: d.dateLivraisonPrevue.split("T")[0] + "T00:00",
          dateDepartPrevueFournisseur:
            d.dateDepartPrevueFournisseur.split("T")[0] + "T00:00",
        });
      });
      this.lignesChargementService
        .saveAll(allLigneChargement, new Set(["id"]))
        .subscribe({
          next: (res) => {
            if (quitPopup) {
              // Message and close
              notify("Sauvegardé", "success", 3000);
              this.datagrid.instance.endCustomLoading();
              this.closePopup.emit();
            } else {
              this.datagrid.instance.cancelEditData();
              this.datagrid.instance.refresh();
              this.datagrid.instance.endCustomLoading();
              this.updateOrder.emit();
            }
          },
          error: (error: Error) => {
            console.log(error);
            notify(this.messageFormat(error.message), "error", 7000);
            this.datagrid.instance.endCustomLoading();
          },
          complete: () => this.datagrid.instance.endCustomLoading(),
        });
    } else {
      if (quitPopup) this.closePopup.emit();
    }
  }

  validGrouping() {
    this.saveData(true);
  }

  transferOrDuplicate(operation: Operation) {
    this.lignesChargementService
      .transferOrDuplicate(
        operation,
        this.datagrid.selectedRowKeys,
        this.ordre.codeChargement,
        this.ordre.id,
        new Set(["id", "ordre.numero"])
      )
      .subscribe({
        next: (res) => {
          const data = res.data[operation];
          const numOrdre = data[0].ordre.numero;
          const campOrdre = this.currentCompanyService.getCompany().campagne.id;
          let message = this.localizeService
            .localize("ordre-cree")
            .replace("&O", numOrdre);
          message +=
            " - " + this.localizeService.localize(`ordre-${operation}-lignes`);
          message = message
            .replace("&L", data.length.toString())
            .split("&&")
            .join(data.length > 1 ? "s" : "");
          notify(message, "success", 7000);
          this.datagrid.instance.clearSelection();
          if (operation === "transfer") {
            this.datagrid.instance.refresh();
            this.updateGridCde.emit();
            this.gridsService.reload(
              "SyntheseExpeditions",
              "DetailExpeditions"
            );
          }
          this.tabContext.openOrdre(numOrdre, campOrdre, false);
          setTimeout(
            () =>
              this.tabContext.openOrdre(
                this.ordre.numero,
                this.ordre.campagne.id,
                false
              ),
            500
          );
        },
        error: (error: Error) => {
          console.log(error);
          alert(
            this.messageFormat(error.message),
            this.localizeService.localize(`ordre-${operation}-creation`)
          );
        },
      });
  }

  private messageFormat(mess) {
    const functionNames = ["duplicate", "transfer"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }
}
