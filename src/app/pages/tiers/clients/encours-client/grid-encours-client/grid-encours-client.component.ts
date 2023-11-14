import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { Client } from "app/shared/models";
import { AuthService, ClientsService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn, TotalItem } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import notify from "devextreme/ui/notify";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PromptPopupComponent } from "app/shared/components/prompt-popup/prompt-popup.component";

enum InputField {
  client = "client",
  secteur = "secteur",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-grid-encours-client",
  templateUrl: "./grid-encours-client.component.html",
  styleUrls: ["./grid-encours-client.component.scss"],
})
export class GridEncoursClientComponent implements OnChanges {
  @Input() popupShown: boolean;
  @Input() public client: Client;
  @Output() hidePopup = new EventEmitter<any>();
  @Output() openOrder = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(PromptPopupComponent, { static: false }) promptPopup: PromptPopupComponent;

  public secteurs: DataSource;
  public clients: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public totalItems: TotalItem[] = [];
  private gridConfig: Promise<GridConfig>;
  public env = environment;
  public depassement: boolean;
  public retard: boolean;
  private today: Date;
  public readyToRefresh: boolean;
  private requiredFields: string[];
  public sumDebit: number;
  public sumCredit: number;
  public formGroup = new UntypedFormGroup({
    client: new UntypedFormControl(),
    secteur: new UntypedFormControl(),
    encoursTotal: new UntypedFormControl(),
    encoursAutorise: new UntypedFormControl(),
    encoursDepassement: new UntypedFormControl(),
    encoursRetard: new UntypedFormControl(),
  } as Inputs<UntypedFormControl>);
  public deviseSociete: string;
  public deviseEncours: string;
  public deviseClient: string;

  constructor(
    public clientsService: ClientsService,
    public secteursService: SecteursService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public authService: AuthService,
    public ordresService: OrdresService,
    public functionsService: FunctionsService,
    public localizeService: LocalizationService,
    public gridUtilsService: GridUtilsService
  ) {
    this.deviseSociete = this.currentCompanyService.getCompany().devise.id;
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.EncoursClient
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
    this.requiredFields = [
      "cfcDateEcheance",
      "cfcDateEcriture",
      "cfcIntitule",
      "cfcMontantDevise",
      "cfcMontantEuros",
      "cfcRappel",
      "cfcRefPiece",
      "cfcSens",
      "cgNum",
      "client.id",
      "clientCode",
      "cptCode",
      "dateFac",
      "devise.id",
      "ecPiece",
      "echeanceNiveau",
      "encActuel",
      "encAssure",
      "encBw",
      "encDateValid",
      "encDepasse",
      "encReferences",
      "entrepot.code",
      "paysCode",
      "raisonSociale",
      "societe.id",
      "ville",
      "zip",
      "id",
      "ordre.numero",
      "ordre.campagne.id",
      "ordre.societe.id",
      "ordre.logistiques.numeroImmatriculation",
      "ordre.logistiques.numeroContainer"
    ];
  }

  ngOnChanges() {
    this.formGroup.patchValue({
      client: {
        id: this.client?.id,
        agrement: this.client?.agrement,
        enCoursTemporaire: this.client?.enCoursTemporaire,
        enCoursBlueWhale: this.client?.enCoursBlueWhale,
      },
      secteur: { id: this.client?.secteur.id },
      encoursAutorise: null,
      encoursRetard: null,
    });
    this.deviseClient = this.client?.devise.id;

    if (this.popupShown) {
      this.enableFilters();
    } else {
      if (this.datagrid) this.datagrid.dataSource = null;
    }

  }

  enableFilters() {
    this.readyToRefresh = false;
    this.datagrid.dataSource = null;

    const values: Inputs = { ...this.formGroup.value };
    this.formGroup.patchValue({
      encoursTotal: null,
      encoursAutorise:
        (values.client.agrement ? values.client.agrement : 0) +
        (values.client.enCoursTemporaire ? values.client.enCoursTemporaire : 0) +
        (values.client.enCoursBlueWhale ? values.client.enCoursBlueWhale : 0),
      encoursRetard: null,
      encoursDepassement: null,
    });
    this.depassement = false;
    this.retard = false;

    this.today = new Date();
    setTimeout(() => this.datagrid.instance.beginCustomLoading(""));
    this.clientsService
      .allClientEnCours(
        values.client.id,
        this.requiredFields,
        this.deviseSociete
      )
      .subscribe((res) => {
        const results = res.data.allClientEnCours;
        // Concatenate immats and containers
        results.map((r) => {
          const immat = [];
          const container = [];
          r.ordre?.logistiques.map((l) => {
            if (l.numeroContainer) container.push(l.numeroContainer);
            if (l.numeroImmatriculation) immat.push(l.numeroImmatriculation);
          });
          if (container.length)
            r.ordre.logistiques.numeroContainer = container.join(" - ");
          if (immat.length)
            r.ordre.logistiques.numeroImmatriculation = immat.join(" - ");
        });
        this.datagrid.dataSource = results;
        this.datagrid.instance.refresh();
        this.calculateMiscEncours(results);
        setTimeout(() => this.datagrid.instance.endCustomLoading());
        this.readyToRefresh = true;
        if (results.length)
          this.deviseEncours = res.data.allClientEnCours[0].devise.id;
      });
  }

