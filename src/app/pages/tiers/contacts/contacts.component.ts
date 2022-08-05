import { Component, EventEmitter, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NestedPart } from "app/pages/nested/nested.component";
import { Client, Contact, Entrepot } from "app/shared/models";
import { TypeTiers } from "app/shared/models/tier.model";
import { AuthService, EntrepotsService, LocalizationService } from "app/shared/services";
import { ContactsService } from "app/shared/services/api/contacts.service";
import { FluxService } from "app/shared/services/api/flux.service";
import { MoyenCommunicationService } from "app/shared/services/api/moyens-communication.service";
import { SocietesService } from "app/shared/services/api/societes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";


@Component({
  selector: "app-contacts",
  templateUrl: "./contacts.component.html",
  styleUrls: ["./contacts.component.scss"],
})
export class ContactsComponent implements OnInit, NestedPart, OnChanges {

  @Input() public clientCode: string;
  @Input() public entrepotCode: string;
  @Input() public fournisseurCode: string;
  @Input() public transporteurLigneId: string;
  @Input() public lieupassageaquaiLigneId: string;

  contacts: DataSource;
  fluxSource: DataSource;
  societeSource: DataSource;
  moyenCommunicationSource: DataSource;
  codeTiers: string;
  typeTiers: string;
  typeTiersLabel: string;
  zoomMode: boolean;
  dataField: string;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  contentReadyEvent = new EventEmitter<any>();

  constructor(
    public contactsService: ContactsService,
    public societeService: SocietesService,
    private entrepotsService: EntrepotsService,
    public fluxService: FluxService,
    public moyenCommunicationService: MoyenCommunicationService,
    public currentCompanyService: CurrentCompanyService,
    private route: ActivatedRoute,
    public localizeService: LocalizationService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
  ) { }

  ngOnChanges() {
    // Zooms client, fournisseur, transporteur...

    this.zoomMode =
      !!this.fournisseurCode ||
      !!this.transporteurLigneId ||
      !!this.lieupassageaquaiLigneId ||
      !!this.clientCode ||
      !!this.entrepotCode;

    if (!this.zoomMode) return;

    if (this.clientCode) {
      this.codeTiers = this.clientCode;
      this.typeTiers = TypeTiers.CLIENT;
    }
    if (this.entrepotCode) {
      this.codeTiers = this.entrepotCode;
      this.typeTiers = TypeTiers.ENTREPOT;
    }
    if (this.fournisseurCode) {
      this.codeTiers = this.fournisseurCode;
      this.typeTiers = TypeTiers.FOURNISSEUR;
    }
    if (this.transporteurLigneId) {
      this.codeTiers = this.transporteurLigneId;
      this.typeTiers = TypeTiers.TRANSPORTEUR;
    }
    if (this.lieupassageaquaiLigneId) {
      this.codeTiers = this.lieupassageaquaiLigneId;
      this.typeTiers = TypeTiers.LIEUPASSAGEAQUAI;
    }

    this.updateGrid();

  }

  ngOnInit() {

    this.societeSource = this.societeService.getDataSource();
    this.fluxSource = this.fluxService.getDataSource();
    this.moyenCommunicationSource = this.moyenCommunicationService.getDataSource();
    // Léa 09/2021
    // Moyen : les moyens EDIFACT et FTP ne doivent pas pouvoir être ajoutés par les utilisateurs de base (uniquement par les admin)
    // Flux : les flux FACTUR et FACDUP ne doivent pas pouvoir être ajoutés par les utilisateurs de base (uniquement par les admin)
    if (!this.authService.currentUser.adminClient) {
      this.moyenCommunicationSource.filter([["id", "<>", "FTP"], "and", ["id", "<>", "EFT"]]);
      this.fluxSource.filter([["id", "<>", "FACDUP"], "and", ["id", "<>", "FACTUR"]]);
    }

    if (this.zoomMode) return;

    this.codeTiers = this.route.snapshot.paramMap.get("codeTiers");
    this.typeTiers = this.route.snapshot.paramMap.get("typeTiers");

    this.updateGrid();

  }

