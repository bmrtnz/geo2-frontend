import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { DateManagementService } from "app/shared/services/date-management.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import {
  EntrepotsService,
  ClientsService,
  AuthService,
  LocalizationService,
} from "app/shared/services";
import DataSource from "devextreme/data/data_source";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxSelectBoxComponent, DxDataGridComponent } from "devextreme-angular";
import Ordre from "app/shared/models/ordre.model";
import { TabContext } from "../../root/root.component";
import {
  Grid,
  GridConfiguratorService,
  GridConfig,
} from "app/shared/services/grid-configurator.service";
import { environment } from "environments/environment";
import { Role } from "app/shared/models/personne.model";
import { GridColumn } from "basic";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { OrdresBafService } from "app/shared/services/api/ordres-baf.service";
import notify from "devextreme/ui/notify";
import OrdreBaf from "app/shared/models/ordre-baf.model";

enum InputField {
  secteurCode = "secteur",
  clientCode = "client",
  entrepotCode = "entrepot",
  codeCommercial = "commercial",
  codeAssistante = "assistante",
  dateMin = "dateMin",
  dateMax = "dateMax",
  societeCode = "societe",
}

enum status {
  OK = "0",
  ALERTE = "1",
  BLOQUÉ = "2",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-supervision-a-facturer",
  templateUrl: "./supervision-a-facturer.component.html",
  styleUrls: ["./supervision-a-facturer.component.scss"],
})
export class SupervisionAFacturerComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = "SupervisionAFacturer";

  public ordresDataSource: DataSource;
  public secteurs: DataSource;
  public clients: DataSource;
  public entrepots: DataSource;
  public commerciaux: DataSource;
  public assistantes: DataSource;

  public periodes: string[];
  public columnChooser = environment.columnChooser;
  private gridConfig: Promise<GridConfig>;
  public columns: Observable<GridColumn[]>;
  toRefresh: boolean;
  gridHasData: boolean;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;

  public formGroup = new FormGroup({
    secteurCode: new FormControl(),
    clientCode: new FormControl(),
    entrepotCode: new FormControl(),
    codeCommercial: new FormControl(),
    codeAssistante: new FormControl(),
    dateMin: new FormControl(this.dateManagementService.startOfDay()),
    dateMax: new FormControl(this.dateManagementService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private secteursService: SecteursService,
    private personnesService: PersonnesService,
    private entrepotsService: EntrepotsService,
    private clientsService: ClientsService,
    private localization: LocalizationService,
    private dateManagementService: DateManagementService,
    private currentCompanyService: CurrentCompanyService,
    public ordresBafService: OrdresBafService,
    public authService: AuthService,
    private tabContext: TabContext,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdresAFacturer,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );

    this.secteurs = this.secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      [
        "societes",
        "contains",
        this.currentCompanyService.getCompany().id,
      ],
    ]);
    this.clients = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "secteur.id",
    ]);
    this.entrepots = this.entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
    this.commerciaux = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.commerciaux.filter([
      // ["valide", "=", true],
      // "and",
      ["role", "=", Role.COMMERCIAL],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.assistantes = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.assistantes.filter([
      // ["valide", "=", true],
      // "and",
      ["role", "=", Role.ASSISTANT],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.periodes = this.dateManagementService.periods();
    this.gridHasData = false;
  }

  async ngOnInit() {
    this.toRefresh = true;
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField)),
    );

    this.ordresDataSource = this.ordresBafService.getDataSource_v2(
      await fields.toPromise(),
    );
  }

  ngAfterViewInit() {
    // Only way found to validate and show Warning icon
    this.formGroup.get("secteurCode").setValue("");
    this.formGroup.get("secteurCode").reset();

    if (this.authService.currentUser.secteurCommercial) {
      this.formGroup
        .get("secteurCode")
        .patchValue(this.authService.currentUser.secteurCommercial);
    }

    // Fill commercial/assistante input from user role
    if (
      !this.authService.isAdmin &&
      this.authService.currentUser.personne?.role
    ) {
      if (
        this.authService.currentUser.personne?.role?.toString() ===
        Role[Role.COMMERCIAL]
      )
        this.formGroup
          .get("codeCommercial")
          .setValue(this.authService.currentUser.assistante); // API Inverted, don't worry
      if (
        this.authService.currentUser.personne?.role?.toString() ===
        Role[Role.ASSISTANT]
      )
        this.formGroup
          .get("codeAssistante")
          .setValue(this.authService.currentUser.commercial); // API Inverted, don't worry
    }
  }

  displayIDBefore(data) {
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

  enableFilters() {
    if (!this.formGroup.get("secteurCode").value) {
      notify("Veuillez spécifier un secteur", "error");
    } else {
      this.toRefresh = false;
      this.datagrid.dataSource = null;

      const values: Inputs = {
        ...this.formGroup.value,
      };

      this.ordresBafService.setPersisantVariables({
        secteurCode: values.secteurCode.id,
        dateMin: this.dateManagementService.formatDate(values.dateMin),
        dateMax: this.dateManagementService.formatDate(values.dateMax),
        clientCode: values.clientCode?.id,
        societeCode: this.currentCompanyService.getCompany().id,
        entrepotCode: values.entrepotCode?.id,
        codeCommercial: values.codeAssistante?.id, // Inverted as inverted in orders table
        codeAssistante: values.codeCommercial?.id, // Inverted as inverted in orders table
      } as Inputs);

      this.datagrid.dataSource = this.ordresDataSource;
    }
  }

  onFieldValueChange(e?) {
    this.toRefresh = true;
  }

  onSecteurChange(e) {
    this.onFieldValueChange();
    this.clients = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "secteur.id",
    ]);
    if (e.value) this.clients.filter(["secteur.id", "=", e.value.id]);
  }

  onClientChange(e) {
    this.onFieldValueChange();
    this.entrepots = this.entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "client.id",
    ]);
    if (e.value) this.entrepots.filter(["client.id", "=", e.value.id]);
  }

  onGridContentReady(e) {
    this.gridHasData = this.datagrid.instance.getVisibleRows().length > 0;
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    this.onFieldValueChange();

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.formGroup.get("dateMin").value);
    const fin = new Date(this.formGroup.get("dateMax").value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.formGroup
          .get("dateMax")
          .patchValue(this.dateManagementService.endOfDay(deb));
      } else {
        this.formGroup
          .get("dateMin")
          .patchValue(this.dateManagementService.startOfDay(fin));
      }
    }
    this.periodeSB.value = null;
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    this.onFieldValueChange();

    const datePeriod = this.dateManagementService.getDates(e);

    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  onCellClick(e) {
    if (e.column.dataField !== "numeroOrdre") return;
    e.event.stopImmediatePropagation();
    this.tabContext.openOrdre(e.data.numeroOrdre);
  }

  launch(e) { }

  onCellPrepared(event) {
    const field = event.column.dataField;

    if (field === "numeroOrdre") {
      event.cellElement.classList.add("text-underlined");
      event.cellElement.setAttribute(
        "title",
        this.localization.localize("hint-click-ordre"),
      );
    }

    if (field?.includes("indicateur")) {
      event.cellElement.style.textAlign = "center";
      if (event.rowType === "filter") {
        event.cellElement.style.opacity = 0;
        event.cellElement.style.pointerEvents = "none";
      }

      if (event.rowType === "data") {
        if (field !== "indicateurBaf" && event.value === "0") {
          event.cellElement.innerText = "";
          return;
        }
        event.cellElement.classList.add("BAFstatus-cell");
        event.cellElement.classList.add(this.colorizeCell(event.value));
        event.cellElement.innerText =
          Object.keys(status)[
          (Object.values(status) as string[]).indexOf(event.value)
          ];
        if (event.data.description) {
          event.cellElement.setAttribute(
            "title",
            event.data.description,
          );
        }
      }
    }
  }

  colorizeCell(theValue) {
    let cellClassColor;
    switch (theValue) {
      case status.BLOQUÉ:
        cellClassColor = "blocked";
        break;
      case status.ALERTE:
        cellClassColor = "alert";
        break;
    }
    return (cellClassColor ? cellClassColor : "OK") + "-color";
  }
}

export default SupervisionAFacturerComponent;
