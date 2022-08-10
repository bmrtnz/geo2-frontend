import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Role } from "app/shared/models/personne.model";
import {
  AuthService, ClientsService, LocalizationService
} from "app/shared/services";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid, GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";

enum InputField {
  clientCode = "client",
  codeCommercial = "commercial",
  codeAssistante = "assistante",
  statut = "statut",
  dateMin = "dateMin",
  dateMax = "dateMax",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-commandes-edi",
  templateUrl: "./commandes-edi.component.html",
  styleUrls: ["./commandes-edi.component.scss"]
})
export class CommandesEdiComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = "CommandesEdi";
  public readonly env = environment;

  public ordresDataSource: DataSource;
  public clients: DataSource;
  public commerciaux: DataSource;
  public assistantes: DataSource;
  public periodes: string[];
  public statuts: string[];
  public columnChooser = environment.columnChooser;
  private gridConfig: Promise<GridConfig>;
  public columns: Observable<GridColumn[]>;
  toRefresh: boolean;
  gridHasData: boolean;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;

  public formGroup = new FormGroup({
    clientCode: new FormControl(),
    codeAssistante: new FormControl(),
    codeCommercial: new FormControl(),
    statut: new FormControl(),
    dateMin: new FormControl(this.dateManagementService.startOfDay()),
    dateMax: new FormControl(this.dateManagementService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private ordresService: OrdresService,
    private personnesService: PersonnesService,
    private clientsService: ClientsService,
    private localization: LocalizationService,
    private dateManagementService: DateManagementService,
    public authService: AuthService,
    private tabContext: TabContext,
  ) {
    this.statuts = ["Tous", "Traités", "Non-traités"];
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdresAFacturer,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );

    this.clients = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "secteur.id",
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
  }

  ngAfterViewInit() {
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

    this.toRefresh = false;
    this.datagrid.dataSource = null;

    const values: Inputs = {
      ...this.formGroup.value,
    };

    // this.datagrid.instance.beginCustomLoading("");
    // this.ordresService.allCommandeEdi(
    //   this.authService.currentUser.secteurCommercial.id,
    //   values.clientCode?.id,
    //   values.statut,
    //   this.dateManagementService.formatDate(values.dateMin),
    //   this.dateManagementService.formatDate(values.dateMax),
    //   values.codeCommercial?.id,
    //   values.codeAssistante?.id
    // ).subscribe((res) => {
    //   this.datagrid.dataSource = res.data.allStockArticleList;
    //   this.datagrid.instance.refresh();
    //   this.datagrid.instance.endCustomLoading();
    //   this.toRefresh = false;
    // });

  }

  onFieldValueChange(e?) {
    this.toRefresh = true;
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
    this.tabContext.openOrdre(e.data.numeroOrdre, e.data.campagneID);
  }

  onCellPrepared(event) {
    const field = event.column.dataField;

    if (field === "numeroOrdre") {
      event.cellElement.classList.add("text-underlined");
      event.cellElement.setAttribute(
        "title",
        this.localization.localize("hint-click-ordre"),
      );
    }

  }

}

export default CommandesEdiComponent;
