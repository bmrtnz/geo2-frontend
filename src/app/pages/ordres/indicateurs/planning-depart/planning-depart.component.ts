import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from "@angular/core";
import { Model, ModelFieldOptions } from "app/shared/models/model";
import { LocalizePipe } from "app/shared/pipes";
import { AuthService, LocalizationService, TransporteursService } from "app/shared/services";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { GridsConfigsService } from "app/shared/services/api/grids-configs.service";
import { Indicateur } from "app/shared/services/api/indicateurs.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { Indicator, OrdresIndicatorsService } from "app/shared/services/ordres-indicators.service";
import { GridColumn } from "basic";
import { DxCheckBoxComponent, DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DocumentsOrdresPopupComponent } from "../../documents-ordres-popup/documents-ordres-popup.component";
import { TabContext } from "../../root/root.component";

@Component({
  selector: "app-planning-depart",
  templateUrl: "./planning-depart.component.html",
  styleUrls: ["./planning-depart.component.scss"],
})
export class PlanningDepartComponent implements AfterViewInit {
  readonly INDICATOR_NAME = Indicateur.PlanningDepart;
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
  @ViewChild("diffCheckBox", { static: false }) diffSumColisOrNotDetail: DxCheckBoxComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("dateMin", { static: false }) dateMin: DxSelectBoxComponent;
  @ViewChild("dateMax", { static: false }) dateMax: DxSelectBoxComponent;
  @ViewChild(DocumentsOrdresPopupComponent) docsPopup: DocumentsOrdresPopupComponent;

