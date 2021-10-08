import { Component, EventEmitter, Injectable, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from '@angular/router';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxTabPanelComponent } from 'devextreme-angular';
import { on } from 'devextreme/events';
import { dxTabPanelItem } from 'devextreme/ui/tab_panel';
import { concat, ConnectableObservable, defer, EMPTY, iif, Observable, of } from 'rxjs';
import { filter, first, last, map, publishLast, share, startWith, switchMap, switchMapTo, take, tap } from 'rxjs/operators';

const TAB_HOME_ID = 'home';
const TAB_LOAD_ID = 'loading';
const PREVIOUS_STATE = 'previous_tab_id';
export const TAB_ORDRE_CREATE_ID = 'create';
export enum TabType { Indicator = 'indicateur', Ordre = 'ordre' }
export enum RouteParam { TabID = 'tabid' }
enum Position {
  Front,
  Start,
  End,
  Back,
}
export type TabPanelItem = dxTabPanelItem & {
  id: string,
  icon?: string,
  details?: string,
  position: number,
  component?,
};

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class RootComponent implements OnInit {

  public tabPanelReady = new EventEmitter<any>();
  public activeStateEnabled = false;

  public items: TabPanelItem[];
  private sharedFillInitialItems = this.fillInitialItems()
  .pipe(publishLast()) as ConnectableObservable<TabPanelItem[]>;
  @ViewChild(DxTabPanelComponent, {static: true}) tabPanel: DxTabPanelComponent;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public ordresIndicatorsService: OrdresIndicatorsService,
    private tabContext: TabContext,
  ) {
    this.tabContext.registerComponent(this);
    this.handleRouting();
  }

  ngOnInit() {

    this.sharedFillInitialItems.connect();
    this.sharedFillInitialItems.subscribe();

  }

  onTabTitleClick(event: {itemData: Partial<TabPanelItem>}) {
    const previous = this.route.snapshot.paramMap.get(RouteParam.TabID);
    this.router.navigate(['ordres', event.itemData.id], {
      queryParamsHandling: 'merge',
      state: { [PREVIOUS_STATE]: previous },
    });
  }

  onTabTitleRendered(event) {
    const replaceEvent = e => {
      const id = e.currentTarget.querySelector('[data-item-id]').dataset.itemId;
      this.onTabTitleClick({itemData: {id}});
      e.stopPropagation();
    };
    on(event.itemElement, 'dxpointerdown', e => e.stopPropagation());
    on(event.itemElement, 'dxclick', replaceEvent);
  }

  onTabCloseClick(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.selectTab(TAB_LOAD_ID);
    const pullID = (event.target as HTMLElement).parentElement.dataset.itemId;
    const indicateur = this.route.snapshot.queryParamMap
    .getAll(TabType.Indicator)
    .filter(param => param !== pullID);
    const ordre = this.route.snapshot.queryParamMap
    .getAll(TabType.Ordre)
    .filter(param => param !== pullID);

    const selectedID = this.route.snapshot.paramMap
    .get(RouteParam.TabID);
    const navID = pullID === selectedID
      ? history.state[PREVIOUS_STATE] ?? TAB_HOME_ID
      : selectedID;

    this.router.navigate(['ordres', navID], {
      queryParams: {indicateur, ordre},
    });
  }

  handleRouting() {
    this.router.events
    .pipe(
      filter<NavigationEnd>( event => event instanceof NavigationEnd),
      filter( event => event.url.startsWith('/ordres')),
      switchMapTo(this.sharedFillInitialItems),
      tap( _ => this.selectTab(TAB_LOAD_ID)),
      switchMapTo(this.route.queryParamMap.pipe(first())),
      switchMap( queries => defer(() => this.handleQueries(queries))),
      switchMapTo(this.route.paramMap.pipe(first())),
      switchMap( params => of(this.handleParams(params))),
    )
    .subscribe( selectID => {
      this.selectTab(selectID);
    });
  }

  public isStaticItem(item: TabPanelItem) {
    return [Position.Front, Position.Back].includes(item.position);
  }

  private fillInitialItems() {
    const items: () => Promise<TabPanelItem[]> = async () =>
      this.items = [
        {
          id: TAB_LOAD_ID,
          component: LoadingTabComponent,
          position: Position.Front,
        },
        {
          id: TAB_HOME_ID,
          icon: 'material-icons home',
          component: (await import('../accueil/ordres-accueil.component')).OrdresAccueilComponent,
          position: Position.Front,
        },
        {
          id: TAB_ORDRE_CREATE_ID,
          title: 'nouvel',
          details: 'ordre',
          icon: 'material-icons note_add',
          component: (await import('../form/form.component')).FormComponent,
          position: Position.Back,
        },
      ];
    return concat(defer(items), this.tabPanelReady.pipe(take(1))).pipe(last());
  }

  private handleQueries(queries: ParamMap) {
    const mutations = [];
    const pushMutation = (cbk: () => Observable<any>) => mutations.push(defer(cbk));

    this.items
    .filter( item => ![Position.Front, Position.Back].includes(item.position))
    .filter( item => ![
        ...queries.getAll(TabType.Indicator),
        ...queries.getAll(TabType.Ordre),
      ].find(param => item.id === param))
    .forEach( item => {
      pushMutation(() => {
        this.pullTab(item.id);
        return this.tabPanelReady.pipe(take(1));
      });
    });

    ([
      ...queries.getAll(TabType.Indicator)
      .map(param => [param, TabType.Indicator]),
      ...queries.getAll(TabType.Ordre)
      .map(param => [param, TabType.Ordre]),
    ] as [string, TabType][])
    .filter(([param]) => !this.items.find( item => item.id === param))
    .forEach(([id, tabType]) => {
      pushMutation(() => {
        this.pushTab(tabType, {
          id,
          position: tabType === TabType.Indicator ?
            Position.Start : Position.End,
        });
        return this.tabPanelReady.pipe(take(1));
      });
    });

    return iif(() => !!mutations.length , concat(...mutations).pipe(last()), EMPTY.pipe(startWith(0)));
  }

  private handleParams(params: ParamMap) {
    const paramID = params.get(RouteParam.TabID);
    return !this.items.find( item => item.id === paramID)
      ? TAB_HOME_ID
      : paramID;
  }

  private async pushTab(type: TabType, data: TabPanelItem): Promise<number> {
    if (type === TabType.Indicator) {
      const indicator = this.ordresIndicatorsService
      .getIndicatorByName(data.id);
      data.component = (await indicator.component).default;
      if (indicator.fetchCount) data.badge = indicator.number || '?';
      data.icon = indicator.indicatorIcon;
      data.title = indicator.parameter;
      data.details = indicator.subParameter;
    } else if (type === TabType.Ordre) {
      data.component = (await import('../form/form.component')).FormComponent;
      data.icon = 'material-icons description';
      data.title = 'Ordre';
      data.details = `N° ${data.id}`; // data.id is ordre.numero !
    }
    this.items.push(data);
    this.items.sort((a, b) => a.position - b.position);
    return this.items.indexOf(data);
  }

  private pullTab(id: string) {
    this.items = this.items.filter( item => item.id !== id);
  }

  private getTabIndex(id: string) {
    return this.items.findIndex( item => item.id === id);
  }

  private selectTab(id: string) {
    this.tabPanel.selectedIndex = this.getTabIndex(id);
  }

}

