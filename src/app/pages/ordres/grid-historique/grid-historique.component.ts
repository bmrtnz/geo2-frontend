import {
  Component,
  Input,
  ViewChild,
} from "@angular/core";
import { Statut } from "app/shared/models/ordre.model";
import { AuthService } from "app/shared/services";
import { MruOrdresService } from "app/shared/services/api/mru-ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { historique } from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { TabContext } from "../root/root.component";
import { DateManagementService } from "app/shared/services/date-management.service";

@Component({
  selector: "app-grid-historique",
  templateUrl: "./grid-historique.component.html",
  styleUrls: ["./grid-historique.component.scss"],
})
export class GridHistoriqueComponent {
  @Input() public filter: [];
  @ViewChild(DxDataGridComponent, { static: true })
  histoGrid: DxDataGridComponent;

  readonly INDICATOR_NAME = "Historique";

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;

  public detailedFields: GridColumn[];

  constructor(
    public mruOrdresService: MruOrdresService,
    private dateManagementService: DateManagementService,
    public currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public tabContext: TabContext,
  ) {
    this.detailedFields = historique.columns as GridColumn[];
    this.dataSource = mruOrdresService.getDataSource_v2(
      this.detailedFields.map((property) => property.dataField),
    );
  }

  reload() {
    const filters = [
      [
        "utilisateur.nomUtilisateur",
        "=",
        this.authService.currentUser.nomUtilisateur,
      ],
      "and",
      ["societe.id", "=", this.currentCompanyService.getCompany().id],
      "and",
      [
        "dateModification",
        ">=",
        new Date(this.dateManagementService.findDate(-60)),
      ],
      "and",
      ["ordre.id", "<>", "null"]
    ];
    this.dataSource.filter(filters);
    this.histoGrid.dataSource = this.dataSource;
  }

  onCellPrepared(e) {
    // Best expression for order status display
    if (e.rowType === "data" && e.column.dataField === "ordre.statut") {
      if (Statut[e.value]) e.cellElement.innerText = Statut[e.value];
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
          e.cellElement.innerText +
          "/" +
          e.data.ordre.sommeColisExpedies;
      }
    }
  }
}
