import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Role } from "app/shared/models";
import { Model, ModelFieldOptions } from "app/shared/models/model";
import Ordre from "app/shared/models/ordre.model";
import {
    AuthService,
    LocalizationService,
    TransporteursService,
} from "app/shared/services";
import { GridsConfigsService } from "app/shared/services/api/grids-configs.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
    Grid,
    GridConfig,
    GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import {
    Indicator,
    OrdresIndicatorsService,
} from "app/shared/services/ordres-indicators.service";
import { GridColumn } from "basic";
import {
    DxCheckBoxComponent,
    DxDataGridComponent,
    DxSelectBoxComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";

@Component({
    selector: "app-ordres-non-clotures",
    templateUrl: "./ordres-non-clotures.component.html",
    styleUrls: ["./ordres-non-clotures.component.scss"],
})
export class OrdresNonCloturesComponent implements OnInit, AfterViewInit {
    readonly INDICATOR_NAME = "OrdresNonClotures";
    options: {};
    secteurs: DataSource;
    indicator: Indicator;
    filter: any;
    columnChooser = environment.columnChooser;
    detailedFields: Observable<
        ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
    >;
    rowSelected: boolean;

    @ViewChild("secteurValue", { static: false })
    secteurSB: DxSelectBoxComponent;
    @ViewChild("withSector") withSector: DxCheckBoxComponent;
    @ViewChild(DxDataGridComponent) grid: DxDataGridComponent;

    public dataSource: DataSource;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;

    constructor(
        private router: Router,
        public transporteursService: TransporteursService,
        public gridService: GridsConfigsService,
        public gridConfiguratorService: GridConfiguratorService,
        public secteursService: SecteursService,
        public currentCompanyService: CurrentCompanyService,
        public ordresService: OrdresService,
        public authService: AuthService,
        public localizeService: LocalizationService,
        private ordresIndicatorsService: OrdresIndicatorsService,
        private tabContext: TabContext,
    ) {
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
        this.indicator = this.ordresIndicatorsService.getIndicatorByName(
            this.INDICATOR_NAME,
        );
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
            Grid.OrdresNonClotures,
        );
        this.columns = from(this.gridConfig).pipe(
            map((config) => config.columns),
        );
        this.dataSource = this.indicator.dataSource;
    }

    ngOnInit() {
        this.dataSource = this.indicator.dataSource;
    }

    ngAfterViewInit() {
        if (this.authService.currentUser.secteurCommercial) {
            this.secteurSB.value =
                this.authService.currentUser.secteurCommercial;
        } else if (!this.authService.isAdmin) {
            this.withSector.value = true;
        } else {
            this.enableFilters();
        }
    }

    enableFilters() {
        const filters = this.indicator.cloneFilter();
        if (this.secteurSB.value?.id && this.withSector.value)
            filters.push("and", [
                "secteurCommercial.id",
                "=",
                this.secteurSB.value.id,
            ]);
        else if (!this.authService.isAdmin)
            filters.push(
                ...(this.authService.currentUser.personne?.role?.toString() ===
                Role[Role.COMMERCIAL]
                    ? [
                          "and",
                          [
                              "commercial.id",
                              "=",
                              this.authService.currentUser.commercial.id,
                          ],
                      ]
                    : []),
                ...(this.authService.currentUser.personne?.role?.toString() ===
                Role[Role.ASSISTANT]
                    ? [
                          "and",
                          [
                              "assistante.id",
                              "=",
                              this.authService.currentUser.assistante.id,
                          ],
                      ]
                    : []),
            );

        this.dataSource?.filter(filters);
        if (!this.grid?.dataSource) this.grid.dataSource = this.dataSource;
        else {
            this.dataSource?.reload();
        }
    }

    onRowClick() {
        this.rowSelected = true;
    }

    onRowDblClick({ data }: { data: Ordre }) {
        this.tabContext.openOrdre(data.numero);
    }
}

export default OrdresNonCloturesComponent;
