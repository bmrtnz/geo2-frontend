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
import dxDataGrid from "devextreme/ui/data_grid";

@Component({
  selector: "app-stock-precalibre",
  templateUrl: "./stock-precalibre.component.html",
  styleUrls: ["./stock-precalibre.component.scss"],
})
export class StockPrecalibreComponent implements AfterViewInit {
  @Output() public currentSpecy: string;
  @Output() public corrPommeKiwi: string[];
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
  especes: String[];
  varietes: any[];
  noEspeceSet: boolean;
  calibres: { POMME; POIRE; KIWI };
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
      POMME: [
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
      POIRE: [
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
      KIWI: [
        "p216",
        "p198",
        "p175",
        "p163",
        "p150",
        "p138",
        "p125",
        "p113",
        "p100",
        "p88",
        "p80",
      ],
    };
    (this.corrPommeKiwi = [
      "p216|46-",
      "p198|46",
      "p175|42",
      "p163|39",
      "p150|36",
      "p138|33",
      "p125|30",
      "p113|27",
      "p100|25",
      "p88|23",
      "p80|20",
    ]),
      (this.allCalibres = [
        ...new Set(
          this.calibres.POMME.concat(this.calibres.POIRE, this.calibres.KIWI)
        ),
      ]);
    this.currentSpecy = "POMME";
    this.noEspeceSet = false;
    this.stocksService
      .allPrecaEspece()
      .subscribe((res) => (this.especes = res.data.allPrecaEspece));
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

    this.onEspeceChange(); // First run: setting filters values
    this.grid.setColumns();

    this.weekBox.value = 1748; // A VIRER !!!
    setTimeout(() => this.refreshArticlesGrid(), 500); // A VIRER !!!
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
    this.varieteSB.value = null;
    this.currentSpecy = this.especeSB.value;
    this.noEspeceSet = !this.currentSpecy;
    this.grid.datagrid.dataSource = null;
    this.getVarieteItems(this.currentSpecy);
  }

  getVarieteItems(espece) {
    this.stocksService.allPrecaVariete(espece).subscribe((res) => {
      this.varietes = res.data.allPrecaVariete;
    });
  }

  refreshArticlesGrid() {
    if (!this.currentSpecy) return;

    setTimeout(() => this.grid.datagrid.instance.beginCustomLoading(""));
    this.grid.datagrid.dataSource = null;
    // Set calibres vs specy
    this.setGridCalibres();

    this.stocksService
      .allPreca(
        this.especeSB.value,
        this.weekBox.value.toString(),
        this.modesCultureSB.value?.id.toString() || "%",
        this.varieteSB.value?.id || "%",
        this.fournisseurSB.value?.code || "%"
      )
      .subscribe((res) => {
        const DsItems = JSON.parse(JSON.stringify(res.data.allPreca));
        let oldArticleMainInfo;
        let id = -1;
        let DsItems2 = []; // New array with additionnal total rows
        let oldLastTotalId;
        let sumQte;
        DsItems.map((data) => {
          // Calculating sum of each calibres
          let sumCal = 0;
          this.calibres[this.currentSpecy].map((cal) => {
            if (data[cal]) {
              sumCal += data[cal];
            } else data[cal] = 0;
          });
          data.quantite = sumCal;

          // Same kind of article ?
          if (
            oldArticleMainInfo?.variete?.id === data.variete.id &&
            oldArticleMainInfo?.choix === data.choix &&
            oldArticleMainInfo?.modeCulture.description ===
              data.modeCulture.description &&
            oldArticleMainInfo?.colo === data.colo
          ) {
            id++;
          } else {
            id += 2;
            // Inserting total row
            this.calibres[this.currentSpecy].map(
              (cal) => (sumQte += this.calibres[this.currentSpecy][cal])
            );
            if (oldLastTotalId !== undefined)
              DsItems2.push({
                ...data,
                ...oldArticleMainInfo,
                id: oldLastTotalId,
                fournisseur: { code: "Total" },
                ...this.calibres[this.currentSpecy],
                quantite: sumQte,
                totalRow: true,
              });
            oldLastTotalId = id - 1;
            // Reset total
            sumQte = 0;
            this.calibres[this.currentSpecy].map(
              (cal) => (this.calibres[this.currentSpecy][cal] = 0)
            );
            oldArticleMainInfo = {
              variete: { id: data.variete.id },
              choix: data.choix,
              modeCulture: { description: data.modeCulture.description },
              colo: data.colo,
            };
          }
          // Calculating each cal qty
          this.calibres[this.currentSpecy].map((cal) => {
            this.calibres[this.currentSpecy][cal] =
              (this.calibres[this.currentSpecy][cal] ?? 0) + data[cal];
          });
          // Clear repeated fields
          if (DsItems.length > 1) {
            data.variete = { id: "" };
            data.choix = "";
            data.modeCulture = { description: "" };
            data.colo = "";
          }
          data.id = id;
          DsItems2.push(data);
        });
        this.grid.datagrid.dataSource = DsItems2;
        this.grid.datagrid.instance.endCustomLoading();
      });
  }

  setGridCalibres() {
    this.allCalibres.map((cal) => {
      const visible = this.calibres[this.currentSpecy].includes(cal);
      ["visible", "showInColumnChooser"].map((prop) =>
        this.grid.datagrid.instance.columnOption(cal, prop, visible)
      );
    });
  }

  displayCodeBefore(data) {
    return data
      ? (data.code ? data.code : data.id) +
          (data.description || data.raisonSocial
            ? " - " + (data.raisonSocial ? data.raisonSocial : data.description)
            : "")
      : null;
  }
}
