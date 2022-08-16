import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import CommandeEdi from "app/shared/models/commande-edi.model";
import { Role } from "app/shared/models/personne.model";
import { alert } from "devextreme/ui/dialog";
import {
  AuthService, ClientsService, LocalizationService
} from "app/shared/services";
import { CampagnesService } from "app/shared/services/api/campagnes.service";
import { OrdresEdiService } from "app/shared/services/api/ordres-edi.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid, GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxRadioGroupComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../../root/root.component";
import { ChoixEntrepotCommandeEdiPopupComponent } from "../choix-entrepot-commande-edi-popup/choix-entrepot-commande-edi-popup.component";

enum InputField {
  clientCode = "client",
  codeCommercial = "commercial",
  codeAssistante = "assistante",
  dateMin = "dateMin",
  dateMax = "dateMax",
}

const ALL = "%";
const DATEFORMAT = "dd/MM/yyyy HH:mm:ss";

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-grid-commandes-edi",
  templateUrl: "./grid-commandes-edi.component.html",
  styleUrls: ["./grid-commandes-edi.component.scss"]
})
export class GridCommandesEdiComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = "CommandesEdi";
  public readonly env = environment;

  public ordresDataSource: DataSource;
  public clients: DataSource;
  public commerciaux: DataSource;
  public assistantes: DataSource;
  public periodes: string[];
  public etats: any;
  public displayedEtat: string[];
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public allText: string;
  public gridTitleCount: string;
  public gridTitleInput: HTMLInputElement;
  public campagneEnCours: any;
  toRefresh: boolean;

  @Input() gridTitle: string;
  @Input() ordreEdiId: string;
  @Output() commandeEDI: Partial<CommandeEdi>;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("etatRB", { static: false }) etatRB: DxRadioGroupComponent;
  @ViewChild(ChoixEntrepotCommandeEdiPopupComponent, { static: false }) choixEntPopup: ChoixEntrepotCommandeEdiPopupComponent;

  public formGroup = new FormGroup({
    clientCode: new FormControl(),
    codeAssistante: new FormControl(),
    codeCommercial: new FormControl(),
    dateMin: new FormControl(this.dateMgtService.startOfDay()),
    dateMax: new FormControl(this.dateMgtService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private ordresEdiService: OrdresEdiService,
    private personnesService: PersonnesService,
    private clientsService: ClientsService,
    private localization: LocalizationService,
    private campagnesService: CampagnesService,
    private datePipe: DatePipe,
    public tabContext: TabContext,
    private currentCompanyService: CurrentCompanyService,
    private dateMgtService: DateManagementService,
    public authService: AuthService,
  ) {
    this.campagnesService
      .getDataSource_v2(["id"])
      .load()
      .then((camp) => (this.campagneEnCours = camp.slice(-1)[0]));

    this.allText = this.localization.localize("all");
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.CommandesEdi,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );

    this.etats = [
      { caption: "Toutes", id: "%" },
      { caption: "Traitées", id: "T" },
      { caption: "Non-traitées", id: "N" }
    ];
    this.displayedEtat = this.etats.map((res) => res.caption);

    this.commerciaux = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.commerciaux.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.COMMERCIAL],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.assistantes = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.assistantes.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.ASSISTANT],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.setClientDataSource();
    this.periodes = this.dateMgtService.periods();
  }

  async ngOnInit() {
    this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField)),
    );

    const d = new Date("2022-04-02T00:00:00");
    this.formGroup.get("dateMin").setValue(d);
    const f = new Date("2022-04-02T23:59:59");
    this.formGroup.get("dateMax").setValue(f);
  }

  ngAfterViewInit() {
    const dxGridElement = this.datagrid.instance.$element()[0];
    this.gridTitleInput = dxGridElement.querySelector(".dx-toolbar .grid-title input");
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

    this.datagrid.instance.beginCustomLoading("");
    this.ordresEdiService.allCommandeEdi(
      this.ordreEdiId || ALL,
      this.authService.currentUser.secteurCommercial.id,
      values.clientCode?.code || ALL,
      values.codeAssistante?.id || ALL,
      values.codeCommercial?.id || ALL,
      this.etats.filter((res) => res.caption === this.etatRB.value)[0].id,
      values.dateMin,
      values.dateMax,
    ).subscribe((res) => {
      this.datagrid.dataSource = res.data.allCommandeEdi;
      this.datagrid.instance.refresh();
      this.datagrid.instance.endCustomLoading();
      this.toRefresh = false;
    });

    this.datagrid.dataSource = this.ordresDataSource;

  }

  onFieldValueChange() {
    this.toRefresh = true;
  }

  setClientDataSource() {
    this.onFieldValueChange();

    const values: Inputs = {
      ...this.formGroup.value,
    };

    this.formGroup.get("clientCode").reset();
    this.clients = null;

    // Find all EDI clients depending on sector, assistant and commercial
    this.ordresEdiService.allClientEdi(
      this.authService.currentUser.secteurCommercial.id,
      values.codeAssistante?.id || ALL,
      values.codeCommercial?.id || ALL
    ).subscribe((res) => {
      const clientList = res.data.allClientEdi;
      if (clientList?.length) {
        const filters: any = [["secteur.id", "=", this.authService.currentUser.secteurCommercial.id]];
        const filter = [];
        clientList.map(clt => {
          filter.push(["id", "=", clt.id], "or");
        });
        filter.pop();
        filters.push("and", filter);
        this.clients = this.clientsService.getDataSource_v2(["code", "raisonSocial"]);
        this.clients.filter(filters);
      }
    });

  }

  onGridContentReady(e) {
    // Orders count shown
    this.gridTitleInput.value = this.gridTitle + ` (${this.datagrid.instance.getDataSource()?.items()?.length ?? "0"})`;
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
          .patchValue(this.dateMgtService.endOfDay(deb));
      } else {
        this.formGroup
          .get("dateMin")
          .patchValue(this.dateMgtService.startOfDay(fin));
      }
    }
    this.periodeSB.value = null;
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    this.onFieldValueChange();

    const datePeriod = this.dateMgtService.getDates(e);

    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  createEDIOrder(data, entrId?) {

    // Add entrepot to commande EDI data
    if (entrId) data = { ...data, entrepot: { id: entrId } };

    console.log(data);

    this.ordresEdiService
      .fCreeOrdresEdi(
        this.currentCompanyService.getCompany().id,
        data.entrepot.id,
        this.datePipe.transform(data.dateLivraison, "dd/MM/yyyy"),
        this.campagneEnCours.id,
        data.refCmdClient,
        data.client.id,
        data.refEdiOrdre,
        this.authService.currentUser.nomUtilisateur
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          // this.tabContext.openOrdre("671140", this.campagneEnCours.id);
        },
        error: (error: Error) => {
          console.log(error);
          alert(this.messageFormat(error.message), this.localization.localize("ordre-edi-creation"));
        }
      });


  }

  private messageFormat(mess) {
    mess = mess
      .replace("Exception while fetching data (/fCreeOrdresEdi) : ", "");
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }

  OnClickCreateEDIButton(data) {
    this.commandeEDI = data.items ?? data.collapsedItems;
    this.commandeEDI = this.commandeEDI[0];

    // Do we already have a specified entrepot? Otherwise, choose one
    if (this.commandeEDI.entrepot?.id) {
      this.createEDIOrder(this.commandeEDI);
    } else {
      this.choixEntPopup.visible = true;
    }

  }

  onCellClick(e) {
    if (e.column.dataField !== "numeroOrdre") return;
    e.event.stopImmediatePropagation();
  }

  onCellPrepared(e) {
    const field = e.column.dataField;

    if (e.rowType === "group") {
      if (field === "refEdiOrdre" && e.cellElement.textContent) {
        let data = e.data.items ?? e.data.collapsedItems;
        data = data[0];

        // Add special background color to the group row
        e.cellElement.parentElement.classList.add("group-back-color");

        // Show ref cmd clt - raison soc clt - Version date - Livraison
        // Fill left text of the group row
        e.cellElement.childNodes[0].children[1].innerText = data.refCmdClient + " - " +
          (data.client.raisonSocial ?? "") + " - " +
          "Version " + (data.version ?? "") + " " +
          "du " + this.dateMgtService.formatDate(data.dateDocument, DATEFORMAT) ?? "";

        // Fill right text of the group row
        e.cellElement.childNodes[0].children[2].innerText =
          "Livraison : " + this.dateMgtService.formatDate(data.dateLivraison, DATEFORMAT) ?? "";

        // Fill indicator button text and sets its bck depending on the status
        e.cellElement.childNodes[0].children[0].innerHTML = data.status;
        e.cellElement.childNodes[0].children[0].classList.add(`info-${data.status}`);
      }
    }
    if (e.rowType === "data") {
      // Hide status on developped rows as it is shown in the group
      if (field === "status") e.cellElement.innerText = "";

      if (e.column.dataField === "libelleProduit") {
        // Infobulle Descript. article
        e.cellElement.title = e.data.libelleProduit;
      }

    }
  }

  showModifyEDIButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].status === "U" && data[0].statusGeo === "N";
  }

  showCreateEDIButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].status === "C" && data[0].statusGeo === "N";
  }

  showViewEDIButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].statusGeo === "T";
  }

  showCreateComplEDIButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].status === "U" && data[0].statusGeo === "N";
  }

}

export default GridCommandesEdiComponent;
