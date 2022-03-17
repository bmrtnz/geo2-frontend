import {
    Component,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Role } from "app/shared/models";
import MouvementEntrepot from "app/shared/models/mouvement-entrepot.model";
import MouvementFournisseur from "app/shared/models/mouvement-fournisseur.model";
import Ordre from "app/shared/models/ordre.model";
import RecapitulatifEntrepot from "app/shared/models/recapitulatif-entrepot.model";
import RecapitulatifFournisseur from "app/shared/models/recapitulatif-fournisseur.model";
import {
    AuthService,
    EntrepotsService,
    FournisseursService,
    LocalizationService,
} from "app/shared/services";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { SupervisionPaloxsService } from "app/shared/services/api/supervision-paloxs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
    Grid,
    GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSwitchComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";

enum GridModel {
    MouvementsClients,
    RecapitulatifClients,
    MouvementsFournisseurs,
    RecapitulatifFournisseurs,
}

enum InputField {
    entrepot = "entrepot",
    commercial = "commercial",
    dateMaxMouvements = "dateMaxMouvements",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
    selector: "app-supervision-comptes-palox",
    templateUrl: "./supervision-comptes-palox.component.html",
    styleUrls: ["./supervision-comptes-palox.component.scss"],
})
export class SupervisionComptesPaloxComponent implements OnInit {
    readonly INDICATOR_NAME = "SupervisionComptesPalox";

    public validRequiredEntity: {};

    @ViewChildren(DxDataGridComponent)
    paloxGrids: QueryList<DxDataGridComponent>;

    @ViewChild("switchType", { static: false }) switchType: DxSwitchComponent;
    @ViewChild("switchEntity", { static: false })
    switchEntity: DxSwitchComponent;

    public columnChooser = environment.columnChooser;
    public columns: Observable<GridColumn[]>[];
    public ordresDataSource: DataSource;
    public commercial: DataSource;
    public entrepot: DataSource;
    public fournisseur: DataSource;
    public formGroup = new FormGroup({
        entrepot: new FormControl(),
        commercial: new FormControl(),
        dateMaxMouvements: new FormControl(
            this.dateManagementService.startOfDay(),
        ),
    } as Inputs<FormControl>);

    private datasources: DataSource[] = [];
    public toRefresh: boolean;

    constructor(
        public gridConfiguratorService: GridConfiguratorService,
        public ordresService: OrdresService,
        public supervisionPaloxsService: SupervisionPaloxsService,
        public entrepotsService: EntrepotsService,
        public fournisseursService: FournisseursService,
        public personnesService: PersonnesService,
        public authService: AuthService,
        public localizeService: LocalizationService,
        public dateManagementService: DateManagementService,
        private tabContext: TabContext,
        private currentCompanyService: CurrentCompanyService,
    ) {
        this.validRequiredEntity = {
            client: true,
            entrepot: true,
            fournisseur: true,
        };
        this.entrepot = this.entrepotsService.getDataSource_v2([
            "id",
            "code",
            "raisonSocial",
        ]);
        this.entrepot.filter([
            ["valide", "=", true],
            "and",
            ["client.societe.id", "=", this.currentCompanyService.getCompany().id]
        ]);
        this.commercial = this.personnesService.getDataSource_v2([
            "id",
            "nomUtilisateur",
        ]);
        this.commercial.filter([
            ["valide", "=", true],
            "and",
            ["role", "=", Role.COMMERCIAL],
            "and",
            ["nomUtilisateur", "<>", "null"],
        ]);
    }

    async ngOnInit() {
        this.toRefresh = true;
        this.columns = [
            Grid.MouvClientsComptesPalox,
            Grid.RecapClientsComptesPalox,
            Grid.MouvFournisseursComptesPalox,
            Grid.RecapFournisseursComptesPalox,
        ]
            .map((c) => this.gridConfiguratorService.fetchDefaultConfig(c))
            .map((g) => from(g).pipe(map((config) => config.columns)));

        const fields = this.columns.map((c) =>
            c.pipe(map((columns) => columns.map((column) => column.dataField))),
        );

        this.datasources = await Promise.all(
            [
                MouvementEntrepot,
                RecapitulatifEntrepot,
                MouvementFournisseur,
                RecapitulatifFournisseur,
            ].map(async (m, i) =>
                this.supervisionPaloxsService.getListDataSource(
                    await fields[i].toPromise(),
                    m,
                ),
            ),
        );

        this.formGroup.valueChanges.subscribe((_) => this.toRefresh = true);
        if (
            !this.authService.isAdmin &&
            this.authService.currentUser?.commercial
        )
            this.formGroup
                .get("commercial")
                .setValue(this.authService.currentUser.commercial);
    }

    enableFilters() {
        this.toRefresh = false;
        const values: Inputs = this.formGroup.value;
        this.supervisionPaloxsService.setPersisantVariables({
            codeSociete: this.currentCompanyService.getCompany().id,
            codeCommercial: values.commercial?.id,
            codeEntrepot: values.entrepot?.id,
            dateMaxMouvements: values.dateMaxMouvements,
        });
        const index = this.getActiveGridIndex();
        this.paloxGrids.toArray()[index].dataSource = this.datasources[index];
    }

    onRowDblClick({ data }: { data: Ordre }) {
        this.tabContext.openOrdre(data.numero);
    }

    displayCodeBefore(data) {
        return data
            ? (data.code ? data.code : data.id) +
            " - " +
            (data.nomUtilisateur
                ? data.nomUtilisateur
                : data.raisonSocial
                    ? data.raisonSocial
                    : data.description)
            : null;
    }

    switchChange(e) {
        this.toRefresh = true;
        this.paloxGrids.map((component) => {
            component.dataSource = null;
            component.visible = false;
            return component;
        });
        const index = this.getActiveGridIndex();
        this.paloxGrids.toArray()[index].visible = true;
    }

    private getActiveGridIndex() {
        const type = this.switchType.value ? "Recapitulatif" : "Mouvements";
        const entity = this.switchEntity.value ? "Fournisseurs" : "Clients";
        return GridModel[type + entity];
    }

    onCellPrepared(e) {
        if (e.rowType === "data") {
            // Best expression for date
            if (
                e.column.dataField === "dateInventaire" ||
                e.column.dataField === "dateDepartOrdre"
            ) {
                if (e.value)
                    e.cellElement.innerText =
                        this.dateManagementService.formatDate(
                            e.value,
                            "dd-MM-yyyy",
                        );
            }
        }
    }
}

export default SupervisionComptesPaloxComponent;
