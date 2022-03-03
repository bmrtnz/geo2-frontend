import { Component, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NestedPart } from "app/pages/nested/nested.component";
import { Contact } from "app/shared/models";
import { TypeTiers } from "app/shared/models/tier.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { ContactsService } from "app/shared/services/api/contacts.service";
import { FluxService } from "app/shared/services/api/flux.service";
import { MoyenCommunicationService } from "app/shared/services/api/moyens-communication.service";
import { SocietesService } from "app/shared/services/api/societes.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { contact } from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridConfiguratorService, Grid, GridConfig } from "app/shared/services/grid-configurator.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";


@Component({
    selector: "app-contacts",
    templateUrl: "./contacts.component.html",
    styleUrls: ["./contacts.component.scss"],
})
export class ContactsComponent implements OnInit, NestedPart {

    contacts: DataSource;
    fluxSource: DataSource;
    societeSource: DataSource;
    moyenCommunicationSource: DataSource;
    codeTiers: string;
    typeTiers: string;
    typeTiersLabel: string;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;
    columnChooser = environment.columnChooser;
    @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
    contentReadyEvent = new EventEmitter<any>();

    constructor(
        public contactsService: ContactsService,
        public societeService: SocietesService,
        public fluxService: FluxService,
        public moyenCommunicationService: MoyenCommunicationService,
        public currentCompanyService: CurrentCompanyService,
        private route: ActivatedRoute,
        public localizeService: LocalizationService,
        public authService: AuthService,
        public gridConfiguratorService: GridConfiguratorService,
        public gridRowStyleService: GridRowStyleService,
    ) { }

    async ngOnInit() {
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.Contact);
        this.columns = from(this.gridConfig).pipe(map(config => config.columns));
        this.codeTiers = this.route.snapshot.paramMap.get("codeTiers");
        this.typeTiers = this.route.snapshot.paramMap.get("typeTiers");

        this.typeTiersLabel = Object
            .entries(TypeTiers)
            .find(([, value]) => value === this.typeTiers)
            .map(value => value.toLowerCase())
            .shift();

        const fields = this.columns.pipe(map(columns => columns.map(column => {
            let field = column.dataField;
            if (field === "moyenCommunication")
                field += `.${this.moyenCommunicationService.model.getKeyField()}`;
            if (field === "flux")
                field += `.${this.fluxService.model.getKeyField()}`;
            return field;
        })));
        this.contacts = this.contactsService.getDataSource_v2(await fields.toPromise());

        this.enableFilters();
        this.dataGrid.dataSource = this.contacts;
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

    }

    enableFilters() {
        this.contacts.filter([
            ["codeTiers", "=", this.codeTiers],
            "and",
            ["typeTiers", "=", this.typeTiers],
        ]);
    }

    displayIDBefore(data) {
        return data ? (data.id + " - " +
            (data.nomUtilisateur ? data.nomUtilisateur :
                (data.raisonSocial ? data.raisonSocial : data.description))) : null;
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

    onRowInserting(event) {
        (event.data as Contact).codeTiers = this.codeTiers;
        (event.data as Contact).typeTiers = this.typeTiers;
        (event.data as Contact).societe = this.currentCompanyService.getCompany();
    }

    onRowClick({ rowIndex }) {
        this.dataGrid.instance.editRow(rowIndex);
    }

    onValueChanged(event, cell) {
        if (cell.setValue)
            cell.setValue(event.value);
    }

}