  public dataSource: DataSource;
  public title: string;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public titleElement: HTMLInputElement;
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
    private localizePipe: LocalizePipe,
    private tabContext: TabContext,
    private datePipe: DatePipe,
    private envoisService: EnvoisService,
    private vcr: ViewContainerRef,
    private cfr: ComponentFactoryResolver,
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
      Grid.PlanningDepart
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
    this.periodes = this.dateManagementService.periods();
  }

  ngAfterViewInit() {

    this.dateMin.value = this.dateManagementService.startOfDay();
    this.dateMax.value = this.dateManagementService.endOfDay();

    // Auto sector select from current user settings
    if (this.authService.currentUser.secteurCommercial) {
      this.secteurSB.value = {
        id: this.authService.currentUser.secteurCommercial.id,
        description: this.authService.currentUser.secteurCommercial.description
      };
    }
    this.titleElement = this.gridPLANNINGDEPARTComponent.instance.$element()[0].querySelector(
      ".dx-toolbar-before .dx-placeholder",
    ) as HTMLInputElement;
    this.updateFilters();
  }

  updateFilters(e?) {

    // Allow only user change
    if (e) {
      if (!e.event) return;
    }

    this.toRefresh = false;
    this.dataSource = null;
    this.dataSource = this.indicator.dataSource;

    const filters = this.indicator.cloneFilter();
    if (this.secteurSB.value)
      filters.push("and", [
        "ordre.secteurCommercial.id",
        "=",
        this.secteurSB.value.id,
      ]);
    filters.push("and", [
      "logistique.dateDepartPrevueFournisseur",
      ">=",
      this.dateMin.value,
    ]);
    filters.push("and", [
      "logistique.dateDepartPrevueFournisseur",
      "<=",
      this.dateMax.value,
    ]);
    this.ordresService.persistantVariables.onlyColisDiff = false;
    this.dataSource.filter(filters);

    this.gridPLANNINGDEPARTComponent.dataSource = this.dataSource;
    this.gridPLANNINGDEPARTComponent.dataSource.reload().then(res => {

      // Sort by numero ordre
      res.sort((a, b) => a.ordre.numero - b.ordre.numero);

      // Clear repeated fields, a kind of group structure wanted by BW
      // with new id assignement
      // Handles checkbox filter
      let oldOrderId;
      let id = 1;
      res.map(data => {
        if (this.diffSumColisOrNotDetail.value
          && ((data.ordre.sommeColisCommandes === data.ordre.sommeColisExpedies)
            && data.ordre.versionDetail)
        ) {
          data.id = 0; // Sums are equal and there's a version number
        } else {
          data.id = id;
          id++;
        }
        if (oldOrderId === data.ordre.id) {
          data.ordre = {
            dateLivraisonPrevue: data.ordre.dateLivraisonPrevue,
            transporteur: { id: data.ordre.transporteur.id },
            assistante: { id: data.ordre.assistante.id },
            commercial: { id: data.ordre.commercial.id }
          };
        } else {
          oldOrderId = data.ordre.id;
        }
      });

      res = res.filter(r => r.id); // Removing unwanted items (see above)
      this.gridPLANNINGDEPARTComponent.dataSource = res;
    });

    // Customizing period/date display
    const title = this.localizePipe.transform("grid-situation-depart-title");
    const duValue = this.localizePipe.transform("du");
    const fromDate = this.dateManagementService.formatDate(this.dateMin.value, "dd-MM-yyyy");
    const fromValue = `<strong>${fromDate.replace(/^0+/, "")}</strong>`;
    const auValue = this.localizePipe.transform("au");
    const toDate = this.dateManagementService.formatDate(this.dateMax.value, "dd-MM-yyyy");
    const toValue = `<strong>${toDate.replace(/^0+/, "")}</strong>`;
    const nowDate = this.dateManagementService.formatDate(new Date(), "dd-MM-yyyy");
    let finalTitle = `${title} ${duValue}&nbsp;&nbsp;${fromValue}&nbsp;&nbsp;${auValue}&nbsp;&nbsp;${toValue}`;
    if (fromDate === toDate) {
      if (fromDate === nowDate) {
        finalTitle = `${title}&nbsp;<strong>${this.localizePipe.transform("grid-situation-depart-title-today")}</strong>`;
      } else {
        finalTitle = finalTitle.split(auValue)[0];
      }
    }
    this.titleElement.innerHTML =
      `${finalTitle} - ${this.localizePipe.transform("tiers-clients-secteur")}&nbsp;<strong>${this.secteurSB.value.description}</strong>`;

  }

  onFieldValueChange() {
    this.toRefresh = true;
  }

  onRowDblClick(e) {
    if (!e.data?.ordre?.numero) return;
    notify(this.localizePipe.transform("ouverture-ordre").replace("&NO", e.data.ordre.numero), "info", 1500);
    setTimeout(() => this.tabContext.openOrdre(e.data.ordre.numero, e.data.ordre.campagne.id, false));
  }

  onRowPrepared(e) {
    if (e.rowType === "data" && e.data.ordre.numero) {
      e.rowElement.classList.add("cursor-pointer");
      e.rowElement.setAttribute(
        "title",
        this.localizePipe.transform("hint-dblClick-ordre"),
      );
    }
  }

  onCellPrepared(event) {
    if (event.rowType !== "data") return;
    const equal = event.data.nombreColisCommandes === event.data.nombreColisExpedies;

    if (event.data.ordre.id) {
      if (event.column.dataField === "ordre.versionDetail") this.colorizeRedGreen(event, event.value);
    }

    if (event.column.dataField === "logistique.dateDepartReelleFournisseur") this.colorizeRedGreen(event, event.value);
    if (["nombreColisCommandes", "nombreColisExpedies"].includes(event.column.dataField)) {
      if (event.data.logistique.dateDepartReelleFournisseur) {
        this.colorizeRedGreen(event, equal);
      } else {
        if (equal) event.cellElement.classList.add("highlight-ok");
      }
    }
  }

  colorizeRedGreen(e, condition) {
    e.cellElement.classList.add(condition ? "highlight-ok" : "highlight-err");
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

  public onBLAutoClick() {
    const socID = this.currentCompanyService.getCompany().id;
    this.ordresService.fEnvoiBLAuto(
      socID,
      this.secteurSB.value.id,
      this.datePipe.transform(new Date(Date.parse(this.dateMin.value)), "yyyy-MM-dd"),
      this.datePipe.transform(new Date(Date.parse(this.dateMax.value)), "yyyy-MM-dd"),
      this.authService.currentUser.nomUtilisateur,
    ).subscribe({
      next: res => notify(res.msg, "success"),
      error: (err: Error) => notify(`Erreur lors de l'envoi des détails: ${err.message}`, "error", 3000),
    });
  }
}

export default PlanningDepartComponent;
