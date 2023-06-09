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
import { GridPrecalibreComponent } from "./grid-precalibre/grid-precalibre.component";

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
  @ViewChild("fournisseurSB", { static: false })
  fournisseurSB: DxSelectBoxComponent;
  @ViewChild(GridPrecalibreComponent, { static: false })
  grid: GridPrecalibreComponent;

  public fournisseurs: DataSource;
  public modesCulture: DataSource;
  especes: Observable<DataSource>;
  varietes: Observable<DataSource>;
  currentSpecy: string;
  noEspeceSet: boolean;
  calibres: { pomme; poire; kiwi };
  allCalibres: any;

  constructor(
    public localizeService: LocalizationService,
    private fournisseursService: FournisseursService,
    private modesCultureService: ModesCultureService,
    private stocksService: StocksService,
    private dateManagementService: DateManagementService,
    public gridsService: GridsService
  ) {
    this.calibres = {
      pomme: [
        "p100",
        "p113",
        "p125",
        "p138",
        "p150",
        "p163",
        "p175",
        "p198",
        "p204",
        "p216",
        "p232",
        "p248",
        "p267",
        "p288",
        "p327",
        "p56",
        "p64",
        "p72",
        "p80",
        "p88",
      ],
      poire: [
        "p100",
        "p113",
        "p125",
        "p138",
        "p150",
        "p163",
        "p175",
        "p198",
        "p216",
        "p56",
        "p64",
        "p72",
        "p80",
        "p88",
      ],
      kiwi: [],
    };
    this.allCalibres = [
      ...new Set(this.calibres.pomme.concat(this.calibres.poire)),
    ];
    this.currentSpecy = "POMME";
    this.noEspeceSet = false;
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

    this.weekBox.value = 2244; // A VIRER !!!

    this.onFieldValueChange(null, "espece"); // First run: setting filters values
    this.grid.setColumns();
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

  onEspeceChange() {
    this.currentSpecy =
      this.especeSB.value?.node?.key ?? this.especeSB.value?.key;
    this.noEspeceSet = !this.currentSpecy;
  }

  onFieldValueChange(event, dataField: string) {
    if (dataField === "espece") this.onEspeceChange();

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

    setTimeout(() => this.grid.datagrid.instance.beginCustomLoading(""));
    this.grid.datagrid.dataSource = null;
    // Set calibres vs specy
    this.setGridCalibres();

    this.stocksService
      .allPreca(
        this.especeSB.value?.node?.key ?? this.especeSB.value?.key,
        this.weekBox.value.toString(),
        this.varieteSB.value?.key || "%",
        this.fournisseurSB.value?.code || "%"
      )
      .subscribe((res) => {
        this.grid.datagrid.dataSource = res.data.allPreca;
        this.grid.datagrid.instance.endCustomLoading();
      });
  }

  setGridCalibres() {
    this.allCalibres.map((cal) => {
      const visible =
        this.calibres[this.currentSpecy.toLowerCase()].includes(cal);
      ["visible", "showInColumnChooser"].map((prop) =>
        this.grid.datagrid.instance.columnOption(cal, prop, visible)
      );
    });
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
}
