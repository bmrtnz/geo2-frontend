import {
    AfterViewInit,
    Component,
    EventEmitter,
    ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PushHistoryPopupComponent } from "app/shared/components/push-history-popup/push-history-popup.component";
import { LocalizationService } from "app/shared/services";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
    DxAutocompleteComponent,
    DxPopupComponent,
    DxSelectBoxComponent,
    DxValidationGroupComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { filter } from "rxjs/operators";
import { GridHistoriqueComponent } from "../grid-historique/grid-historique.component";
import { GridSuiviComponent } from "../grid-suivi/grid-suivi.component";
import { RouteParam, TabContext } from "../root/root.component";
import { CampagnesService } from "app/shared/services/api/campagnes.service";

let self;

@Component({
    selector: "app-ordres-suivi",
    templateUrl: "./ordres-suivi.component.html",
    styleUrls: ["./ordres-suivi.component.scss"],
})
export class OrdresSuiviComponent implements AfterViewInit {
    readonly INDICATOR_ID = "SuiviDesOrdres";

    searchItems: any;
    filter: any;
    campagnes: DataSource;
    campagneEnCours: any;
    showGridResults = false;
    @ViewChild(DxAutocompleteComponent, { static: false })
    autocomplete: DxAutocompleteComponent;
    validatePopup: PushHistoryPopupComponent;
    ordresLignesViewExp: boolean;

    refreshGrid = new EventEmitter();

    @ViewChild(GridSuiviComponent, { static: false })
    suiviGrid: GridSuiviComponent;
    @ViewChild(GridHistoriqueComponent, { static: false })
    histoGrid: GridHistoriqueComponent;
    @ViewChild("searchCriteria", { static: false })
    searchCriteria: DxSelectBoxComponent;
    @ViewChild("currCampaign", { static: false })
    currCampaign: DxSelectBoxComponent;

    constructor(
        public localizeService: LocalizationService,
        public currentCompanyService: CurrentCompanyService,
        public campagnesService: CampagnesService,
        public tabContext: TabContext,
        private route: ActivatedRoute,
    ) {
        self = this;
        this.searchItems = [
            "numero",
            "numeroFacture",
            "referenceClient",
            "client.raisonSocial",
            "id",
        ];
        this.campagnesService
            .getDataSource_v2(["id", "description"])
            .load()
            .then((camp) => (this.campagneEnCours = camp.slice(-1)[0]));
    }

    ngAfterViewInit() {
        this.route.paramMap
            .pipe(
                filter(
                    (param) =>
                        param.get(RouteParam.TabID) === this.INDICATOR_ID,
                ),
            )
            .subscribe((_) => {
                this.histoGrid.reload();
                if (this.suiviGrid) this.suiviGrid.reload();
            });
        this.resetCriteria();
    }

    searchDisplayExpr(item) {
        return item
            ? self.localizeService.localize(
                "rechOrdres-" + item.split(".").join("-"),
            )
            : null;
    }

    resetCriteria() {
        this.searchCriteria.instance.option("value", this.searchItems[0]);
    }

    changeSearchCriteria() {
        const toSearch = this.autocomplete.value;
        this.showGridResults = false;
        if (toSearch) {
            setTimeout(() => {
                this.enableFilters(toSearch);
                this.showGridResults = true;
            }, 100);
        }
    }

    changeCampaign() {
        const toSearch = this.autocomplete.value;
        if (toSearch?.length) {
            this.showGridResults = false;
            this.findOrder();
        }
    }

    enableFilters(value) {
        if (!value?.length) return;
        const criteria = this.searchCriteria.instance.option("value");
        const operator = ["numero", "numeroFacture", "id"].includes(criteria)
            ? "="
            : "contains";

        this.filter = [
            ["valide", "=", true],
            "and",
            ["societe.id", "=", this.currentCompanyService.getCompany().id],
            // 'and',
            // ['facture', '=', false],
            "and",
            [criteria, operator, value],
        ];

        // Current campaing filtering
        if (this.currCampaign.instance.option("value")) {
            this.filter.push("and", [
                "campagne.id",
                "=",
                this.campagneEnCours.id,
            ]);
        }
    }

    findOrder() {
        setTimeout(() => {
            const toSearch = this.autocomplete.value;
            if (toSearch?.length) {
                this.enableFilters(toSearch);
                this.showGridResults = true;
            }
        }, 1);
    }
}

export default OrdresSuiviComponent;
