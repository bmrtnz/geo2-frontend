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
import { DxSelectBoxComponent, DxTagBoxComponent, DxTileViewComponent } from "devextreme-angular";
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
import { FormUtilsService } from "app/shared/services/form-utils.service";


let self;

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
  public previouslySelected: string[];
  public dragStartTile: string;
  public dragEndTile: string;
  public currentHoveredTile: string;
  public dragging: boolean;


  @ViewChild(DxTagBoxComponent, { static: false }) tagBox: DxTagBoxComponent;
  @ViewChild(DxSelectBoxComponent) secteurInput: DxSelectBoxComponent;
  @ViewChild(DxTileViewComponent, { static: false }) tileView: DxTileViewComponent;


  constructor(
    public ordresIndicatorsService: OrdresIndicatorsService,
    public indicateursService: IndicateursService,
    public authService: AuthService,
    private formUtils: FormUtilsService,
    public currentCompanyService: CurrentCompanyService,
    private tabContext: TabContext,
    private secteursService: SecteursService
  ) {
    self = this;
  }

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

  openCloseConfig() {
    if (this.tagBox.instance.option("opened")) return this.closeConfig();
    this.tagBox.instance.open();
  }

  closeConfig() {
    if (this.tagBox.instance.option("opened")) self.tagBox?.instance.close();
  }

  onContentReady(e) {
    e.component.element()
      .querySelectorAll(".sortable-tiles")
      .forEach(el => {
        el.removeEventListener("mouseenter", (e) => this.onTileMouseOver(e));
        el.addEventListener("mouseenter", (e) => this.onTileMouseOver(e));
      });
  }

  saveTileConfig(e) {
    let selected = e.value;
    if (this.formUtils.areEqual(selected, this.previouslySelected)) return;
    if (selected?.length < 1) return e.component.option("value", this.previouslySelected);

    // Gather indicators
    selected = selected.map((id) => this.ordresIndicatorsService.getIndicatorByName(id).id);
    // Sort when addding/removing
    if (e.component) selected.sort((a, b) => this.previouslySelected.indexOf(a) - this.previouslySelected.indexOf(b));

    this.authService
      .persist({
        configTuilesOrdres: {
          selection: selected,
        },
      })
      .toPromise();

    this.indicatorsChange.emit(selected);
    this.previouslySelected = selected;
  }

  onTileClick(event) {
    this.closeConfig();
    const indicator: Indicator = event.itemData.buttonOptions;
    this.tabContext.openIndicator(indicator.id);
  }

  onDragStart(e) {
    this.dragging = true;
    this.closeConfig();
  }

  onDragAndDrop(e) {
    this.dragging = false;
    this.dragStartTile = e.element.id;
    this.dragEndTile = this.currentHoveredTile;
    if (this.dragStartTile === this.dragEndTile) return;

    const indicators = this.indicators.map(ind => ind.id);
    const fromIndex = indicators.indexOf(this.dragStartTile);
    const toIndex = indicators.indexOf(this.dragEndTile);
    console.log(this.dragStartTile, fromIndex, "=>", this.dragEndTile, toIndex)

    const droppedItem = (this.indicators.splice(fromIndex, 1)[0])
    this.indicators.splice(toIndex, 0, droppedItem);

    this.saveTileConfig({ value: this.indicators.map(ind => ind.id) })
    this.tileView.instance.repaint();
  }

  onTileMouseOver(e) {
    this.currentHoveredTile = e.originalTarget.id;
  }

  configureIndicator() {
    const firstLoadIndicators = (config: { selection: string[] }) => {

      // We remove old (named) indicators that don't exist anymore but were saved
      this.loadedIndicators = config.selection?.filter((ind) =>
        this.ordresIndicatorsService.getIndicatorByName(ind)
      );
      this.indicators = this.loadedIndicators
        .map((id) => this.ordresIndicatorsService.getIndicatorByName(id));
      this.previouslySelected = this.indicators.map(ind => ind.id);
    };

    // Alphabetical order
    this.allIndicators = this.ordresIndicatorsService
      .getIndicators()
      .sort((a, b) => (a.parameter + " " + a.subParameter).localeCompare((b.parameter + " " + b.subParameter)));

    firstLoadIndicators(
      this.authService.currentUser?.configTuilesOrdres?.selection ? this.authService.currentUser?.configTuilesOrdres : {
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
