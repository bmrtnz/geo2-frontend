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
  rowSelected: boolean;

  @ViewChild("gridPLANNINGDEPART", { static: false })
  gridPLANNINGDEPARTComponent: DxDataGridComponent;
  @ViewChild("secteurValue", { static: false })
  secteurSB: DxSelectBoxComponent;
  @ViewChild("diffCheckBox", { static: false }) diffCB: DxCheckBoxComponent;
  @ViewChild("daysOfService", { static: false }) daysNB: DxNumberBoxComponent;

  public dataSource: DataSource;
  initialFilterLengh: number;
  public title: string;
  private dxGridElement: HTMLElement;
  readonly DAYSNB_DEFAULT = 1;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public theTitle: any;

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
  }

  ngAfterViewInit() {
    this.dxGridElement =
      this.gridPLANNINGDEPARTComponent.instance.$element()[0];
    this.dataSource = this.indicator.dataSource;
    this.theTitle = this.dxGridElement.querySelector(
      ".dx-toolbar .dx-texteditor-input",
    ) as HTMLInputElement;
    const inputContainer = this.dxGridElement.querySelector(
      ".dx-toolbar .dx-texteditor-container",
    ) as HTMLElement;
    inputContainer.style.width = "750px";
    if (!this.authService.isAdmin)
      this.secteurSB.value =
        this.authService.currentUser.secteurCommercial;
  }

  enableFilters() {
    const filters = this.indicator.cloneFilter();
    this.initialFilterLengh = filters.length;

    filters.push("and", [
      "logistiques.dateDepartPrevueFournisseur",
      ">=",
      this.getDaysNB(),
    ]);

    this.indicator?.dataSource?.filter(filters);

    this.title = this.localizePipe.transform(
      "grid-situation-depart-title-today",
    );
  }

  changeDays() {
    if (this.diffCB.value) this.updateFilters();
  }

  updateFilters() {
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
      this.getDaysNB(),
    ]);
    if (this.diffCB.value)
      filters.push("and", [
        ["versionDetail", "isnull", "null"],
        "or",
        ["versionDetail", "<", "001"],
      ]);
    this.ordresService.persistantVariables.onlyColisDiff =
      this.diffCB.value;

    this.dataSource.filter(filters);
    this.dataSource.reload();

    const fromDate = this.datePipe.transform(
      new Date()
        .setDate(
          new Date().getDate() - this.daysNB.value ??
          this.DAYSNB_DEFAULT,
        )
        .valueOf(),
    );
    /* tslint:disable-next-line max-line-length */
    this.title = `${this.localizePipe.transform(
      "grid-situation-depart-title",
    )}
     ${this.localizePipe.transform("du")}
      ${this.dateManagementService.formatDate(fromDate, "dd-MM-yyyy")}
      ${this.localizePipe.transform("au")}
      ${this.dateManagementService.formatDate(new Date(), "dd-MM-yyyy")}`;
    this.theTitle.value = this.title;
  }

  onRowClick(event) {
    this.rowSelected = true;
  }

  onRowDblClick({ data }: { data: Partial<Ordre> }) {
    this.tabContext.openOrdre(data.numero, data.campagne.id);
  }

  onDaysOfServiceInputReady() {
    this.enableFilters();
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

  getDaysNB() {
    const d = new Date();
    d.setDate(
      new Date().getDate() - this.daysNB.value ?? this.DAYSNB_DEFAULT,
    );
    return d.toISOString();
  }
}

export default PlanningDepartComponent;
