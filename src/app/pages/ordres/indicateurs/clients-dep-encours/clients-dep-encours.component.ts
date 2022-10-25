import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { LocalizePipe } from "app/shared/pipes";
import {
  AuthService,
  LocalizationService,
  TransporteursService
} from "app/shared/services";
import { GridsConfigsService } from "app/shared/services/api/grids-configs.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PaysDepassementService } from "app/shared/services/api/pays-depassement.service";
import { PaysService } from "app/shared/services/api/pays.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import {
  Indicator,
  OrdresIndicatorsService
} from "app/shared/services/ordres-indicators.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-clients-dep-encours",
  templateUrl: "./clients-dep-encours.component.html",
  styleUrls: ["./clients-dep-encours.component.scss"],
})
export class ClientsDepEncoursComponent implements AfterViewInit {
  readonly INDICATOR_NAME = "ClientsDepEncours";

  secteurs: DataSource;
  indicator: Indicator;
  columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;

  @ViewChild("secteurValue", { static: false })
  secteurSB: DxSelectBoxComponent;
  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;

  public dataSource: DataSource;
  public title: string;

  constructor(
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public secteursService: SecteursService,
    public currentCompanyService: CurrentCompanyService,
    public ordresService: OrdresService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private localizePipe: LocalizePipe,
    private paysService: PaysService,
    private paysDepassementService: PaysDepassementService,
  ) {
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      [
        "societes",
        "contains",
        this.currentCompanyService.getCompany().id,
      ],
    ]);
    this.indicator = this.ordresIndicatorsService.getIndicatorByName(
      this.INDICATOR_NAME,
    );
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.DepassementEncoursPays,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
    this.title = this.localizePipe.transform(
      "grid-depassement-encours-pays-title",
    );
  }

  ngAfterViewInit() {
    if (!this.authService.isAdmin)
      this.secteurSB.value =
        this.authService.currentUser.secteurCommercial;
    this.enableFilters();
  }

  enableFilters() {
    this.grid.dataSource = null;
    // const filters = this.indicator.cloneFilter();
    // if (this.secteurSB.value?.id)
    //   filters.push("and", ["secteur.id", "=", this.secteurSB.value.id]);
    const dataSource = this.paysDepassementService
      .getDataSource(this.indicator.explicitSelection, {
        secteurCode: this.secteurSB.value?.id,
        societeCode: this.currentCompanyService.getCompany().id,
      });
    // dataSource.filter(filters);
    this.grid.dataSource = dataSource;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  onCellPrepared(e) {
    if ([
      "clientsSommeDepassement",
      "clientsSommeEnCours61a90",
      "clientsSommeEnCours90Plus",
      "clientsSommeAlerteCoface",
    ].includes(e.column.dataField))
      if (e.value > 0)
        e.cellElement.classList.add("highlight-err");

    // Formating figures: 1000000 becomes 1 000 000 €
    if (e.rowType === "data") {
      if (
        e.column.dataType === "number" &&
        !e.cellElement.innerText.includes("€")
      ) {
        e.cellElement.innerText =
          e.cellElement.innerText
            .split("")
            .reverse()
            .join("")
            .replace(/([0-9]{3})/g, "$1 ")
            .split("")
            .reverse()
            .join("") + " €";
      } else {
        if (e.column.dataField === "description") {
          e.cellElement.innerText = this.capitalize(
            e.cellElement.innerText,
          );
        }
      }
    }
  }
}

export default ClientsDepEncoursComponent;
