import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AuthService, ClientsService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
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
  @Input() public clientId: string;
  @Input() public secteurId: string;
  @Output() hidePopup = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;

  public secteurs: DataSource;
  public clients: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public totalItems: TotalItem[] = [];
  private gridConfig: Promise<GridConfig>;
  public env = environment;
  public newNumero: number;
  public SelectBoxPopupWidth: number;
  public dataField: string;
  public idLigne: string;
  toRefresh: boolean;
  public formGroup = new FormGroup({
    client: new FormControl(),
    secteur: new FormControl()
  } as Inputs<FormControl>);

  constructor(
    public ordreLignesService: OrdreLignesService,
    public clientsService: ClientsService,
    public secteursService: SecteursService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public authService: AuthService,
    public functionsService: FunctionsService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreLigneHistorique);
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
    this.clients = clientsService.getDataSource_v2(["id", "code", "raisonSocial", "valide"]);
  }

  ngOnChanges() {
    this.toRefresh = true;
    if (this.clientId && this.popupShown) {
      this.clients.filter(["secteur.id", "=", this.secteurId]);
      this.formGroup.patchValue({
        client: { id: this.clientId },
        secteur: { id: this.secteurId }
      });
      this.enableFilters();
    }
  }

  refreshGrid() {
    this.datagrid.instance.refresh();
  }

  async enableFilters() {

    this.toRefresh = false;

    const fields = this.columns.pipe(map(cols => cols.map(column => {
      return column.dataField;
    })));
    const gridFields = await fields.toPromise();
    const dataSource = this.ordreLignesService.getListDataSource([...gridFields, "ordre.statut"]);

    const values: Inputs = {
      ...this.formGroup.value,
    };

    const filter = [
      ["ordre.secteurCommercial.id", "=", values.secteur.id],
      "and",
      ["ordre.client.id", "=", values.client.id]
    ];

    dataSource.filter(filter);
    this.datagrid.dataSource = dataSource;

  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
    }
  }

  onSecteurChanged(e) {
    this.onFieldValueChange();
    this.clients = this.clientsService.getDataSource_v2(["id", "code", "raisonSocial", "valide"]);
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

