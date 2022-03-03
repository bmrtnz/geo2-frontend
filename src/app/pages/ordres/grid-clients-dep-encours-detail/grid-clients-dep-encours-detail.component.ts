import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { LocalizePipe } from "app/shared/pipes";
import { ClientsService } from "app/shared/services";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
    Grid,
    GridConfig,
    GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import DataSource from "devextreme/data/data_source";
import { dxDataGridRowObject } from "devextreme/ui/data_grid";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
    selector: "app-grid-clients-dep-encours-detail",
    templateUrl: "./grid-clients-dep-encours-detail.component.html",
    styleUrls: ["./grid-clients-dep-encours-detail.component.scss"],
})
export class GridClientsDepEncoursDetailComponent implements OnInit {
    @Input() masterRow: dxDataGridRowObject;

    public dataSource: DataSource;
    public columnChooser = environment.columnChooser;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;

    public title: string;

    constructor(
        private localizePipe: LocalizePipe,
        private datePipe: DatePipe,
        private clientsService: ClientsService,
        public gridConfiguratorService: GridConfiguratorService,
        public currentCompanyService: CurrentCompanyService,
    ) {
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
            Grid.DepassementEncoursClient,
        );
        this.columns = from(this.gridConfig).pipe(
            map((config) => config.columns),
        );
        this.title = this.localizePipe.transform(
            "grid-depassement-encours-client-title",
        );
    }

    async ngOnInit() {
        const fields = this.columns.pipe(
            map((columns) => columns.map((column) => column.dataField)),
        );
        this.dataSource = this.clientsService.getDataSource_v2(
            await fields.toPromise(),
        );
        this.enableFilters();
    }

    enableFilters() {
        this.dataSource.filter([
            ["pays.id", "=", this.masterRow.data.id],
            "and",
            ["societe.id", "=", this.currentCompanyService.getCompany().id],
            "and",
            [
                ["enCoursNonEchu", "<>", 0],
                "or",
                ["enCours1a30", "<>", 0],
                "or",
                ["enCours31a60", "<>", 0],
                "or",
                ["enCours61a90", "<>", 0],
                "or",
                ["enCours90Plus", "<>", 0],
            ],
            ...(this.masterRow.data.secteur
                ? ["and", ["secteur.id", "=", this.masterRow.data.secteur?.id]]
                : []),
        ]);
    }

    onCellPrepared(event) {
        if (event.rowType !== "data") return;

        // Formating figures: 1000000 becomes 1 000 000 €
        if (
            event.column.dataType === "number" &&
            !event.cellElement.innerText.includes("€")
        ) {
            event.cellElement.innerText =
                event.cellElement.innerText
                    .split("")
                    .reverse()
                    .join("")
                    .replace(/([0-9]{3})/g, "$1 ")
                    .split("")
                    .reverse()
                    .join("") + " €";
        }

        if (event.column.dataField === "raisonSocial") {
            const originalText = (event.cellElement as HTMLElement).innerText;
            if (event.data.enCoursDouteux > 0) {
                (
                    event.cellElement as HTMLElement
                ).innerText = `>>> ${originalText} ${event.data.ville}`;
                (event.cellElement as HTMLElement).classList.add("underline");
            }
            if (event.data.enCoursDateLimite)
                (
                    event.cellElement as HTMLElement
                ).innerText += ` -> ${this.datePipe.transform(
                    new Date(event.data.enCoursDateLimite),
                )}`;
            if (!event.data.valide)
                (event.cellElement as HTMLElement).classList.add("strike");
        }
    }
}
