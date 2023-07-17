import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Secteur } from "app/shared/models";
import { AuthService } from "app/shared/services";
import { IndicateursService } from "app/shared/services/api/indicateurs.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Indicator,
  OrdresIndicatorsService,
} from "app/shared/services/ordres-indicators.service";
// import { Program } from "app/shared/services/program.service";
import { DxSelectBoxComponent, DxTagBoxComponent } from "devextreme-angular";
import { from, Observable, Subscription } from "rxjs";
import {
  filter,
  map,
  mergeMap,
  startWith,
  switchMap,
  tap,
} from "rxjs/operators";
import { TabContext } from "../root/root.component";

@Component({
  selector: "app-ordres-accueil",
  templateUrl: "./ordres-accueil.component.html",
  styleUrls: ["./ordres-accueil.component.scss"],
})
export class OrdresAccueilComponent implements OnInit, OnDestroy {

  indicators: (Indicator & any)[];
  allIndicators: Indicator[];
  loadedIndicators: string[];
  tilesReady: boolean;
  indicatorsSubscription: Subscription;
  indicatorsObservable: Observable<Indicator[]>;
  indicatorsChange = new EventEmitter<string[]>();
  secteurs: Array<Partial<Secteur>>;

  @ViewChild(DxTagBoxComponent, { static: false }) tagBox: DxTagBoxComponent;
  @ViewChild(DxSelectBoxComponent) secteurInput: DxSelectBoxComponent;

  constructor(
    public ordresIndicatorsService: OrdresIndicatorsService,
    public indicateursService: IndicateursService,
    public authService: AuthService,
    public currentCompanyService: CurrentCompanyService,
    private tabContext: TabContext,
    private secteursService: SecteursService
  ) { }

  ngOnInit() {
    this.configureIndicator();
    this.setupSecteursDatasource();
  }

  ngOnDestroy() {
    this.indicatorsSubscription.unsubscribe();
  }

  onValueChanged(e) {
    this.indicateursService.secteur = e.value;
    this.loadIndicators();
  }

  displayExpr(data) {
    return data ? data.parameter + " " + data.subParameter : null;
  }

  openTagBox() {
    this.tagBox.instance.open();
  }

  tileNumber(e) {
    this.authService
      .persist({
        configTuilesOrdres: {
          selection: e.value,
        },
      })
      .toPromise();

    this.indicatorsChange.emit(e.value);
    if (e.value.length < 1) {
      e.component.option("value", this.allIndicators);
    }
  }

  onTileClick(event) {
    const indicator: Indicator = event.itemData.buttonOptions;
    this.tabContext.openIndicator(indicator.id);
  }

  configureIndicator() {
    const loadIndicators = (config: { selection: string[] }) => {
      this.loadedIndicators = config.selection;
      // We remove old (named) indicators that don't exist anymore but were saved
      this.loadedIndicators = this.loadedIndicators.filter((ind) =>
        this.ordresIndicatorsService.getIndicatorByName(ind)
      );
      this.indicators = this.loadedIndicators.map((id) =>
        this.ordresIndicatorsService.getIndicatorByName(id)
      );
    };

    this.allIndicators = this.ordresIndicatorsService.getIndicators();

    loadIndicators(
      this.authService.currentUser?.configTuilesOrdres ?? {
        selection: this.ordresIndicatorsService
          .getIndicators()
          .map(({ id }) => id),
      }
    );
  }

  private setupSecteursDatasource() {
    const ds = this.secteursService.getDataSource();
    ds.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
    ds.load().then((res) => {
      this.secteurs = res;
      // Assign user secteur by default (when not admin)
      this.secteurInput.value = !this.authService.isAdmin
        ? this.authService.currentUser.secteurCommercial?.id
        : "%"; // will default to wildcard
    });
  }

  private loadIndicators() {
    const selectIndicators = this.indicatorsChange.pipe(
      startWith(this.loadedIndicators)
    );
    this.indicatorsSubscription = selectIndicators
      .pipe(
        tap((_) => (this.indicators = [])),
        switchMap((ids) => from(ids)),
        map((id) => this.ordresIndicatorsService.getIndicatorByName(id)),
        map(
          (indicator) =>
            new Indicator({
              ...indicator,
              loading: !!indicator?.withCount,
            })
        ),
        tap((indicator) => this.indicators.push(indicator)),
        filter((indicator) => indicator.loading),
        mergeMap(async (indicator: Indicator) => {
          if (!indicator.withCount)
            return [indicator.id, ""] as [string, string];

          const countResponse = await indicator.fetchCount
            .pipe(
              map((res) => res[indicator.id]),
              map(({ count, secteur }) => {
                // if (secteur) this.setCalculatedSecteur(secteur);
                return count;
              })
            )
            .toPromise();
          return [indicator.id, countResponse] as [string, string];
        })
      )
      .subscribe(([id, value]) => {
        const index = this.indicators.findIndex(
          (indicator) => id === indicator.id
        );
        if (index >= 0) {
          this.indicators[index].number = value;
          this.indicators[index].loading = false;
        }
      });
  }
}
