import { Component, OnInit, ViewChild } from "@angular/core";
import { Entrepot } from "app/shared/models";
import { AuthService } from "app/shared/services";
import { MruEntrepotsService } from "app/shared/services/api/mru-entrepots.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
    Grid,
    GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn, SingleSelection } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import { Observable, of } from "rxjs";
import { TabContext } from "../root/root.component";
import { map } from "rxjs/operators";
import MRUEntrepot from "app/shared/models/mru-entrepot.model";
import { DateManagementService } from "app/shared/services/date-management.service";

@Component({
    selector: "app-grid-historique-entrepots",
    templateUrl: "./grid-historique-entrepots.component.html",
    styleUrls: ["./grid-historique-entrepots.component.scss"],
})
export class GridHistoriqueEntrepotsComponent
    implements OnInit, SingleSelection<MRUEntrepot> {
    readonly gridID = Grid.OrdreHistoriqueEntrepot;

    @ViewChild(DxDataGridComponent, { static: false })
    private grid: DxDataGridComponent;

    public columns: Observable<GridColumn[]>;
    public gridConfigHandler = (event) =>
        this.gridConfiguratorService.init(this.gridID, {
            ...event,
            title: "Liste des entrepôts",
            onColumnsChange: this.onColumnsChange.bind(this),
        })

    constructor(
        public mruEntrepotsService: MruEntrepotsService,
        public authService: AuthService,
        private dateManagementService: DateManagementService,
        public gridConfiguratorService: GridConfiguratorService,
        public currentCompanyService: CurrentCompanyService,
        public localizeService: LocalizationService,
        public tabContext: TabContext,
    ) { }

    ngOnInit() {
        this.columns = this.gridConfiguratorService.fetchColumns(this.gridID);
    }

    onColumnsChange({ current }: { current: GridColumn[] }) {
        this.updateData(current);
    }

    private updateData(columns: GridColumn[]) {
        of(columns)
            .pipe(
                GridConfiguratorService.getVisible(),
                GridConfiguratorService.getFields(),
                map((fields) =>
                    this.mruEntrepotsService.getDataSource_v2([
                        `entrepot.${Entrepot.getKeyField()}`,
                        `entrepot.${Entrepot.getLabelField()}`,
                        ...fields,
                    ]),
                ),
            )
            .subscribe((datasource) => {
                const filters = [
                    [
                        "societe.id",
                        "=",
                        this.currentCompanyService.getCompany().id,
                    ],
                    "and",
                    ["entrepot.valide", "=", true],
                    "and",
                    ["entrepot.client.valide", "=", true],
                    "and",
                    // We show only the year history
                    [
                        "dateModification",
                        ">=",
                        new Date(this.dateManagementService.findDate(-365)),
                    ],
                    "and",
                    [
                        "utilisateur.nomUtilisateur",
                        "=",
                        this.authService.currentUser.nomUtilisateur,
                    ],
                ];
                datasource.filter(filters);
                this.grid.dataSource = datasource;
            });
    }

    getSelectedItem() {
        return this.grid.instance
            .getVisibleRows()
            .filter((row) => row.key === this.grid.focusedRowKey)
            .map((row) => row.data)[0] as Partial<MRUEntrepot>;
    }
}
