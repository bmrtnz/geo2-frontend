import { Component, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NestedMain } from "app/pages/nested/nested.component";
import { ApiService } from "app/shared/services/api.service";
import { GridsConfigsService } from "app/shared/services/api/grids-configs.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { DxDataGridComponent } from "devextreme-angular";
import { LocalizationService, TransporteursService } from "app/shared/services";
import { GridColumn } from "basic";
import { Observable, of } from "rxjs";
import {
    GridConfiguratorService,
    Grid,
    GridConfig,
} from "app/shared/services/grid-configurator.service";
import { Transporteur } from "app/shared/models";
import {BrowserService} from "../../../../shared/services/browser.service";

@Component({
    selector: "app-transporteurs-list",
    templateUrl: "./transporteurs-list.component.html",
    styleUrls: ["./transporteurs-list.component.scss"],
})
export class TransporteursListComponent implements OnInit, NestedMain {
    readonly gridID = Grid.Transporteur;

    contentReadyEvent = new EventEmitter<any>();
    apiService: ApiService;
    @ViewChild(DxDataGridComponent, { static: true })
    dataGrid: DxDataGridComponent;
    public columns: Observable<GridColumn[]>;
    public gridConfigHandler = (event) =>
        this.gridConfiguratorService.init(this.gridID, {
            ...event,
            onColumnsChange: this.onColumnsChange.bind(this),
        })

    constructor(
        public transporteursService: TransporteursService,
        public gridService: GridsConfigsService,
        public localizeService: LocalizationService,
        private gridConfiguratorService: GridConfiguratorService,
        private router: Router,
        public gridRowStyleService: GridRowStyleService,
        public browserService: BrowserService
    ) {
        this.apiService = transporteursService;
    }

    ngOnInit() {
        this.columns = this.gridConfiguratorService.fetchColumns(this.gridID);
    }

    private updateData(columns: GridColumn[]) {
        of(columns)
            .pipe(
                GridConfiguratorService.getVisible(),
                GridConfiguratorService.getFields(),
            )
            .subscribe((fields) => {
                this.dataGrid.dataSource =
                    this.transporteursService.getDataSource_v2([
                        Transporteur.getKeyField() as string,
                        ...fields,
                    ]);
            });
    }

    onColumnsChange({ current }: { current: GridColumn[] }) {
        this.updateData(current);
    }

    onCreate() {
        this.router.navigate([`/pages/tiers/transporteurs/create`]);
    }

    onRowDblClick(event) {
        this.router.navigate([`/pages/tiers/transporteurs/${event.data.id}`]);
    }

    onRowPrepared(e) {
        this.gridRowStyleService.applyGridRowStyle(e);
    }
}
