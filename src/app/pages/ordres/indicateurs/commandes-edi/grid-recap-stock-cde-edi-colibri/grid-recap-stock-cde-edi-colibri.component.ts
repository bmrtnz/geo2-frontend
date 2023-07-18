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
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../../../grids.service";


@Component({
  selector: 'app-grid-recap-stock-cde-edi-colibri',
  templateUrl: './grid-recap-stock-cde-edi-colibri.component.html',
  styleUrls: ['./grid-recap-stock-cde-edi-colibri.component.scss']
})
export class GridRecapStockCdeEdiColibriComponent {
  @Input() popupShown: boolean;
  @Input() public ordreId: string;
  @Output() public articleLigneId: string;
  @Output() selectChange = new EventEmitter<any>();
  @Output() hidePopup = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;


  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public env = environment;
  private oldgtin: string;
  private alternateOrder: boolean;

  constructor(
    public ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridsService: GridsService,
    public currentCompanyService: CurrentCompanyService,
    public dateManagementService: DateManagementService,
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
      map((cols) =>
        cols.map((column) => {
          return column.dataField;
        })
      )
    );
    const gridFields = await fields.toPromise();
    const dataSource = this.ordreLignesService.getListDataSource([
      ...gridFields,
      "ordre.id",
      "ordre.statut",
    ]);

    const filter = [
      [`ordre.id`, "=", this.ordreId]
    ];
    dataSource.filter(filter);
    this.datagrid.dataSource = dataSource;
  }

  onRowPrepared(e) {
    // Highlight canceled orders
    if (e.rowType === "data") {
      if (e.data?.gtinColisKit !== this.oldgtin) {
        this.alternateOrder = !this.alternateOrder;
        this.oldgtin = e.data?.gtinColisKit;
      }
      e.rowElement.classList.add(this.alternateOrder ? "green-row" : "blue-row");
    }
  }


  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Descript. article
      if (
        e.column.dataField ===
        "article.articleDescription.descriptionReferenceLongue"
      ) {
        e.cellElement.title = e.value;
      }
    }
  }

  openFilePopup(cell, e) {
  }

}

