import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { AuthService } from "app/shared/services";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Indicator,
  OrdresIndicatorsService
} from "app/shared/services/ordres-indicators.service";
import { Program } from "app/shared/services/program.service";
import { DxTagBoxComponent } from "devextreme-angular";
import { from, Observable, Subscription } from "rxjs";
import {
  filter,
  map,
  mergeMap,
  startWith,
  switchMap,
  tap
} from "rxjs/operators";
import { ImportProgrammesPopupComponent } from "../import-programmes-popup/import-programmes-popup.component";
import { CommandesEdiComponent } from "../indicateurs/commandes-edi/commandes-edi.component";
import { TabContext } from "../root/root.component";

@Component({
  selector: "app-ordres-accueil",
  templateUrl: "./ordres-accueil.component.html",
  styleUrls: ["./ordres-accueil.component.scss"],
})
export class OrdresAccueilComponent implements OnInit, OnDestroy {

  @Output() public programChosen: any;

  indicators: (Indicator & any)[];
  allIndicators: Indicator[];
  loadedIndicators: string[];
  tilesReady: boolean;
  indicatorsSubscription: Subscription;
  indicatorsObservable: Observable<Indicator[]>;
  indicatorsChange = new EventEmitter<string[]>();

  public programs: any[];

  @ViewChild(DxTagBoxComponent, { static: false }) tagBox: DxTagBoxComponent;
  @ViewChild(CommandesEdiComponent, { static: false }) cdesEdiPopup: CommandesEdiComponent;
  @ViewChild(CommandesEdiComponent, { static: false }) cdesEDI: CommandesEdiComponent;
  @ViewChild(ImportProgrammesPopupComponent, { static: false }) importProgPopup: ImportProgrammesPopupComponent;

  constructor(
    public ordresIndicatorsService: OrdresIndicatorsService,
    public authService: AuthService,
    public currentCompanyService: CurrentCompanyService,
    private tabContext: TabContext,
  ) { }

  ngOnInit() {

    this.programs = [];
    Object.keys(Program).map(prog => {
      this.programs.push(
        {
          id: Program[prog],
          name: prog,
          text: prog
        }
      );
    });

    this.configureIndicator();

    const selectIndicators = this.indicatorsChange.pipe(
      startWith(this.loadedIndicators),
    );
    this.indicatorsSubscription = selectIndicators
      .pipe(
        tap((_) => (this.indicators = [])),
        switchMap((ids) => from(ids)),
        map((id) =>
          this.ordresIndicatorsService.getIndicatorByName(id),
        ),
        map(
          (indicator) =>
            new Indicator({
              ...indicator,
              loading: !!indicator?.withCount,
            }),
        ),
        tap((indicator) => this.indicators.push(indicator)),
        filter((indicator) => indicator.loading),
        mergeMap(async (indicator: Indicator) => {
          if (!indicator.withCount)
            return [indicator.id, ""] as [string, string];

          const countResponse = await indicator.fetchCount
            .pipe(
              map((res) => res[indicator.id].toString()),
            )
            .toPromise();
          return [indicator.id, countResponse] as [string, string];
        }),
      )
      .subscribe(([id, value]) => {
        const index = this.indicators.findIndex(
          (indicator) => id === indicator.id,
        );
        if (index) {
          this.indicators[index].number = value;
          this.indicators[index].loading = false;
        }
      });
  }

  ngOnDestroy() {
    this.indicatorsSubscription.unsubscribe();
  }

  displayExpr(data) {
    return data ? data.parameter + " " + data.subParameter : null;
  }

  openTagBox() {
    this.tagBox.instance.open();
  }

  openProgramPopup(e) {
    this.programChosen = e;
    this.importProgPopup.visible = true;
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

  openCommandesEdi() {
    this.cdesEdiPopup.visible = true;
  }

  configureIndicator() {
    const loadIndicators = (config: { selection: string[] }) => {
      this.loadedIndicators = config.selection;
      this.indicators = this.loadedIndicators.map((id) =>
        this.ordresIndicatorsService.getIndicatorByName(id),
      );
    };

    this.allIndicators = this.ordresIndicatorsService.getIndicators();

    loadIndicators(
      this.authService.currentUser?.configTuilesOrdres ?? {
        selection: this.ordresIndicatorsService
          .getIndicators()
          .map(({ id }) => id),
      },
    );
  }
}