  calculateMiscEncours(data) {
    let encTotal = 0;
    let encTotalEuros = 0;
    let retard = 0;
    this.sumDebit = 0;
    this.sumCredit = 0;
    data.map((enc) => {
      const montant = enc.cfcMontantDevise ? enc.cfcMontantDevise : enc.cfcMontantEuros;
      if (enc.cfcSens === "D") {
        encTotal += montant;
        encTotalEuros += enc.cfcMontantEuros;
        this.sumDebit += montant;
        if (this.today > new Date(enc.cfcDateEcheance)) retard += montant;
      }
      if (enc.cfcSens === "C") {
        encTotal -= montant;
        encTotalEuros -= enc.cfcMontantEuros;
        this.sumCredit += montant;
        if (this.today > new Date(enc.cfcDateEcheance)) retard -= montant;
      }
    });
    const depassement =
      encTotalEuros - this.formGroup.get("encoursAutorise").value;
    this.depassement = depassement > 0;
    this.retard = retard > 0;
    this.formGroup.patchValue({
      encoursTotal: encTotal,
      encoursDepassement: this.depassement ? depassement : null,
      encoursRetard: this.retard ? retard : null,
    });
  }

  deviseTodisplay() {
    return this.deviseEncours === "FRF"
      ? this?.deviseSociete
      : this.deviseEncours;
  }

  onContentReady() {
    if (!this.readyToRefresh) this.datagrid.instance.beginCustomLoading("");
  }

  calculateMontantEuroValue(rowData) {
    // Columns Credit and Debit display management (D : cfcMontantEuros - C : cfcMontantDevise)
    const montant = rowData.cfcMontantDevise ? rowData.cfcMontantDevise : rowData.cfcMontantEuros;
    return rowData.cfcSens === "C" ? null : montant;
  }

  calculateMontantDeviseValue(rowData) {
    // Columns Credit and Debit display management (D : cfcMontantEuros - C : cfcMontantDevise)
    const montant = rowData.cfcMontantDevise ? rowData.cfcMontantDevise : rowData.cfcMontantEuros;
    return rowData.cfcSens === "C" ? montant : null;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Expired date
      if (e.column.dataField === "cfcDateEcheance") {
        if (this.today > e.value) e.cellElement.classList.add("expired-date");
      }
      // DEV
      if (e.column.dataField === "devise.id") {
        if (e.value === "FRF") e.cellElement.innerText = "";
      }
    }
  }

  onCellDblClick(e) {
    if (e.data?.societe?.id !== this.currentCompanyService.getCompany().id || !e.data?.entrepot) return;
    const ordresSource = this.ordresService.getDataSource_v2([
      "id",
      "numero",
      "campagne.id",
      "type.id"
    ]);
    const ordfilter = [
      ["numeroFacture", "=", e.data.ecPiece],
      "and",
      ["entrepot.code", "=", e.data.entrepot.code],
    ];
    ordresSource.filter(ordfilter);
    ordresSource.load().then((res) => {
      const nbrOrdres = res.length;
      if (!nbrOrdres) return notify(this.localizeService.localize("aucun-ordre-encours"), "warning", 4000);
      if (nbrOrdres === 1) {
        if (e.data?.societe?.id !== this.currentCompanyService.getCompany().id)
          return;
        const ordre = {
          numero: res[0].numero,
          campagne: { id: res[0].campagne?.id },
        };
        this.openOrder.emit(ordre);
      } else {
        // We need to choose which order to open
        const orderList = [];
        res.map(ord => orderList.push(`${ord.campagne.id}-${ord.numero} (${ord.type.id})`));
        this.promptPopup.show({
          commentTitle: this.localizeService.localize('choose-order-text'),
          commentItemsList: orderList,
          validText: "btn-ouvrir",
        });
      }
    });
  }

  onValidatePromptPopup(e) {
    const ordreInfo = e.split(" ")[0].split("-");
    const ordre = {
      numero: ordreInfo[1],
      campagne: { id: ordreInfo[0] },
    };
    this.openOrder.emit(ordre);
  }

  onRowPrepared(e) {
    if (e.rowType === "data" && e.data?.ordre?.numero) {
      e.rowElement.classList.add("cursor-pointer");
    }
  }

  onSecteurChanged(e) {
    this.clients = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "agrement",
      "enCoursTemporaire",
      "enCoursBlueWhale",
      "valide",
    ]);
    const filter: any = [["secteur.id", "=", e.value?.id]];
    filter.push("and", ["valide", "=", true]);
    filter.push("and", [
      "societe.id",
      "=",
      this.authService.currentCompanyService.getCompany().id,
    ]);
    this.clients.filter(filter);
    // We check that this change is coming from the user
    if (!e.event) return;
    this.formGroup.patchValue({
      client: null,
    });
  }

  displayCodeBefore(data) {
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

  calcCaption(column: GridColumn) {
    let localized =
      this.localizeService.localize(
        "encoursClient-" + column.dataField?.split(".").join("-")
      ) || column.name;
    if (["cfcMontantEuros", "cfcMontantDevise"].includes(column.dataField))
      localized += ` ${this.deviseTodisplay() ?? ""}`;
    return localized;
  }

}
