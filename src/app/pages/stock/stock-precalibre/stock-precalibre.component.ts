import {
  AfterViewInit,
  Component,
  EventEmitter,
  Output,
  ViewChild,
} from "@angular/core";
import { FournisseursService, LocalizationService } from "app/shared/services";
import { StocksService } from "app/shared/services/api/stocks.service";
import { DxNumberBoxComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { Observable } from "rxjs";
import { GridsService } from "../../ordres/grids.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { ModesCultureService } from "app/shared/services/api/modes-culture.service";
import { GridPrecalibrePommeComponent } from "./grid-precalibre-pomme/grid-precalibre-pomme.component";

@Component({
  selector: "app-stock-precalibre",
  templateUrl: "./stock-precalibre.component.html",
  styleUrls: ["./stock-precalibre.component.scss"],
})
export class StockPrecalibreComponent implements AfterViewInit {
  @Output() public fournisseurId: string;
  @Output() public especeId: string;
  @Output() public varieteId: string;
  @Output() public modeCultureId: string;
  @Output() public refreshGrid = new EventEmitter();

  @ViewChild("varieteSB", { static: false }) varieteSB: DxSelectBoxComponent;
  @ViewChild("especeSB", { static: false }) especeSB: DxSelectBoxComponent;
  @ViewChild("modesCultureSB", { static: false })
  modesCultureSB: DxSelectBoxComponent;
  @ViewChild("weekBox", { static: false }) weekBox: DxNumberBoxComponent;
  @ViewChild(GridPrecalibrePommeComponent, { static: false })
  gridPomme: GridPrecalibrePommeComponent;

  public fournisseurs: DataSource;
  public modesCulture: DataSource;
  especes: Observable<DataSource>;
  varietes: Observable<DataSource>;
  toRefresh: boolean;
  gridTitle: string;
  currentSpecy: string;
  noEspeceSet: boolean;

  constructor(
    public localizeService: LocalizationService,
    private fournisseursService: FournisseursService,
    private modesCultureService: ModesCultureService,
    private stocksService: StocksService,
    private dateManagementService: DateManagementService,
    public gridsService: GridsService
  ) {
    this.currentSpecy = "POMME";
    this.especes = this.stocksService.getDistinctEntityDatasource(
      "article.cahierDesCharge.espece.id"
    );
    this.fournisseurs = this.fournisseursService.getDataSource_v2([
      "code",
      "raisonSocial",
    ]);
    this.fournisseurs.filter([
      ["valide", "=", true],
      "and",
      ["stockPrecalibre", "=", true],
    ]);
    this.modesCulture = this.modesCultureService.getDataSource_v2([
      "id",
      "description",
    ]);
    this.modesCulture.filter(["valide", "=", true]);
  }

  ngAfterViewInit() {
    const now = new Date();
    const year = parseInt(now.getFullYear().toString().slice(-2), 10);
    const week = this.dateManagementService.getWeekNumber(now);
    this.weekBox.value = week + year * 100;
    this.onFieldValueChange(null, "espece"); // First run: setting filters values
  }

  weekChanged(e) {
    // We check that this change is coming from the user
    if (!e.event) return;
    let year;
    let week;
    const weekStr = e.value.toString();
    if (weekStr.slice(-2) === "00") {
      year = parseInt(weekStr.substring(0, 2)) - 1;
      week = this.dateManagementService.getWeeksInYear(2000 + year);
    } else if (
      weekStr.slice(-2) ===
      (
        this.dateManagementService.getWeeksInYear(
          2000 + parseInt(weekStr.substring(0, 2))
        ) + 1
      ).toString()
    ) {
      year = parseInt(weekStr.substring(0, 2)) + 1;
      week = 1;
    }
    if (year) this.weekBox.value = week + year * 100;
  }

  onFilterChange() {
    this.currentSpecy =
      this.especeSB.value?.node?.key ?? this.especeSB.value?.key;
    this.noEspeceSet = !this.currentSpecy;
  }

  /**
   * Apply filters from tag boxs
   * @param event List of field values
   * @param dataField Field path
   */
  onFieldValueChange(event, dataField: string) {
    this.onFilterChange();

    // Filtering variete, emballage & origine selectBox list depending on specy
    if (["espece", "variete"].includes(dataField)) {
      if (dataField === "espece") this.varieteSB.value = null;

      let sbFilters = `(article.cahierDesCharge.espece.id=='${
        this.especeSB.value?.node?.key ?? this.especeSB.value?.key
      }' and quantiteTotale > 0 and valide == true)`;
      if (this.varieteSB.value)
        sbFilters += ` and article.matierePremiere.variete.id == '${this.varieteSB.value.key}'`;
      const dataToLoad = [
        {
          var: "variete",
          id: "article.matierePremiere.variete.id",
          desc: "article.matierePremiere.variete.description",
        },
      ];
      dataToLoad
        .filter((data) => !this[`${data.var}SB`].value)
        .forEach((data) => {
          this[data.var] = this.stocksService.getDistinctEntityDatasource(
            data.id,
            data.desc,
            sbFilters
          );
        });
    }
  }

  refreshArticlesGrid() {
    if (!this.currentSpecy) return;
    const grid = "grid" + this.capitalize(this.currentSpecy);
    this[grid].enableFilters();
  }

  displayCodeBefore(data) {
    if (data?.__typename === "DistinctEdge") {
      return data ? `${data.node.key} - ${data.node.description}` : null;
    }

    return data
      ? (data.code ? data.code : data.id) +
          " - " +
          (data.nomUtilisateur
            ? data.nomUtilisateur
            : data.raisonSocial
            ? data.raisonSocial
            : data.description)
      : null;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
