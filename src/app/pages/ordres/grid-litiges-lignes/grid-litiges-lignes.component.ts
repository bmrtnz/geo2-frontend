import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import {
    GridConfiguratorService,
    Grid,
    GridConfig,
} from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { DxDataGridComponent } from "devextreme-angular";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import Ordre from "app/shared/models/ordre.model";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import { ToggledGrid } from "../form/form.component";
import { GridColumn } from "basic";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
    selector: "app-grid-litiges-lignes",
    templateUrl: "./grid-litiges-lignes.component.html",
    styleUrls: ["./grid-litiges-lignes.component.scss"],
})
export class GridLitigesLignesComponent implements OnInit, ToggledGrid {
    @Output() public ordreSelected = new EventEmitter<LitigeLigne>();
    @Input() public filter: [];
    @Input() public ordre: Ordre;
    @ViewChild(DxDataGridComponent, { static: true })
    dataGrid: DxDataGridComponent;

    public dataSource: DataSource;
    public columns: Observable<GridColumn[]>;
    public columnChooser = environment.columnChooser;
    private gridConfig: Promise<GridConfig>;

    constructor(
        private litigesLignesService: LitigesLignesService,
        public currentCompanyService: CurrentCompanyService,
        public localizeService: LocalizationService,
        public gridConfiguratorService: GridConfiguratorService,
    ) {
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
            Grid.LitigeLigne,
        );
        this.columns = from(this.gridConfig).pipe(
            map((config) => config.columns),
        );
    }

    ngOnInit() {}

    sortGrid() {
        // this.dataGrid.instance.columnOption("dateModification", {​​​​​​​​ sortOrder: "desc"}​​​​​​​​);
    }

    async enableFilters() {
        if (this.ordre?.id) {
            const fields = this.columns.pipe(
                map((columns) => columns.map((column) => column.dataField)),
            );
            this.dataSource = this.litigesLignesService.getDataSource_v2(
                await fields.toPromise(),
            );
            this.dataSource.filter([
                ["ordreLigne.ordre.id", "=", this.ordre.id],
            ]);
        }
    }

    onToggling(toggled: boolean) {
        toggled ? this.enableFilters() : (this.dataSource = null);
    }

    reload() {
        this.dataSource.reload();
    }
}
