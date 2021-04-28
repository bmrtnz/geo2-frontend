import { Component, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { Event as NavigationEvent, NavigationEnd, Router } from '@angular/router';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { OrdresIndicatorsService, Indicator } from 'app/shared/services/ordres-indicators.service';
import { DxTagBoxComponent } from 'devextreme-angular';
import { environment } from 'environments/environment';
import { combineLatest, from, Observable, Subscription } from 'rxjs';
import { filter, map, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-ordres-accueil',
  templateUrl: './ordres-accueil.component.html',
  styleUrls: ['./ordres-accueil.component.scss'],
  providers: [OrdresIndicatorsService]
})
export class OrdresAccueilComponent implements OnDestroy {

  indicators: Indicator[];
  allIndicators: Indicator[];
  indicatorsSubscription: Subscription;
  indicatorsObservable: Observable<Indicator[]>;
  indicatorsChange = new EventEmitter<Indicator[]>();
  @ViewChild(DxTagBoxComponent, { static: false }) tagBox: DxTagBoxComponent;

  constructor(
    ordresIndicatorsService: OrdresIndicatorsService,
    private ordresService: OrdresService,
    public currentCompanyService: CurrentCompanyService,
    private router: Router,
  ) {
    this.allIndicators = ordresIndicatorsService.getIndicators();

    const navigationEndEvent = this.router.events
      .pipe(
        filter((event: NavigationEvent) => event instanceof NavigationEnd),
      );

    const selectIndicators = this.indicatorsChange
      .pipe(startWith(ordresIndicatorsService.getIndicators()));

    this.indicatorsSubscription = combineLatest([navigationEndEvent, selectIndicators])
      .pipe(
        tap(_ => this.indicators = []),
        switchMap(([, indicators]) => from(indicators)),
        map(indicator => ({ ...indicator, loading: !!indicator.filter})),
        tap(indicator => this.indicators.push(indicator)),
        filter(indicator => indicator.loading),
        mergeMap(async indicator => {
          const dataSource = this.ordresService.getDataSource();
          dataSource.filter([
            ['societe.id', '=', this.currentCompanyService.getCompany().id],
            'and',
            indicator.filter,
          ]);
          await dataSource.load();
          const value = indicator.fetchCount ?
            dataSource.totalCount().toString() :
            '?';
          return [indicator.id, value] as [string, string];
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

}
