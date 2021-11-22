import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'app/shared/services';
import { UtilisateursService } from 'app/shared/services/api/utilisateurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { Indicator, OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { ONE_DAY } from 'basic';
import { DxTagBoxComponent } from 'devextreme-angular';
import { from, Observable, Subscription } from 'rxjs';
import { filter, map, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';
import { TabContext } from '../root/root.component';

@Component({
  selector: 'app-ordres-accueil',
  templateUrl: './ordres-accueil.component.html',
  styleUrls: ['./ordres-accueil.component.scss']
})
export class OrdresAccueilComponent implements OnInit, OnDestroy {

  indicators: Indicator[];
  allIndicators: Indicator[];
  loadedIndicators: string[];
  tilesReady: boolean;
  indicatorsSubscription: Subscription;
  indicatorsObservable: Observable<Indicator[]>;
  indicatorsChange = new EventEmitter<string[]>();
  @ViewChild(DxTagBoxComponent, { static: false }) tagBox: DxTagBoxComponent;

  constructor(
    public ordresIndicatorsService: OrdresIndicatorsService,
    public authService: AuthService,
    public utilisateursService: UtilisateursService,
    public currentCompanyService: CurrentCompanyService,
    private datePipe: DatePipe,
    private tabContext: TabContext,
  ) {}

  ngOnInit() {

    this.configureIndicator();

    const selectIndicators = this.indicatorsChange
      .pipe(startWith(this.loadedIndicators));
    this.indicatorsSubscription = selectIndicators
      .pipe(
        tap(_ => this.indicators = []),
        switchMap((ids) => from(ids)),
        map( id => this.ordresIndicatorsService.getIndicatorByName(id)),
        map(indicator => new Indicator({ ...indicator, loading: indicator.withCount})),
        tap(indicator => this.indicators.push(indicator)),
        filter(indicator => indicator.loading),
        mergeMap(async (indicator: Indicator) => {
          if (!indicator.withCount)
            return [indicator.id, ''] as [string, string];

          const flt = indicator.cloneFilter();

          // Mapping
          if (indicator.id === 'PlanningDepart')
            flt.push(
              'and',
              [
                'logistiques.dateDepartPrevueFournisseur',
                '>=',
                new Date(Date.now() - ONE_DAY).toISOString(),
              ],
            );

          if (indicator.id === 'PlanningTransporteurs')
            flt.push(
              'and',
              [
                'logistiques.dateDepartPrevueFournisseur',
                '>=',
                new Date(Date.now() - ONE_DAY).toISOString(),
              ],
              'and',
              [
                'logistiques.dateDepartPrevueFournisseur',
                '<=',
                new Date().toISOString(),
              ],
            );

          const countResponse = await indicator
          .fetchCount(flt)
          .pipe(map( res => Object.values(res.data)[0].toString()))
          .toPromise();
          return [indicator.id, countResponse] as [string, string];
        }),
      )
      .subscribe(([id, value]) => {
        const index = this.indicators
        .findIndex(indicator => id === indicator.id);
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
    return data ? data.parameter + ' ' + data.subParameter : null;
  }

  openTagBox() {
    this.tagBox.instance.open();
  }

  tileNumber(e) {

    this.authService.persist({
      configTuilesOrdres: {
        selection: e.value,
      },
    }).toPromise();

    this.indicatorsChange.emit(e.value);
    if (e.value.length < 1) {
        e.component.option('value', this.allIndicators);
    }

  }

  onTileClick(event) {
    const indicator: Indicator = event.itemData.buttonOptions;
    this.tabContext.openIndicator(indicator.id);
  }

  configureIndicator() {

    const loadIndicators = (config: {selection: string[]}) => {
      this.loadedIndicators = config.selection;
      this.indicators = this.loadedIndicators
      .map( id => this.ordresIndicatorsService.getIndicatorByName(id));
    };

    this.allIndicators = this.ordresIndicatorsService.getIndicators();

    loadIndicators(
      this.authService.currentUser?.configTuilesOrdres
      ?? { selection: this.ordresIndicatorsService.getIndicators().map(({id}) => id) }
    );

  }

}
