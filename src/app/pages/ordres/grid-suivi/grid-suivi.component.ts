import {
  AfterViewInit, Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from "@angular/core";
import { Statut, StatutLocale } from "app/shared/models/ordre.model";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import gridsConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { TabContext } from "../root/root.component";
import { AuthService } from "app/shared/services";


@Component({
  selector: "app-grid-suivi",
  templateUrl: "./grid-suivi.component.html",
  styleUrls: ["./grid-suivi.component.scss"],
})
export class GridSuiviComponent implements AfterViewInit {
  @Output() public ordreSelected = new EventEmitter();
  @Output() public uniqueOrder = new EventEmitter();
  @Input() public filter: [];
  @ViewChild(DxDataGridComponent, { static: false })
  suivigrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];

  constructor(
    public ordresService: OrdresService,
    public localizeService: LocalizationService,
    public currentCompanyService: CurrentCompanyService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public tabContext: TabContext
  ) {
    this.detailedFields = gridsConfig.ordre.columns as GridColumn[];
    this.dataSource = ordresService.getDataSource_v2(
      this.detailedFields.map((property) => property.dataField)
    );
  }

  ngAfterViewInit() {
    this.enableFilters();
    this.suivigrid.dataSource = this.dataSource;
  }

  onContentReady(e) {
    // Emits order data to be opened when unique
    const visibleRows = e.component.getVisibleRows();
    if (visibleRows?.length === 1) this.uniqueOrder.emit(visibleRows[0].data);
  }

  enableFilters() {
    let filters = [
      ["valide", "=", true],
      "and",
      ["societe.id", "=", this.currentCompanyService.getCompany().id],
      "and",
      ["facture", "=", false],
    ];

    if (this.filter) filters = this.filter;
    this.dataSource.filter(filters);
  }

  reload() {
    this.dataSource.reload();
  }

  onCellPrepared(e) {
    // Best expression for order status display
    if (e.rowType === "data" && e.column.dataField === "statut") {
      if (Statut[e.value]) e.cellElement.innerText = this.localizeService.localize(StatutLocale[e.value])?.ucFirst();
    }
    // Palettes & Colis
    if (e.column.dataField === "totalNombrePalettesCommandees") {
      if (e.data?.totalNombrePalettesCommandees > 0) {
        e.cellElement.innerText =
          e.cellElement.innerText + "/" + e.data.totalNombrePalettesExpediees;
      }
    }
    if (e.column.dataField === "sommeColisCommandes") {
      if (e.data?.sommeColisCommandes > 0) {
        e.cellElement.innerText =
          e.cellElement.innerText + "/" + e.data.sommeColisExpedies;
      }
    }
  }
}
