import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
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
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../../../grids.service";
import { AjoutArticleEdiColibriPopupComponent } from "../ajout-article-edi-colibri-popup/ajout-article-edi-colibri-popup.component";


@Component({
  selector: 'app-grid-recap-stock-cde-edi-colibri',
  templateUrl: './grid-recap-stock-cde-edi-colibri.component.html',
  styleUrls: ['./grid-recap-stock-cde-edi-colibri.component.scss']
})
export class GridRecapStockCdeEdiColibriComponent {
  @Input() popupShown: boolean;
  @Input() public ordreEdiId: string;
  @Output() public articleLigneId: string;
  @Output() public ligneEdi: any;
  @Output() selectChange = new EventEmitter<any>();
  @Output() hidePopup = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(AjoutArticleEdiColibriPopupComponent) public ajoutArtPopup: AjoutArticleEdiColibriPopupComponent;


  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public env = environment;
  private oldgtin: string;
  private alternateOrder: boolean;

  readonly specialFields = [
    "fournisseur.id",
    "proprietaire.id",
    "proprietaire.listeExpediteurs",
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
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.RecapStockCdeEdi
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  async enableFilters() {

    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    const dataSource = this.stockArticleEdiBassinService.getDataSource_v2(
      new Set([...this.specialFields, ...await fields.toPromise()])
    );
    this.datagrid.dataSource = dataSource;
  }

  refreshGrid() {
    this.datagrid.instance.refresh();
  }

  onEditorPreparing(e) {
    // KEEP THIS !!! See secureTypedValueWithEditGrid() comment
    if (e.parentType === "dataRow")
      e.editorOptions.onInput = elem => this.gridUtilsService.secureTypedValueWithEditGrid(elem);
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      // Alternate colors vs gtin
      if (e.data?.gtin !== this.oldgtin) {
        this.alternateOrder = !this.alternateOrder;
        this.oldgtin = e.data?.gtin;
      }
      e.rowElement.classList.add(this.alternateOrder ? "green-row" : "blue-row");

      // Hiding checkboxes when there's no fournisseur assigned
      if (!e.data.fournisseur?.id) e.rowElement.classList.add("hide-select-checkbox");
    }
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

  addArticlePopup(cell) {
    this.ligneEdi = cell.data;
    this.ajoutArtPopup.visible = true;
  }

}

