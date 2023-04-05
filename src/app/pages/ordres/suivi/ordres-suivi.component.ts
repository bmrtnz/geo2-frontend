import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
  ViewChild
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PushHistoryPopupComponent } from "app/shared/components/push-history-popup/push-history-popup.component";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { SharedModule } from "app/shared/shared.module";
import {
  DxAutocompleteComponent,
  DxAutocompleteModule,
  DxBoxModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxSelectBoxComponent,
  DxSelectBoxModule
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { filter, map } from "rxjs/operators";
import { GridHistoriqueComponent } from "../grid-historique/grid-historique.component";
import { GridSuiviComponent } from "../grid-suivi/grid-suivi.component";
import { RouteParam, TabContext } from "../root/root.component";

let self;

@Component({
  selector: "app-ordres-suivi",
  templateUrl: "./ordres-suivi.component.html",
  styleUrls: ["./ordres-suivi.component.scss"],
})
export class OrdresSuiviComponent implements AfterViewInit {
  readonly INDICATOR_ID = "SuiviDesOrdres";

  /**
   * Mode configurating what to do when `double-clicking` a grid row (for compatibility)
   * - `open` will open the selected ordre in a new tab (default)
   * - `emit` will emit the selected ordre key from the `onRowSelected` `EventEmiter`
   * @see onRowSelected
   */
  @Input() public rowSelectionEventMode: "emit" | "open" = "open";
  @Output() public whenRowSelected = new EventEmitter<Ordre["id"]>();

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
    private authService: AuthService,
    public tabContext: TabContext,
    private route: ActivatedRoute,
    private ordresService: OrdresService,
  ) {
    self = this;
    this.searchItems = [
      "numero",
      "numeroFacture",
      "referenceClient",
      "client.code",
      "id",
    ];
    // Léa CDT221021 Le critère de recherche "Réf. Ordre" n'a pas d'intérêt pour les utilisateurs et peut être supprimé
    if (!this.authService.isAdmin) this.searchItems.pop();
    this.campagneEnCours = this.currentCompanyService.getCompany().campagne;
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

    // La recherche par numero d'ordre doit fonctionner avec des valeurs partielles (_12345)
    if (criteria === "numero") value = value.padStart(6, "0");

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

  public handleOrdreSelection(ordreID: Ordre["id"]) {
    if (this.rowSelectionEventMode === "open")
      this.ordresService.getOne_v2(ordreID, new Set(["numero", "campagne.id"]))
        .pipe(map(res => res.data.ordre))
        .subscribe(ordre => this.tabContext.openOrdre(ordre.numero, ordre.campagne.id));
    if (this.rowSelectionEventMode === "emit")
      this.whenRowSelected.emit(ordreID);

  }
}

export default OrdresSuiviComponent;

@NgModule({
  imports: [
    SharedModule,
    DxBoxModule,
    DxSelectBoxModule,
    DxAutocompleteModule,
    DxCheckBoxModule,
    DxDataGridModule,
  ],
  declarations: [
    OrdresSuiviComponent,
    GridSuiviComponent,
    GridHistoriqueComponent,
  ],
  exports: [OrdresSuiviComponent],
})
export class OrdresSuiviModule { }
