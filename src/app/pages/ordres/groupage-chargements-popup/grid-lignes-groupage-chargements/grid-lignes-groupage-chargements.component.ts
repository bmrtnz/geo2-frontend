import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { AuthService } from "app/shared/services";
import { SummaryType } from "app/shared/services/api.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
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


@Component({
  selector: "app-grid-lignes-groupage-chargements",
  templateUrl: "./grid-lignes-groupage-chargements.component.html",
  styleUrls: ["./grid-lignes-groupage-chargements.component.scss"]
})
export class GridLignesGroupageChargementsComponent implements AfterViewInit, OnChanges {

  @Input() public ordre: Ordre;
  @Input() public gridCdes: any;
  @Input() public gridEnv: any;
  @Output() public gridCommandes: any;
  @Output() public gridEnvois: any;
  @Output() closePopup = new EventEmitter();

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public allowMutations = false;
  public totalItems: { column: string, summaryType: SummaryType, displayFormat?: string }[] = [];
  public gridFilter: any[];
  public gridExpFiltered: boolean;
  public gridRowsTotal: number;
  private dataField: string;

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(ModifDetailLignesPopupComponent, { static: false }) modifDetailPopup: ModifDetailLignesPopupComponent;

  constructor(
    public ordreLignesService: OrdreLignesService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
    public gridUtilsService: GridUtilsService,
    private gridsService: GridsService,
    public tabContext: TabContext,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.LignesGroupageChargements);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
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
      const fields = this.columns.pipe(map(columns => columns.map(column => {
        return column.dataField;
      })));

      this.dataSource = this.ordreLignesService.getDataSource_v2(await fields.toPromise());
      this.gridFilter = [
        ["ordre.codeChargement", "isnotnull", null],
        "and",
        ["ordre.codeChargement", "=", this.ordre.codeChargement]
      ]; // FAKE FOR FRONT TESTING
      this.dataSource.filter(this.gridFilter);
      this.datagrid.dataSource = this.dataSource;
      this.gridUtilsService.resetGridScrollBar(this.datagrid);
    } else if (this.datagrid)
      this.datagrid.dataSource = null;
  }

  saveGridEditData() {
    setTimeout(() => this.datagrid.instance.saveEditData());
  }

  onContentReady(e) {
    this.gridRowsTotal = this.datagrid.instance.getVisibleRows()?.length;
  }

  onEditorPreparing(e) {
    if (e.parentType === "dataRow") {
      e.editorOptions.onValueChanged = (elem) => {
        // Copy paste on all rows
        // const rows = this.datagrid.instance.getVisibleRows();
        // rows.map((res) => this.datagrid.instance.cellValue(res.rowIndex, this.dataField, elem.value));
      };
    }
  }

  onToolbarPreparing(e) {
    // Hide grid save button
    e.toolbarOptions.items[0].visible = false;
  }

  onCellClick(e) {
    if (e.rowType !== "data") return;
    this.dataField = e.column.dataField;
    if (this.dataField === "ordre.numero") {
      e.event.stopImmediatePropagation();
      this.tabContext.openOrdre(e.data.ordre.numero, e.data.ordre.campagne.id);
    }
  }

  onCellPrepared(e) {

    const field = e.column.dataField;

    if (e.rowType === "data") {
      // Higlight editable columns
      if ([
        "ordre.dateDepartPrevue",
        "ordre.dateLivraisonPrevue",
        "logistique.dateDepartPrevueFournisseur",
        "poidsBrutExpedie",
        "$$$camion",              // A modifier dès qu'on a l'info
        "$$$ordre chargement"     // A modifier dès qu'on a l'info
      ].includes(e.column.dataField)) {
        e.cellElement.classList.add("grey-light-column"); // grey bkg
      }
    }

    // Adjust numero ordre cell info/style
    if (field === "ordre.numero") {
      e.cellElement.classList.add("text-underlined-pointer");
      e.cellElement.setAttribute(
        "title",
        this.localizeService.localize("hint-click-ordre"),
      );
    }
  }

  validGrouping() {

    this.closePopup.emit();
  }

  transferGrouping() {

  }

  duplicateGrouping() {

  }

}


