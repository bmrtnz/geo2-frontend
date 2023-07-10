import { AfterViewInit, Component, Output, ViewChild } from "@angular/core";
import { Role } from "app/shared/models";
import { LocalizePipe } from "app/shared/pipes";
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import { GridsConfigsService } from "app/shared/services/api/grids-configs.service";
import { Indicateur } from "app/shared/services/api/indicateurs.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PaysDepassementService } from "app/shared/services/api/pays-depassement.service";
import { PaysService } from "app/shared/services/api/pays.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import {
  Indicator,
  OrdresIndicatorsService,
} from "app/shared/services/ordres-indicators.service";
import { GridColumn } from "basic";
import {
  DxDataGridComponent,
  DxSelectBoxComponent,
  DxSwitchComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../../grids.service";
import { TabContext } from "../../root/root.component";

@Component({
  selector: "app-clients-dep-encours",
  templateUrl: "./clients-dep-encours.component.html",
  styleUrls: ["./clients-dep-encours.component.scss"],
})
export class ClientsDepEncoursComponent implements AfterViewInit {
  readonly INDICATOR_NAME = Indicateur.ClientsDepassementEncours;

  @Output() public commercialId: string;
  @Output() public secteurId: string;

  public secteurs: DataSource;
  public pays: DataSource;
  public commercial: DataSource;
  indicator: Indicator;
  columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;

  @ViewChild("secteurValue", { static: false }) secteurSB: DxSelectBoxComponent;
  @ViewChild("paysValue", { static: false }) paysSB: DxSelectBoxComponent;
  @ViewChild("commercialValue", { static: false })
  commercialSB: DxSelectBoxComponent;
  @ViewChild("switchType", { static: false }) switchType: DxSwitchComponent;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  public title: string;

  constructor(
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public secteursService: SecteursService,
    public personnesService: PersonnesService,
    public gridsService: GridsService,
    public currentCompanyService: CurrentCompanyService,
    public ordresService: OrdresService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private localizePipe: LocalizePipe,
    private paysService: PaysService,
    private paysDepassementService: PaysDepassementService,
    public tabContext: TabContext
  ) {
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
    this.commercial = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.commercial.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.COMMERCIAL],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.paysUpdateDS();
    this.indicator = this.ordresIndicatorsService.getIndicatorByName(
      this.INDICATOR_NAME
    );
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.DepassementEncoursPays
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.title = this.localizePipe.transform(
      "grid-depassement-encours-pays-title"
    );
  }

  ngAfterViewInit() {
    if (!this.authService.isAdmin)
      this.secteurSB.value = this.authService.currentUser.secteurCommercial;
    // Retrieves last user configuration
    const depConfig = window.localStorage.getItem(`Encours-dep_${this.authService.currentUser.nomUtilisateur}`);
    if (["true", "false"].includes(depConfig)) {
      this.switchType.value = depConfig === "true" ? true : false;
    } else {
      this.switchType.value = true;
    }
    this.enableFilters();
  }

  switchAllDepChange(e) {
    // Save user configuration
    window.localStorage
      .setItem(`Encours-dep_${this.authService.currentUser.nomUtilisateur}`, e.value.toString());
    this.enableFilters();
  }

  enableFilters() {
    this.secteurId = this.secteurSB.value?.id;
    this.commercialId = this.commercialSB.value?.id;
    const filter = [];
    const filterItem = [];
    this.datagrid.dataSource = null;
    const dataSource = this.paysDepassementService.getDataSource(
      this.indicator.explicitSelection,
      {
        secteurCode: this.secteurSB.value?.id,
        societeCode: this.currentCompanyService.getCompany().id,
        commercialCode: this.commercialId ?? "%",
        depassementOnly: this.switchType.value,
      }
    );
    if (this.paysSB.value) filterItem.push(["id", "=", this.paysSB.value.id]);
    filterItem.forEach((element) => {
      filter.push(element);
      filter.push("and");
    });
    filter.pop(); // Remove last 'and'

    if (filter.length) dataSource.filter(filter);
    this.datagrid.dataSource = dataSource;
  }

  onSecteurChanged(e) {
    if (e.value) this.paysSB.value = null;
    this.paysUpdateDS(e.value?.id);
    if (!e.event) return;
    this.pays.load().then((res) => {
      if (res?.length === 1) this.paysSB.value = { id: res[0].id };
      this.enableFilters();
    });
  }

  onPaysChanged(e) {
    if (!e.event) return;
    this.enableFilters();
  }

  onCommChanged(e) {
    this.enableFilters();
    this.commercialId = e.value?.id;
  }

  paysUpdateDS(secteurId?) {
    this.pays = this.paysService.getDataSource_v2(
      ["id", "description"],
      "description"
    );
    const filter: any[] = [["valide", "=", true]];
    if (secteurId) {
      filter.push("and", ["secteur.id", "=", secteurId]);
    }
    this.pays.filter(filter);
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  onCellPrepared(e) {
    if (e.rowType === "header") {
      let classPrefix;
      switch (e.column.dataField) {
        case "clientsSommeEnCoursNonEchu":
        case "clientsSommeEnCours1a30":
          classPrefix = "green";
          break;
        case "clientsSommeEnCours31a60":
          classPrefix = "yellow";
          break;
        case "clientsSommeEnCours61a90":
          classPrefix = "orange";
          break;
        case "clientsSommeEnCours90Plus":
          classPrefix = "red";
          break;
        case "clientsSommeAlerteCoface":
          classPrefix = "dark-red";
          break;
      }
      if (classPrefix) e.cellElement.classList.add(`${classPrefix}-encours`);
    }

    if (
      [
        "clientsSommeDepassement",
        "clientsSommeEnCours61a90",
        "clientsSommeEnCours90Plus",
        "clientsSommeAlerteCoface",
      ].includes(e.column.dataField)
    )
      if (e.value > 0) e.cellElement.classList.add("highlight-err");

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
          e.cellElement.innerText = this.capitalize(e.cellElement.innerText);
        }
      }
    }
  }

  displayIDBefore(data) {
    return data
      ? data.id +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  openOrder(ordre) {
    if (!ordre.numero)
      return notify("Aucun ordre associé à cet en-cours", "warning", 4000);
    this.tabContext.openOrdre(ordre.numero, ordre.campagne.id);
  }
}

export default ClientsDepEncoursComponent;
