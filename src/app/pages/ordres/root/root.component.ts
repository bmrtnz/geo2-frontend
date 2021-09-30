import { Component, EventEmitter, Injectable, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxTabPanelComponent } from 'devextreme-angular';
import { dxTabPanelItem } from 'devextreme/ui/tab_panel';
import { combineLatest } from 'rxjs';
import { concatMap, map, share, take } from 'rxjs/operators';

const TAB_HOME_ID = 'home';
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

  @ViewChild(DxTabPanelComponent, {static: true}) tabPanel: DxTabPanelComponent;

  public items: TabPanelItem[];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public ordresIndicatorsService: OrdresIndicatorsService,
    private tabContext: TabContext,
  ) {
    this.tabContext.registerComponent(this);
  }

  async ngOnInit() {

    this.items = await this.getInitialItems();

    this.route.queryParamMap
    .subscribe(res => {

      ([
        ...res.getAll(TabType.Indicator)
        .map(param => [param, TabType.Indicator]),
        ...res.getAll(TabType.Ordre)
        .map(param => [param, TabType.Ordre]),
      ] as [string, TabType][])
      .filter(([param]) => !this.items.find( item => item.id === param))
      .forEach(([id, tabType]) => {
        this.pushTab(tabType, {
          id,
          position: tabType === TabType.Indicator ?
            Position.Start : Position.End,
        });
      });

      this.items
      .filter( item => ![Position.Front, Position.Back].includes(item.position))
      .filter( item => ![
          ...res.getAll(TabType.Indicator),
          ...res.getAll(TabType.Ordre),
        ].find(param => item.id === param))
      .forEach( item => {
        this.pullTab(item.id);
      });

    });

    combineLatest([
      this.tabPanelReady.asObservable(),
      this.route.paramMap,
    ])
    .pipe(map(([, params]) => params))
    .subscribe(res => this.selectTab(res.get(RouteParam.TabID)));

  }

  onTabTitleClick(event: {itemData: TabPanelItem}) {
    this.router.navigate(['ordres', event.itemData.id], {
      queryParamsHandling: 'preserve',
    });
  }

  onTabCloseClick(event: MouseEvent) {
    const pullID = (event.target as HTMLElement).parentElement.dataset.itemId;
    const indicateur = this.route.snapshot.queryParamMap
    .getAll(TabType.Indicator)
    .filter(param => param !== pullID);
    const ordre = this.route.snapshot.queryParamMap
    .getAll(TabType.Ordre)
    .filter(param => param !== pullID);

    const selectedID = this.route.snapshot.paramMap
    .get(RouteParam.TabID);
    const navID = pullID === selectedID ?
      TAB_HOME_ID : selectedID;

    this.router.navigate(['ordres', navID], {
      queryParams: {indicateur, ordre},
    });
  }

  public isStaticItem(item: TabPanelItem) {
    return [Position.Front, Position.Back].includes(item.position);
  }

  private async getInitialItems() {
    return [
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
      take(1),
      share(),
      map( params => {
        const selected = params.get(RouteParam.TabID);
        return this.componentRef.items.find( item => item.id === selected);
      })
    );
  }

  /**
   * Push and select ordre in tab panel by routing
   * @param numero Ordre numero
   */
  public openOrdre(numero: string) {
    return this.openTab(TabType.Ordre, numero);
  }

  /**
   * Push and select indicator in tab panel by routing
   * @param numero Indicator id
   */
  public openIndicator(id: string) {
    return this.openTab(TabType.Indicator, id);
  }

  private openTab(tabType: TabType, id: string) {
    this.route.queryParamMap
    .pipe(
      share(),
      concatMap( params => this.router
        .navigate(['ordres', id],
        {
          queryParams: {
            [tabType]: [...new Set([...params.getAll(tabType), id])],
          },
          queryParamsHandling: 'merge',
        })
      )
    ).subscribe();
  }

}
