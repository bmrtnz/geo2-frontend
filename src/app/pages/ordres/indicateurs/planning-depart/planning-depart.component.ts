import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { Model, ModelFieldOptions } from "app/shared/models/model";
import { LocalizePipe } from "app/shared/pipes";
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import { GridsConfigsService } from "app/shared/services/api/grids-configs.service";
import { Indicateur } from "app/shared/services/api/indicateurs.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PlanningDepartService } from "app/shared/services/api/planning-depart.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn, ONE_DAY } from "basic";
import {
  DxCheckBoxComponent,
  DxDataGridComponent,
  DxSelectBoxComponent,
} from "devextreme-angular";
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
  filter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  @ViewChild("gridPLANNINGDEPART", { static: false })
  datagrid: DxDataGridComponent;
  @ViewChild("secteurValue", { static: false }) secteurSB: DxSelectBoxComponent;
  @ViewChild("diffCheckBox", { static: false })
  diffSumColisOrNotDetail: DxCheckBoxComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("dateMin", { static: false }) dateMin: DxSelectBoxComponent;
  @ViewChild("dateMax", { static: false }) dateMax: DxSelectBoxComponent;
  @ViewChild(DocumentsOrdresPopupComponent)
  docsPopup: DocumentsOrdresPopupComponent;

  public dataSource: DataSource;
  public title: string;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public titleElement: HTMLInputElement;
  public periodes: any[];

  constructor(
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public dateManagementService: DateManagementService,
    public secteursService: SecteursService,
    public currentCompanyService: CurrentCompanyService,
    public planningDepartService: PlanningDepartService,
    public ordresService: OrdresService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    private localizePipe: LocalizePipe,
    private tabContext: TabContext,
    private datePipe: DatePipe
  ) {
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.PlanningDepart
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.periodes = this.dateManagementService.periods();
  }

  ngAfterViewInit() {
    this.setDefaultPeriod("J");

    // Auto sector select from current user settings
    if (this.authService.currentUser.secteurCommercial) {
      this.secteurSB.value = {
        id: this.authService.currentUser.secteurCommercial.id,
        description: this.authService.currentUser.secteurCommercial.description,
      };
    }
    this.titleElement = this.datagrid.instance
      .$element()[0]
      .querySelector(".dx-toolbar-before .dx-placeholder") as HTMLInputElement;
    // Profile vs diffSurExpedition
    this.authService.onUserChanged().subscribe(() =>
      this.diffSumColisOrNotDetail.value = !!this.authService.currentUser.diffSurExpedition
    );
  }

  setDefaultPeriod(periodId) {
    let myPeriod = this.dateManagementService.getPeriodFromId(
      periodId,
      this.periodes
    );
    if (!myPeriod) return;
    this.periodeSB?.instance.option("value", myPeriod);
    const datePeriod = this.dateManagementService.getDates({
      value: myPeriod,
    });
    this.dateMin.value = datePeriod.dateDebut;
    this.dateMax.value = datePeriod.dateFin;
  }

  async updateFilters(e?) {
    // Allow only user change
    if (e) {
      if (!e.event) return;
    }

    this.dataSource = null;

    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.datagrid.instance.beginCustomLoading("");
    this.dataSource = this.planningDepartService.getDataSource(
      {
        societeCode: this.currentCompanyService.getCompany().id,
        secteurCode: this.secteurSB.value?.id ?? "%",
        dateMin: this.dateMin.value,
        dateMax: this.dateMax.value,
      },
      new Set(await fields.toPromise())
    );
    this.dataSource.reload().then((res) => {
      let DsItems = JSON.parse(JSON.stringify(res));
      // Sort by numero ordre
      DsItems.sort(
        (a, b) =>
          a.ordreLogistique.ordre.numero - b.ordreLogistique.ordre.numero
      );

      // Clear repeated fields, a kind of group structure wanted by BW
      // with new id assignement
      // Also handles checkbox filter (Différence sur expédition et/ou sans détail client)
      let oldOrderId;
      let id = 1;
      DsItems.map((data) => {
        if (
          this.diffSumColisOrNotDetail.value &&
          data.ordreLogistique.ordre.sommeColisCommandes ===
          data.ordreLogistique.ordre.sommeColisExpedies &&
          data.ordreLogistique.ordre.versionDetail
        ) {
          data.id = 0; // Sums are equal and there's a version number
        } else {
          data.id = id;
          id++;
        }
        if (oldOrderId === data.ordreLogistique.ordre.id) {
          data.ordreLogistique.ordre = {
            dateLivraisonPrevue: data.ordreLogistique.ordre.dateLivraisonPrevue,
            transporteur: { id: data.ordreLogistique.transporteurGroupage?.id ?? data.ordreLogistique.ordre.transporteur.id },
            assistante: { id: data.ordreLogistique.ordre.assistante.id },
            commercial: { id: data.ordreLogistique.ordre.commercial.id },
          };
        } else {
          data.ordreLogistique.ordre.transporteur = { id: data.ordreLogistique.transporteurGroupage?.id ?? data.ordreLogistique.ordre.transporteur?.id };
          // Concatenate (with no duplicates) palette type ids
          const palettes = [];
          data.ordreLogistique.lignes.map((pal) => {
            if (pal.typePalette?.id) palettes.push(pal.typePalette?.id);
          });
          if (palettes.length)
            data.ordreLogistique.lignes.typePalette = { id: Array.from(new Set(palettes)).join(" - ") };
          oldOrderId = data.ordreLogistique.ordre.id;
        }
      });

      DsItems = DsItems.filter((r) => r.id); // Removing unwanted items (see filter part above)
      this.datagrid.dataSource = DsItems;
      this.datagrid.instance.endCustomLoading();
    });

    // Customizing period/date display
    const title = this.localizePipe.transform("grid-situation-depart-title");
    const duValue = this.localizePipe.transform("du");
    const fromDate = this.dateManagementService.formatDate(
      this.dateMin.value,
      "dd-MM-yyyy"
    );
    const fromValue = `<strong>${fromDate.replace(/^0+/, "")}</strong>`;
    const auValue = this.localizePipe.transform("au");
    const toDate = this.dateManagementService.formatDate(
      this.dateMax.value,
      "dd-MM-yyyy"
    );
    const toValue = `<strong>${toDate.replace(/^0+/, "")}</strong>`;
    const nowDate = this.dateManagementService.formatDate(
      new Date(),
      "dd-MM-yyyy"
    );
    let finalTitle = `${title} ${duValue}&nbsp;&nbsp;${fromValue}&nbsp;&nbsp;${auValue}&nbsp;&nbsp;${toValue}`;
    if (fromDate === toDate) {
      if (fromDate === nowDate) {
        finalTitle = `${title}&nbsp;<strong>${this.localizePipe.transform(
          "grid-situation-depart-title-today"
        )}</strong>`;
      } else {
        finalTitle = finalTitle.split(auValue)[0];
      }
    }
    this.titleElement.innerHTML = `${finalTitle} - ${this.localizePipe.transform(
      "tiers-clients-secteur"
    )}&nbsp;<strong>${this.secteurSB.value.description}</strong>`;
  }

  onRowDblClick(e) {
    if (!e.data?.ordreLogistique?.ordre?.numero) return;
    notify(
      this.localizePipe
        .transform("ouverture-ordre")
        .replace("&NO", e.data.ordreLogistique.ordre.numero),
      "info",
      1500
    );
    setTimeout(() =>
      this.tabContext.openOrdre(
        e.data.ordreLogistique.ordre.numero,
        e.data.ordreLogistique.ordre.campagne.id,
        false
      )
    );
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.ordreLogistique.ordre.numero) {
        e.rowElement.classList.add("cursor-pointer");
        e.rowElement.setAttribute(
          "title",
          this.localizePipe.transform("hint-dblClick-ordre")
        );
      }
      if (e.data.ordreLogistique.groupage?.id)
        e.rowElement.classList.add("groupage-row");
    }
  }

  onCellPrepared(e) {
    if (e.rowType !== "data") return;
    const equal = e.data.sommeColisCommandes === e.data.sommeColisExpedies;

    if (e.data.ordreLogistique.ordre.id) {
      if (e.column.dataField === "ordreLogistique.ordre.versionDetail")
        this.colorizeRedGreen(e, e.value);
    }

    if (e.column.dataField === "ordreLogistique.okStation") {
      e.cellElement.textContent = this.setOkStationField(e);
    }

    if (e.column.dataField === "ordreLogistique.dateDepartReelleFournisseur")
      this.colorizeRedGreen(e, e.value);
    if (
      ["sommeColisCommandes", "sommeColisExpedies"].includes(e.column.dataField)
    ) {
      if (e.data.ordreLogistique.dateDepartReelleFournisseur) {
        this.colorizeRedGreen(e, equal);
      } else {
        if (equal) e.cellElement.classList.add("highlight-ok");
      }
    }
  }

  colorizeRedGreen(e, condition) {
    e.cellElement.classList.add(condition ? "highlight-ok" : "highlight-err");
  }

  setOkStationField(e) {
    // Seen with Bruno 09-02-2023 - Field is assigned like this within the grid
    if (!e.data.ordreLogistique.dateDepartReelleFournisseur) {
      if (
        e.data.ordreLogistique.expedieStation &&
        !e.data.ordreLogistique.totalPalettesExpediees &&
        !e.data.ordreLogistique.nombrePalettesAuSol &&
        !e.data.ordreLogistique.nombrePalettes100x120 &&
        !e.data.ordreLogistique.nombrePalettes60x80 &&
        !e.data.ordreLogistique.nombrePalettes80x120
      ) {
        return "Clôturé à zéro";
      } else {
        if (e.data.ordreLogistique.expedieStation) {
          return "OK";
        } else {
          return "Non clôturé";
        }
      }
    } else {
      if (e.data.sommeColisCommandes !== e.data.sommeColisExpedies) {
        return "Diff. qté";
      } else {
        return "OK";
      }
    }
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.dateMin.value);
    const fin = new Date(this.dateMax.value);
    const deltaDate = fin < deb;

    // Remove negative offset
    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.dateMax.value = deb;
      } else {
        this.dateMin.value = fin;
      }
    }

    this.dateMin.value = this.dateManagementService.startOfDay(this.dateMin.value);
    this.dateMax.value = this.dateManagementService.endOfDay(this.dateMax.value);

    this.periodeSB.value = null;
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    const datePeriod = this.dateManagementService.getDates(e);

    this.dateMin.value = datePeriod.dateDebut;
    this.dateMax.value = datePeriod.dateFin;
  }

  public onBLAutoClick() {
    const socID = this.currentCompanyService.getCompany().id;
    this.ordresService
      .fEnvoiBLAuto(
        socID,
        this.secteurSB.value.id,
        this.datePipe.transform(
          new Date(Date.parse(this.dateMin.value)),
          "yyyy-MM-dd"
        ),
        this.datePipe.transform(
          new Date(Date.parse(this.dateMax.value)),
          "yyyy-MM-dd"
        ),
        this.authService.currentUser.nomUtilisateur
      )
      .subscribe({
        next: (res) => {
          notify(res.msg, "success");
          this.updateFilters();
        },
        error: (err: Error) =>
          notify(
            `Erreur lors de l'envoi des détails: ${err.message}`,
            "error",
            3000
          ),
      });
  }
}

export default PlanningDepartComponent;
