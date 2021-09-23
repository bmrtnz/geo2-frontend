import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Event as NavigationEvent, NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'app/shared/services';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { UtilisateursService } from 'app/shared/services/api/utilisateurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { Indicator, OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxTagBoxComponent } from 'devextreme-angular';
import { combineLatest, from, Observable, Subscription } from 'rxjs';
import { filter, map, mergeMap, startWith, switchMap, take, tap } from 'rxjs/operators';
import { QueryParams } from '../root/root.component';

@Component({
  selector: 'app-ordres-accueil',
  templateUrl: './ordres-accueil.component.html',
  styleUrls: ['./ordres-accueil.component.scss']
})
export class OrdresAccueilComponent implements OnInit, OnDestroy {

  indicators: Indicator[];
  allIndicators: Indicator[];
  loadedIndicators: any;
  tilesReady: boolean;
  indicatorsSubscription: Subscription;
  indicatorsObservable: Observable<Indicator[]>;
  indicatorsChange = new EventEmitter<string[]>();
  @ViewChild(DxTagBoxComponent, { static: false }) tagBox: DxTagBoxComponent;

  constructor(
    public ordresIndicatorsService: OrdresIndicatorsService,
    private ordresService: OrdresService,
    public authService: AuthService,
    public utilisateursService: UtilisateursService,
    public currentCompanyService: CurrentCompanyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
  ) {
    this.allIndicators = ordresIndicatorsService.getIndicators();

    console.log('start : ',authService.currentUser.configTuilesOrdres)

    if (!authService.currentUser.configTuilesOrdres) {
      authService.currentUser.configTuilesOrdres = this.allIndicators.map
      (({id}) => id);
    }

    this.loadedIndicators = authService.currentUser.configTuilesOrdres;
    console.log('start : ',this.loadedIndicators)
    this.indicators = this.loadedIndicators
    .map( id => this.ordresIndicatorsService.getIndicatorByName(id));

  }

  ngOnInit() {

      const selectIndicators = this.indicatorsChange
        .pipe(startWith(this.ordresIndicatorsService.getIndicators().map(i => i.id)));
      this.indicatorsSubscription = selectIndicators
        .pipe(
          tap(_ => this.indicators = []),
          switchMap((ids) => from(ids)),
          map( id => this.ordresIndicatorsService.getIndicatorByName(id)),
          map(indicator => new Indicator({ ...indicator, loading: indicator.fetchCount})),
          tap(indicator => this.indicators.push(indicator)),
          filter(indicator => indicator.loading),
          mergeMap(async (indicator: Indicator) => {
            if (!indicator.fetchCount)
              return [indicator.id, ''] as [string, string];

            const dataSource = indicator.dataSource;
            const flt = indicator.cloneFilter();

            // Mapping
            if (indicator.id === 'PlanningDepart')
              flt.push(
                'and',
                [
                  'logistiques.dateDepartPrevueFournisseur',
                  '>=',
                  this.datePipe.transform((new Date()).setDate((new Date()).getDate() - 1).valueOf(), 'yyyy-MM-dd'),
                ],
              );
            dataSource.filter(flt);
            await dataSource.load();
            return [indicator.id, dataSource.totalCount().toString()] as [string, string];
          }),
        )
        .subscribe(([id, value]) => {
          const index = this.indicators.findIndex(indicator => id === indicator.id);
          this.indicators[index].number = value;
          this.indicators[index].loading = false;
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

    this.indicatorsChange.emit(e.value);
    // console.log(this.indicators)
    if (e.value.length < 1) {
        e.component.option("value", this.allIndicators);
    }

  }

  onTileClick(event) {
    const indicator: Indicator = event.itemData.buttonOptions;
    this.activatedRoute.queryParamMap
    .pipe(take(1))
    .subscribe(params =>
      this.router.navigate([],
        {
          queryParams: {
            indicateur: [...new Set([...params.getAll('indicateur'), indicator.id])],
          } as QueryParams,
          queryParamsHandling: 'merge',
        }
      )
    );
  }

}
