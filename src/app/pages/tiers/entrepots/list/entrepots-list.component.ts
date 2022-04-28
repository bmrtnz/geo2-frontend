import { Component, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NestedMain, NestedPart } from "app/pages/nested/nested.component";
import { ClientsService, LocalizationService } from "app/shared/services";
import { ApiService } from "app/shared/services/api.service";
import { GridsConfigsService } from "app/shared/services/api/grids-configs.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { DxDataGridComponent } from "devextreme-angular";
import { EntrepotsService } from "app/shared/services/api/entrepots.service";
import { GridColumn } from "basic";
import { Observable, of } from "rxjs";
import {
    GridConfiguratorService,
    Grid,
    GridConfig,
} from "app/shared/services/grid-configurator.service";
import { Entrepot } from "app/shared/models";
import { map } from "rxjs/operators";
import { CurrentCompanyService } from "app/shared/services/current-company.service";

@Component({
    selector: "app-entrepots-list",
    templateUrl: "./entrepots-list.component.html",
    styleUrls: ["./entrepots-list.component.scss"],
})
export class EntrepotsListComponent implements OnInit, NestedMain, NestedPart {
    readonly gridID = Grid.Entrepot;
    clientID: string;
    clientName: string;
    clientCode: string;
    currCompanyID: string;
    public columns: Observable<GridColumn[]>;
    contentReadyEvent = new EventEmitter<any>();
    @ViewChild(DxDataGridComponent, { static: true })
    dataGrid: DxDataGridComponent;
    apiService: ApiService;
    public gridConfigHandler = (event) =>
        this.gridConfiguratorService.init(this.gridID, {
            ...event,
            onColumnsChange: this.onColumnsChange.bind(this),
        })

    constructor(
        public entrepotsService: EntrepotsService,
        public clientsService: ClientsService,
        public gridService: GridsConfigsService,
        public localizeService: LocalizationService,
        public currentCompanyService: CurrentCompanyService,
        private router: Router,
        private route: ActivatedRoute,
        private gridConfiguratorService: GridConfiguratorService,
        public gridRowStyleService: GridRowStyleService,
    ) {
        this.apiService = this.entrepotsService;
    }

    ngOnInit() {
        // Affichage nom client à côté Entrepôts
        this.clientID = this.route.snapshot.paramMap.get("client");
        if (this.clientID) {
            this.clientsService.getOne_v2(this.clientID, ["code", "raisonSocial"]).subscribe((res) => {
                this.clientName = res.data.client.raisonSocial;
                this.clientCode = res.data.client.code;
            });
        }
        this.currCompanyID = this.currentCompanyService.getCompany().id;
        this.columns = this.gridConfiguratorService.fetchColumns(this.gridID);
    }

    private updateData(columns: GridColumn[]) {
        of(columns)
            .pipe(
                GridConfiguratorService.getVisible(),
                GridConfiguratorService.getFields(),
                map((fields) =>
                    this.entrepotsService.getDataSource_v2([
                        Entrepot.getKeyField() as string,
                        ...fields,
                    ]),
                ),
            )
            .subscribe((datasource) => {
                if (this.clientID)
                    datasource.filter(["client.id", "=", this.clientID]);
                this.dataGrid.dataSource = datasource;
            });
    }

    onColumnsChange({ current }: { current: GridColumn[] }) {
        this.updateData(current);
    }

    onRowDblClick(e) {
        this.router.navigate([`/pages/tiers/entrepots/${e.data.id}`]);
    }
    onCreate() {
        this.router.navigate([
            `/pages/tiers/entrepots/create/${this.clientID}`,
        ]);
    }
    onRowPrepared(e) {
        this.gridRowStyleService.applyGridRowStyle(e);
    }
}
