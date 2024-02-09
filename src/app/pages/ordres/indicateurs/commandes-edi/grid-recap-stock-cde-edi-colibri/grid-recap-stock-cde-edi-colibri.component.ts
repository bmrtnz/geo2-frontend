import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { EdiOrdre } from "app/shared/models";
import { AuthService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { StockArticleEdiBassinService } from "app/shared/services/api/stock-article-edi-bassin.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../../../grids.service";
import { AjoutArticleEdiColibriPopupComponent } from "../ajout-article-edi-colibri-popup/ajout-article-edi-colibri-popup.component";
import DataSource from "devextreme/data/data_source";

let self;

@Component({
  selector: 'app-grid-recap-stock-cde-edi-colibri',
  templateUrl: './grid-recap-stock-cde-edi-colibri.component.html',
  styleUrls: ['./grid-recap-stock-cde-edi-colibri.component.scss']
})
export class GridRecapStockCdeEdiColibriComponent {
  @Input() popupShown: boolean;
  @Input() selectedRows: any[];
  @Input() public ordreEdiId: EdiOrdre["id"];
  @Output() public articleLigneId: string;
  @Output() public ligneEdi: any;
  @Output() selectChange = new EventEmitter<any>();
  @Output() valueChange = new EventEmitter<any>();
  @Output() hidePopup = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(AjoutArticleEdiColibriPopupComponent) public ajoutArtPopup: AjoutArticleEdiColibriPopupComponent;


  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public env = environment;
  public dataSource: DataSource;
  private colors = {};


  readonly specialFields = [
    "fournisseur.id",
    "proprietaire.id",
    "proprietaire.listeExpediteurs",
    "choix",
  ];

  constructor(
    public ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridsService: GridsService,
    public currentCompanyService: CurrentCompanyService,
    public dateManagementService: DateManagementService,
    private gridUtilsService: GridUtilsService,
    private stockArticleEdiBassinService: StockArticleEdiBassinService,
    public authService: AuthService,
    public functionsService: FunctionsService,
    public localizeService: LocalizationService,
  ) {
    self = this;
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.RecapStockCdeEdi
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  async enableFilters() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.dataSource = this.stockArticleEdiBassinService.getDataSource_v2(
      new Set([...this.specialFields, ...await fields.toPromise()])
    );
    this.dataSource.filter(["ordreEdi.id", "=", this.ordreEdiId]);
  }

  refreshGrid() {
    this.enableFilters();
  }

  setCellValue(newData, value) {
    const context: any = this;
    context.defaultSetCellValue(newData, value);
    setTimeout(() => self.valueChange.emit(), 10);
  }

  onEditorPreparing(e) {
    // KEEP THIS !!! See secureTypedValueWithEditGrid() comment
    if (e.parentType === "dataRow")
      e.editorOptions.onInput = elem => this.gridUtilsService.secureTypedValueWithEditGrid(elem);
  }

  onEditingStart(cell) {
    if (cell.column.dataField === "quantiteValidee" && !cell.data.fournisseur?.id)
      cell.cancel = true;
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      // Alternate colors vs numeroLigneEDI
      this.setAlternateColors();
      e.rowElement.classList.add(this.colors[e.data.id] ? "alternate-row-1" : "alternate-row-2");

      // Hiding checkboxes when there's no fournisseur assigned
      if (!e.data.fournisseur?.id) e.rowElement.classList.add("hide-select-checkbox");

      // Pre select row when "choix" value is true
      if (e.data.choix) {
        setTimeout(() => this.datagrid.instance.selectRows([e.data.id], true));
        e.rowElement.classList.add("dx-selection");
      }
    }
  }

  setAlternateColors() {
    let prevEdiLigne, alternate;
    this.datagrid.instance.getVisibleRows().map(row => {
      if (row.data.numeroLigneEDI !== prevEdiLigne) alternate = !alternate;
      this.colors[row.data.id] = alternate;
      prevEdiLigne = row.data.numeroLigneEDI;
    });
  }

  showWarning(data) {
    return !!self.selectedRows
      ?.find(r => r.numeroLigneEDI === data.numeroLigneEDI && r.warning && self.selectedRows.find(r => r.id === data.id));
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Column formatting
      if (["article.articleDescription.descriptionLongue", "article.id"].includes(e.column.dataField)) {
        if (!e.data.fournisseur?.id)
          e.cellElement.classList.add("red-font");
        if (e.data.flagHorsBassin === "BWS")
          e.cellElement.classList.add("bold-text");
      }
      if (e.column.dataField === "flagHorsBassin") {
        if (["BWS", "PLA", "ABS"].includes(e.value) ||
          e.data.bureauAchat.id === e.data.ordreEdi.bureauAchat.id ||
          (e.value === "DB" && e.data.age === "4")
        )
          e.cellElement.classList.add("bold-text");
        if (e.value === "HB") e.cellElement.classList.add("red-font");
      }
    }
  }

  oncellClick(e) {
    if (e.rowType == "data" && e.column.dataField !== "quantiteValidee") {
      e.event.stopImmediatePropagation(); // To avoid row selection
    }
  }

  addArticlePopup(cell) {
    this.ligneEdi = cell.data;
    this.ajoutArtPopup.visible = true;
  }

}

