import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { Model, ModelFieldOptions } from "app/shared/models/model";
import Ordre from "app/shared/models/ordre.model";
import { LocalizePipe } from "app/shared/pipes";
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import { GridsConfigsService } from "app/shared/services/api/grids-configs.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
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
  DxCheckBoxComponent,
  DxDataGridComponent,
  DxNumberBoxComponent,
  DxSelectBoxComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";
import { DateManagementService } from "app/shared/services/date-management.service";

@Component({
  selector: "app-planning-depart",
  templateUrl: "./planning-depart.component.html",
  styleUrls: ["./planning-depart.component.scss"],
})
export class PlanningDepartComponent implements AfterViewInit {
  readonly INDICATOR_NAME = "PlanningDepart";
  options: {};
  secteurs: DataSource;
  indicator: Indicator;
  filter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  @ViewChild("gridPLANNINGDEPART", { static: false }) gridPLANNINGDEPARTComponent: DxDataGridComponent;
  @ViewChild("secteurValue", { static: false }) secteurSB: DxSelectBoxComponent;
  @ViewChild("diffCheckBox", { static: false }) diffCB: DxCheckBoxComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("dateMin", { static: false }) dateMin: DxSelectBoxComponent;
  @ViewChild("dateMax", { static: false }) dateMax: DxSelectBoxComponent;

  public dataSource: DataSource;
  public title: string;
  private dxGridElement: HTMLElement;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public theTitle: any;

  public periodes: string[];
  public toRefresh: boolean;

  constructor(
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public dateManagementService: DateManagementService,
    public secteursService: SecteursService,
    public currentCompanyService: CurrentCompanyService,
    public ordresService: OrdresService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private datePipe: DatePipe,
    private localizePipe: LocalizePipe,
    private tabContext: TabContext,
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
      Grid.LitigeLigne,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
    this.periodes = this.dateManagementService.periods();
  }

  ngAfterViewInit() {
    this.dxGridElement =
      this.gridPLANNINGDEPARTComponent.instance.$element()[0];

    // Show today title
    this.title = this.localizePipe.transform(
      "grid-situation-depart-title-today",
    );

    this.dateMin.value = new Date();
    this.dateMax.value = new Date();

    // Auto sector select from current user settings
    if (this.authService.currentUser.secteurCommercial) {
      this.secteurSB.value = {
        id: this.authService.currentUser.secteurCommercial.id,
        description: this.authService.currentUser.secteurCommercial.description
      };
    }

    this.dataSource = this.indicator.dataSource;
    this.gridPLANNINGDEPARTComponent.dataSource = this.dataSource;
    this.theTitle = this.dxGridElement.querySelector(
      ".dx-toolbar .dx-placeholder",
    ) as HTMLInputElement;

    this.updateFilters();
  }

  updateFilters(e?) {

    // Allow only user change
    if (e) {
      if (!e.event) return;
    }

    this.toRefresh = false;
    this.gridPLANNINGDEPARTComponent.dataSource = null;

    const filters = this.indicator.cloneFilter();
    if (this.secteurSB.value)
      filters.push("and", [
        "secteurCommercial.id",
        "=",
        this.secteurSB.value.id,
      ]);
    filters.push("and", [
      "logistiques.dateDepartPrevueFournisseur",
      ">=",
      this.dateMin.value,
    ]);
    filters.push("and", [
      "dateLivraisonPrevue",
      "<=",
      this.dateMax.value,
    ]);
    if (this.diffCB.value)
      filters.push("and", [
        ["versionDetail", "isnull", "null"],
        "or",
        ["versionDetail", "<", "001"],
      ]);
    this.ordresService.persistantVariables.onlyColisDiff = this.diffCB.value;

    this.dataSource.filter(filters);
    this.dataSource.reload();
    this.gridPLANNINGDEPARTComponent.dataSource = this.dataSource;

    const title = this.localizePipe.transform("grid-situation-depart-title");
    const duValue = this.localizePipe.transform("du");
    const fromValue = `<strong> ${this.dateManagementService.formatDate(this.dateMin.value, "dd-MM-yyyy")} </strong>`;
    const auValue = this.localizePipe.transform("au");
    const toValue = `<strong> ${this.dateManagementService.formatDate(this.dateMax.value, "dd-MM-yyyy")} </strong>`;

    this.theTitle.innerHTML = `${title} ${duValue} ${fromValue} ${auValue} ${toValue}`;
  }

  onFieldValueChange(e?) {
    if (e) {
      this.updateFilters();
    } else {
      this.toRefresh = true;
    }
  }

  onRowDblClick({ data }: { data: Partial<Ordre> }) {
    this.tabContext.openOrdre(data.numero, data.campagne.id);
  }

  onCellPrepared(event) {
    if (event.rowType !== "data") return;
    const equal =
      event.data.sommeColisCommandes === event.data.sommeColisExpedies;
    if (event.column.dataField === "versionDetail")
      event.cellElement.classList.add(
        event.value ? "highlight-ok" : "highlight-err",
      );
    if (event.column.dataField === "sommeColisCommandes")
      event.cellElement.classList.add(
        equal ? "highlight-ok" : "highlight-err",
      );
    if (event.column.dataField === "sommeColisExpedies")
      event.cellElement.classList.add(
        equal ? "highlight-ok" : "highlight-err",
      );
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    this.onFieldValueChange();

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.dateMin.value);
    const fin = new Date(this.dateMax.value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.dateMax.value = deb;
      } else {
        this.dateMin.value = fin;
      }
    }
    this.periodeSB.value = null;
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    this.onFieldValueChange();

    const datePeriod = this.dateManagementService.getDates(e);

    this.dateMin.value = datePeriod.dateDebut;
    this.dateMax.value = datePeriod.dateFin;
  }

}

export default PlanningDepartComponent;