@Component({
  selector: 'app-loading-tab',
  template: `
  <div id="tab-load" style="height: 70vh;"></div>
  <dx-load-panel
    [position]="{ of: '#tab-load' }"
    [container]="'#tab-load'"
    [visible]="true"
    [showIndicator]="true"
  ></dx-load-panel>
  `,
})
export class LoadingTabComponent {}

@Injectable()
export class TabContext {

  private componentRef: RootComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public registerComponent(instance: RootComponent) {
    this.componentRef = instance;
  }

  /**
   * Return tab panel selected item
   */
  public getSelectedItem() {
    return this.componentRef.route.paramMap
    .pipe(
      share(),
      map( params => {
        const selected = params.get(RouteParam.TabID);
        return this.componentRef.items.find( item => item.id === selected);
      }),
    );
  }

  /**
   * Push and select ordre in tab panel by routing
   * @param numero Ordre numero
   */
  public openOrdre(numero: string) {
    return this.with(TabType.Ordre, numero);
  }

  /**
   * Push and select indicator in tab panel by routing
   * @param id Indicator id
   */
  public openIndicator(id: string) {
    return this.with(TabType.Indicator, id);
  }

  private with(tabType: TabType, id: string) {
    const previous = this.componentRef.route.snapshot.paramMap.get(RouteParam.TabID);
    this.route.queryParamMap
    .pipe(
      first(),
      switchMap( params => this.router
        .navigate(['ordres', id],
        {
          queryParams: {
            [tabType]: [...new Set([...params.getAll(tabType), id])],
          },
          queryParamsHandling: 'merge',
          state: { [PREVIOUS_STATE]: previous },
        })
      )
    ).subscribe();
  }

}
