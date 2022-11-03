import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Client } from "app/shared/models";
import { AuthService, ClientsService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn, TotalItem } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

enum InputField {
  client = "client",
  secteur = "secteur"
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-grid-encours-client",
  templateUrl: "./grid-encours-client.component.html",
  styleUrls: ["./grid-encours-client.component.scss"]
})
export class GridEncoursClientComponent implements OnChanges {

  @Input() popupShown: boolean;
  @Input() public client: Client;
  @Output() hidePopup = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;

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
  public toRefresh: boolean;
  public readyToRefresh: boolean;
  private requiredFields: string[];
  private sumDebit: number;
  private sumCredit: number;
  public formGroup = new FormGroup({
    client: new FormControl(),
    secteur: new FormControl(),
    encoursTotal: new FormControl(),
    encoursAutorise: new FormControl(),
    encoursDepassement: new FormControl(),
    encoursRetard: new FormControl()
  } as Inputs<FormControl>);

  constructor(
    public clientsService: ClientsService,
    public secteursService: SecteursService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public authService: AuthService,
    public functionsService: FunctionsService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.EncoursClient);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
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
      "numImmat",
      "paysCode",
      "raisonSociale",
      "societe.id",
      "ville",
      "zip",
      "id"
    ];
  }

  ngOnChanges() {
    this.toRefresh = true;
    if (this.client && this.popupShown) {
      this.formGroup.patchValue({
        client: {
          id: this.client.id,
          agrement: this.client.agrement,
          enCoursTemporaire: this.client.enCoursTemporaire,
          enCoursBlueWhale: this.client.enCoursBlueWhale
        },
        secteur: { id: this.client.secteur.id },
        encoursAutorise: null,
        encoursRetard: null
      });
      this.enableFilters();
    }
  }

  enableFilters() {

    this.toRefresh = false;
    this.readyToRefresh = false;
    this.datagrid.dataSource = null;

    const values: Inputs = { ...this.formGroup.value };
    this.formGroup.patchValue({
      encoursTotal: null,
      encoursAutorise:
        values.client.agrement ?? 0
        + values.client.enCoursTemporaire ?? 0
        + values.client.enCoursBlueWhale ?? 0,
      encoursRetard: null,
      encoursDepassement: null
    });
    this.depassement = false;
    this.retard = false;

    this.today = new Date();
    setTimeout(() => this.datagrid.instance.beginCustomLoading(""));
    this.clientsService.allClientEnCours(
      values.client.id,
      this.requiredFields
    ).subscribe((res) => {
      this.readyToRefresh = true;
      const results = res.data.allClientEnCours;
      this.datagrid.dataSource = results;
      this.datagrid.instance.refresh();
      this.calculateMiscEncours(results);
      this.datagrid.instance.endCustomLoading();
    });

  }

  calculateMiscEncours(data) {
    let encTotal = 0;
    let retard = 0;
    this.sumDebit = 0;
    this.sumCredit = 0;
    data.map(enc => {
      if (enc.cfcSens === "D") {
        encTotal += enc.cfcMontantEuros;
        this.sumDebit += enc.cfcMontantEuros;
        if (this.today > new Date(enc.cfcDateEcheance)) retard += enc.cfcMontantEuros;
      }
      if (enc.cfcSens === "C") {
        encTotal -= enc.cfcMontantEuros;
        this.sumCredit += enc.cfcMontantEuros;
        if (this.today > new Date(enc.cfcDateEcheance)) retard -= enc.cfcMontantEuros;
      }
    });
    const depassement = encTotal - this.formGroup.get("encoursAutorise").value;
    this.depassement = depassement > 0;
    this.retard = retard > 0;
    this.formGroup.patchValue({
      encoursTotal: encTotal,
      encoursDepassement: this.depassement ? depassement : null,
      encoursRetard: this.retard ? retard : null
    });
  }

  onContentReady() {
    if (!this.readyToRefresh) this.datagrid.instance.beginCustomLoading("");
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Credit and Debit display management
      const montant = e.data.cfcMontantEuros.toString().replace(".", ",");
      if (e.data.cfcSens === "C") {
        if (e.column.dataField === "cfcMontantEuros") {
          e.cellElement.innerText = "";
        }
        if (e.column.dataField === "cfcMontantDevise") {
          e.cellElement.innerText = montant;
        }
      } else {
        if (e.column.dataField === "cfcMontantDevise") {
          e.cellElement.innerText = "";
        }
        if (e.column.dataField === "cfcMontantEuros") {
          e.cellElement.innerText = montant;
        }
      }
      // Expired date
      if (e.column.dataField === "cfcDateEcheance") {
        if (this.today > e.value) e.cellElement.classList.add("expired-date");
      }
    }
    // Setting total debit & credit info
    if (e.rowType === "totalFooter") {
      if (["cfcIntitule", "cfcMontantEuros", "cfcMontantDevise"].includes(e.column.dataField))
        e.cellElement.classList.add("encours-total-text");

      if (e.column.dataField === "cfcIntitule" && (this.sumCredit || this.sumDebit)) {
        e.cellElement.innerText = "Total client :";
        e.cellElement.classList.add("text-align-right");
      }
      if (e.column.dataField === "cfcMontantEuros") {
        if (this.sumDebit) {
          e.cellElement.innerText = this.sumDebit.toFixed(2).replace(".", ",");
        } else {
          e.cellElement.innerText = "";
        }
      }
      if (e.column.dataField === "cfcMontantDevise") {
        if (this.sumCredit) {
          e.cellElement.innerText = this.sumCredit.toFixed(2).replace(".", ",");
        } else {
          e.cellElement.innerText = "";
        }
      }
    }
  }

  onSecteurChanged(e) {
    this.onFieldValueChange();
    this.clients = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "agrement",
      "enCoursTemporaire",
      "enCoursBlueWhale",
      "valide"
    ]);
    const filter: any = [["secteur.id", "=", e.value?.id]];
    filter.push("and", ["valide", "=", true]);
    this.clients.filter(filter);
    // We check that this change is coming from the user
    if (!e.event) return;
    this.formGroup.patchValue({
      client: null
    });
    this.onFieldValueChange();
  }

  onClientChanged(e) {
    this.onFieldValueChange();
  }

  onFieldValueChange() {
    this.toRefresh = !!this.formGroup.get("client").value &&
      !!this.formGroup.get("secteur").value;
  }

  displayCodeBefore(data) {
    return data ?
      ((data.code ? data.code : data.id) + " - " + (data.nomUtilisateur ? data.nomUtilisateur :
        (data.raisonSocial ? data.raisonSocial : data.description)))
      : null;
  }

}

