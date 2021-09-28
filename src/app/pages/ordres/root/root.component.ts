import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxTabPanelComponent } from 'devextreme-angular';
import { dxTabPanelItem } from 'devextreme/ui/tab_panel';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrdresAccueilComponent } from '../accueil/ordres-accueil.component';

export enum QueryParam { Indicateur = 'indicateur', Ordre = 'ordre' }
enum TabType { Indicator, Ordre }
enum RouteParam { TabID = 'tabid' }
type TabPanelItem = dxTabPanelItem & { id: string, icon?: string, component? };

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class RootComponent implements OnInit {

  readonly HOME_TAB_ID = 'home';

  public tabPanelReady = new EventEmitter<any>();
  public activeStateEnabled = false;

  @ViewChild(DxTabPanelComponent, {static: true}) tabPanel: DxTabPanelComponent;
  @ViewChild(OrdresAccueilComponent) ordresAccueilComponent: OrdresAccueilComponent;

  public items: TabPanelItem[] = [
    {
      id: this.HOME_TAB_ID,
      icon: 'material-icons home',
      component: OrdresAccueilComponent,
    },
  ];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public ordresIndicatorsService: OrdresIndicatorsService,
  ) {}

  ngOnInit() {

    this.route.queryParamMap
    .subscribe(res => {

      res.getAll(QueryParam.Indicateur)
      .filter( indicator => !this.items.find( item => item.id === indicator))
      .forEach( id => this.pushTab(TabType.Indicator, { id }));

      this.items
      .filter( item => item.id !== this.HOME_TAB_ID)
      .filter( item => !res.getAll(QueryParam.Indicateur)
        .find(indicator => item.id === indicator))
      .forEach( item => this.pullTab(item.id));

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
    .getAll(QueryParam.Indicateur)
    .filter(param => param !== pullID);

    const selectedID = this.route.snapshot.paramMap
    .get(RouteParam.TabID);
    const navID = pullID === selectedID ?
      this.HOME_TAB_ID : selectedID;
    
    this.router.navigate(['ordres', navID], {
      queryParams: {indicateur},
    });
  }

  private async pushTab(type: TabType, data: TabPanelItem): Promise<number> {
    if (type === TabType.Indicator) {
      const indicator = this.ordresIndicatorsService
      .getIndicatorByName(data.id);
      data.component = (await indicator.component).default;
      if (indicator.fetchCount) data.badge = indicator.number || '?';
      data.icon = indicator.indicatorIcon;
      data.title = `${indicator.parameter} ${indicator.subParameter}`;
    }
    this.items.push(data);
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
