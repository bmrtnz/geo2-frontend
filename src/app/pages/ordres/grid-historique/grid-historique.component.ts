import { Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Statut, StatutLocale } from "app/shared/models/ordre.model";
import { MruOrdresService } from "app/shared/services/api/mru-ordres.service";
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

@Component({
  selector: "app-grid-historique",
  templateUrl: "./grid-historique.component.html",
  styleUrls: ["./grid-historique.component.scss"],
})
export class GridHistoriqueComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true })
  histoGrid: DxDataGridComponent;

  @Output() public ordreSelected = new EventEmitter();

  readonly INDICATOR_NAME = "Historique";

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];
  public statutsSource;

  constructor(
    public mruOrdresService: MruOrdresService,
    public ordresService: OrdresService,
    public localize: LocalizationService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public tabContext: TabContext
  ) {
    this.detailedFields = gridsConfig.historique.columns as GridColumn[];
    this.dataSource = mruOrdresService.getHeadListDataSource(
      this.detailedFields.map((property) => property.dataField)
    );
  }
  ngOnInit(): void {
    this.statutsSource = Object
      .entries(Statut)
      .map(([key]) => ({
        text: this.localize.localize(StatutLocale[key]),
        value: key,
      }));
  }

  reload() {
    this.histoGrid.dataSource = this.dataSource;
  }

  onCellPrepared(e) {
    // Best expression for order status display
    if (e.rowType === "data" && e.column.dataField === "ordre.statut") {
      if (Statut[e.value]) e.cellElement.innerText = this.localizeService.localize(StatutLocale[e.value]);
    }
    // Palettes & Colis
    if (e.column.dataField === "ordre.totalNombrePalettesCommandees") {
      if (e.data?.ordre.totalNombrePalettesCommandees > 0) {
        e.cellElement.innerText =
          e.cellElement.innerText +
          "/" +
          e.data.ordre.totalNombrePalettesExpediees;
      }
    }
    if (e.column.dataField === "ordre.sommeColisCommandes") {
      if (e.data?.ordre.sommeColisCommandes > 0) {
        e.cellElement.innerText =
          e.cellElement.innerText + "/" + e.data.ordre.sommeColisExpedies;
      }
    }
  }
}
