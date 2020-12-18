import { Component, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { Event as NavigationEvent, NavigationEnd, Router } from '@angular/router';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { FakeOrdresService, Indicator } from 'app/shared/services/ordres-fake.service';
import { DxTagBoxComponent } from 'devextreme-angular';
import { environment } from 'environments/environment';
import { combineLatest, from, Observable, Subscription } from 'rxjs';
import { filter, map, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-ordres-accueil',
  templateUrl: './ordres-accueil.component.html',
  styleUrls: ['./ordres-accueil.component.scss'],
  providers: [FakeOrdresService]
})
export class OrdresAccueilComponent implements OnDestroy {

  indicators: Indicator[];
  allIndicators: Indicator[];
  indicatorsSubscription: Subscription;
  indicatorsObservable: Observable<Indicator[]>;
  indicatorsChange = new EventEmitter<Indicator[]>();
  @ViewChild(DxTagBoxComponent, { static: false }) tagBox: DxTagBoxComponent;

  constructor(
    fakeOrdresService: FakeOrdresService,
    private ordresService: OrdresService,
    private router: Router,
  ) {
    this.allIndicators = fakeOrdresService.getIndicators();

    const navigationEndEvent = this.router.events
      .pipe(
        filter((event: NavigationEvent) => event instanceof NavigationEnd),
      );

    const selectIndicators = this.indicatorsChange
      .pipe(startWith(fakeOrdresService.getIndicators()));

    this.indicatorsSubscription = combineLatest([navigationEndEvent, selectIndicators])
      .pipe(
        tap(_ => this.indicators = []),
        switchMap(([, indicators]) => from(indicators)),
        map(indicator => ({ ...indicator, loading: !!indicator.filter })),
        tap(indicator => this.indicators.push(indicator)),
        filter(indicator => indicator.loading),
        mergeMap(async indicator => {
          const dataSource = this.ordresService.getDataSource();
          dataSource.filter([
            ['societe.id', '=', environment.societe.id],
            'and',
            indicator.filter,
          ]);
          await dataSource.load();
          const value = indicator.number ?
            dataSource.totalCount().toString() :
            '?';
          return [indicator.id, value] as [number, string];
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