  async updateGrid() {

    this.typeTiersLabel = Object
      .entries(TypeTiers)
      .find(([, value]) => value === this.typeTiers)
      .map(value => value.toLowerCase())
      .shift();

    if (!this.dataGrid.dataSource) {
      this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.Contact);
      this.columns = from(this.gridConfig).pipe(map(config => config.columns));


      const fields = this.columns.pipe(map(columns => columns.map(column => {
        let field = column.dataField;
        if (field === "moyenCommunication")
          field += `.${this.moyenCommunicationService.model.getKeyField()}`;
        if (field === "flux")
          field += `.${this.fluxService.model.getKeyField()}`;
        return field;
      })));
      this.contacts = this.contactsService.getDataSource_v2(await fields.toPromise());
    }

    this.enableFilters();
    this.dataGrid.dataSource = null;
    this.dataGrid.dataSource = this.contacts;

  }

  enableFilters() {
    const filter = [
      ["codeTiers", "=", this.codeTiers],
      "and",
      ["typeTiers", "=", this.typeTiers]
    ];
    // Seuls les clients et entrepôts sont rattachés à une société
    if (this.typeTiers === "C" || this.typeTiers === "E") {
      filter.push("and", ["societe.id", "=", this.currentCompanyService.getCompany().id]);
    }

    this.contacts.filter(filter);
  }

  calculateFilterExpression(filterValue, selectedFilterOperation) {
    let dataField = this.dataField;
    if (dataField === "moyenCommunication") dataField += ".description";
    if (dataField === "flux") dataField += ".id";
    return [dataField, selectedFilterOperation, filterValue];
  }

  displayIDBefore(data) {
    return data
      ? data.id +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      if (!e.data.valide) {
        e.rowElement.classList.add("highlight-datagrid-row");
      }
    }
  }

  onEditingStart(e) {
    // Léa 10/2021
    // Si un flux est "facture", la ligne ne peut être modifiée par un utilisateur de base (uniquement par les admin)
    if (!this.authService.currentUser.adminClient) {
      e.component.getSelectedRowsData().map((row) => {
        if (row.flux.id === "FACTUR") e.cancel = true;
      });
    }
  }

  onInitNewRow(e) {
    e.data.valide = true;
  }

  onRowInserting({ data }: { data: Partial<Contact> }) {
    data.codeTiers = this.codeTiers;
    data.typeTiers = this.typeTiers;
    // Seuls les clients et entrepôts sont rattachés à une société
    if (this.typeTiers === "C" || this.typeTiers === "E")
      data.societe = this.currentCompanyService.getCompany();
  }

  onSaving(event) {
    if (event.changes.length)
      event.promise = this.processSaving(event.changes);
  }

  async processSaving(changes) {
    if (this.typeTiers !== TypeTiers.ENTREPOT) return;
    for (const change of changes) {
      const refs = await this
        .fetchRefClientEntrepot(change.data.fluxComplement);
      change.data = { ...change.data, ...refs };
    }
  }

  async fetchRefClientEntrepot(fluxComplement: string) {
    const fetchEntrepot = (codeEntrepot: string) => this
      .entrepotsService
      .getOneByCodeAndSocieteId(
        new Set(["id", "client.id"]),
        codeEntrepot,
        this.currentCompanyService.getCompany().id,
      )
      .pipe(map(res => res.data.entrepotByCodeAndSocieteId))
      .toPromise();
    const entrepot = await fetchEntrepot(this.codeTiers);
    const partialContact: Partial<Contact> = {};

    partialContact.refClientEntrepot = ["DEMAT", "AGP"]
      .includes(fluxComplement)
      ? entrepot.client.id
      : entrepot.id;
    partialContact.client = new Client({ id: entrepot.client.id });
    partialContact.entrepot = new Entrepot({ id: entrepot.id ?? entrepot.client.id });
    return partialContact;
  }

  onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onValueChanged(event, cell) {
    if (cell.setValue)
      cell.setValue(event.value);
  }

}
