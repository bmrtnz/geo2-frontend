import { Component, EventEmitter, HostListener, Injectable, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, convertToParamMap, NavigationStart, ParamMap, Router } from "@angular/router";
import { LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { AuthService } from "app/shared/services/auth.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { OrdresIndicatorsService } from "app/shared/services/ordres-indicators.service";
import { DxTabPanelComponent } from "devextreme-angular";
import { on } from "devextreme/events";
import notify from "devextreme/ui/notify";
import { dxTabPanelItem } from "devextreme/ui/tab_panel";
import { concat, ConnectableObservable, defer, EMPTY, iif, Observable, of, Subject } from "rxjs";
import {
  concatMapTo,
  debounceTime,
  filter,
  first,
  last,
  map,
  publish,
  refCount,
  share,
  startWith,
  switchMap,
  switchMapTo,
  take,
  takeUntil,
  tap
} from "rxjs/operators";
import { FormComponent } from "../form/form.component";

const TAB_HOME_ID = "home";
const TAB_LOAD_ID = "loading";
const PREVIOUS_STATE = "previous_tab_id";
export const TAB_ORDRE_CREATE_ID = "create";
export enum TabType { Indicator = "indicateur", Ordre = "ordre" }
export enum RouteParam { TabID = "tabid" }
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
  component?: FormComponent | any,
  type?: string
};

export type TabChangeData = { status: "in" | "out", item: Partial<TabPanelItem> };

@Component({
  selector: "app-root",
  templateUrl: "./root.component.html",
  styleUrls: ["./root.component.scss"],
})
export class RootComponent implements OnInit, OnDestroy {

  private destroy = new Subject<boolean>();

  public tabChangeEvent = new EventEmitter<TabChangeData>();
  public tabPanelInitialized = new EventEmitter<any>();
  public tabPanelReady = new EventEmitter<any>();
  public activeStateEnabled = false;
  public typeTab = TabType;

  public items: TabPanelItem[] = [];
  @ViewChild(DxTabPanelComponent, { static: true }) tabPanel: DxTabPanelComponent;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public ordresIndicatorsService: OrdresIndicatorsService,
    private currentCompanyService: CurrentCompanyService,
    private ordresService: OrdresService,
    private functionsService: FunctionsService,
    private dateManagementService: DateManagementService,
    private authService: AuthService,
    private tabContext: TabContext,
  ) { }

  ngOnInit() {

    this.tabContext.registerComponent(this);

    this.tabPanelInitialized
      .pipe(
        concatMapTo(this.fillInitialItems()),
        concatMapTo(this.handleRouting()),
        concatMapTo(this.router.events),
        filter<NavigationStart>(event => event instanceof NavigationStart),
        debounceTime(10),
        switchMapTo(this.handleRouting()),
        takeUntil(this.destroy),
      )
      .subscribe();
    this.surveyBlockage();
    window.sessionStorage.removeItem("idOrdre");

  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }

  @HostListener("window:unload")
  windowUnload() {
    window.sessionStorage.removeItem("surveyRunning");
  }

  surveyBlockage() {
    if (window.sessionStorage.getItem("surveyRunning")) return;
    window.sessionStorage.setItem("surveyRunning", "true");
    setInterval(() => {
      const id = window.sessionStorage.getItem("idOrdre");
      if (id) {
        this.functionsService.fInitBlocageOrdre(id, this.authService.currentUser.nomUtilisateur)
          .valueChanges
          .subscribe(res => {
            window.sessionStorage.setItem("blockage", res.data.fInitBlocageOrdre.data.bloquer ? "true" : "false");
          });
      }
    }, 10000);

  }

  onTabTitleClick(event: { itemData: Partial<TabPanelItem> }) {
    const previous = this.route.snapshot.paramMap.get(RouteParam.TabID);
    const numeroOrdre = isNaN(parseInt(event.itemData.id, 10)) ? null : event.itemData.id;
    const idOrdre = window.sessionStorage.getItem("numeroOrdre" + numeroOrdre);
    if (numeroOrdre && idOrdre) {
      window.sessionStorage.setItem("idOrdre", idOrdre);
    } else {
      window.sessionStorage.removeItem("idOrdre");
    }
    this.router.navigate(["pages/ordres", event.itemData.id], {
      queryParamsHandling: "merge",
      state: { [PREVIOUS_STATE]: previous },
    });
  }

  onTabTitleRendered(event) {
    const replaceEvent = e => {
      const id = e.currentTarget.querySelector("[data-item-id]").dataset.itemId;
      this.onTabTitleClick({ itemData: { id } });
      e.stopPropagation();
    };
    on(event.itemElement, "dxpointerdown", e => e.stopPropagation());
    on(event.itemElement, "dxclick", replaceEvent);
    on(event.itemElement, "dxhoverstart", () => this.setTabTooltip(event));
  }

  setTabTooltip(item) {
    const data = item.itemData;
    // Display client code in tab title
    if (!item.itemElement.title && data.type === TabType.Ordre) {
      this.ordresService.getOneByNumeroAndSocieteAndCampagne(
        data.id.split("-")[1],
        this.currentCompanyService.getCompany().id,
        data.id.split("-")[0],
        ["id", "client.code", "entrepot.code", "dateDepartPrevue"]
      ).subscribe(res => {
        const result = res.data.ordreByNumeroAndSocieteAndCampagne;
        if (!result) return;
        let dateDep = result.dateDepartPrevue ?? "-";
        if (result.dateDepartPrevue !== "-")
          dateDep = this.dateManagementService.friendlyDate(result.dateDepartPrevue, true);
        item.itemElement.title = `Client : ${result.client.code}\r\n`;
        item.itemElement.title += `Entrepôt : ${result.entrepot.code}\r\n`;
        item.itemElement.title += `Départ : ${dateDep}`;
      });
    }
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
      ? history?.state[PREVIOUS_STATE] ?? TAB_HOME_ID
      : selectedID;

    this.router.navigate(["pages/ordres", TAB_LOAD_ID])
      .then(_ => this.router.navigate(["pages/ordres", navID], {
        queryParams: { indicateur, ordre },
      }));
  }

  private handleRouting() {
    return of(this.selectTab(TAB_LOAD_ID))
      .pipe(
        switchMapTo(this.route.queryParamMap.pipe(first())),
        switchMap(queries => defer(() => this.handleQueries(queries))),
        switchMapTo(this.route.paramMap),
        map((p: ParamMap) => p),
        first(),
        filter(currentParams => {
          const previousID = this.getTabItem(this.getPreviousParamMap().get(RouteParam.TabID));
          const currentID = this.getTabItem(currentParams.get(RouteParam.TabID));
          return ![currentID, TAB_LOAD_ID].includes(previousID);
        }),
        tap(currentParams => {
          this.selectTab(this.handleParams(currentParams));
          const item = this.getTabItem(this.getPreviousParamMap().get(RouteParam.TabID));
          this.tabChangeEvent.emit({ status: "out", item });
        }),
        switchMap(currentParams => {
          const item = this.getTabItem(currentParams.get(RouteParam.TabID));
          this.tabChangeEvent.emit({ status: "in", item });
          return of("done");
        }),
      );
  }

  public isStaticItem(item: TabPanelItem) {
    return [Position.Front, Position.Back].includes(item.position);
  }

  private fillInitialItems() {
    const getItems: () => Promise<TabPanelItem[]> = async () =>
      [
        {
          id: TAB_LOAD_ID,
          component: LoadingTabComponent,
          position: Position.Front,
        },
        {
          id: TAB_HOME_ID,
          icon: "material-icons home",
          component: (await import("../accueil/ordres-accueil.component")).OrdresAccueilComponent,
          position: Position.Front,
        },
        {
          id: TAB_ORDRE_CREATE_ID,
          title: "nouvel",
          details: "ordre",
          icon: "material-icons note_add",
          component: (await import("../nouvel-ordre/nouvel-ordre.component")).NouvelOrdreComponent,
          position: Position.Back,
        },
      ];
    return concat(
      defer(getItems).pipe(tap(items => this.items = items)),
      this.tabPanelReady.pipe(first())
    ).pipe(first());
  }

  private handleQueries(queries: ParamMap) {
    const mutations = [];
    const pushMutation = (cbk: () => Observable<any>) => mutations.push(defer(cbk));

    this.items
      .filter(item => ![Position.Front, Position.Back].includes(item.position))
      .filter(item => ![
        ...queries.getAll(TabType.Indicator),
        ...queries.getAll(TabType.Ordre),
      ].find(param => item.id === param))
      .forEach(item => {
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
      .filter(([param]) => !this.items.find(item => item.id === param))
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

    return iif(() => !!mutations.length, concat(...mutations).pipe(last()), EMPTY.pipe(startWith(0)));
  }

  private handleParams(params: ParamMap) {
    const paramID = params.get(RouteParam.TabID);
    return !this.items.find(item => item.id === paramID)
      ? TAB_HOME_ID
      : paramID;
  }

  private async pushTab(type: TabType, data: TabPanelItem): Promise<number> {
    if (type === TabType.Indicator) {
      const indicator = this.ordresIndicatorsService
        .getIndicatorByName(data.id);
      data.component = (await indicator.component).default;
      // TODO Badge indicator count
      // if (indicator.withCount) data.badge = indicator.number || '?';
      data.icon = indicator.indicatorIcon;
      data.title = indicator.parameter;
      data.details = indicator.subParameter;
    } else if (type === TabType.Ordre) {
      data.component = (await import("../form/form.component")).FormComponent;
      data.icon = "material-icons description";
      data.title = "Ordre";
      data.details = `${data.id}`; // data.id is ordre.campagne.id-ordre.numero !
      data.type = TabType.Ordre;
    }
    this.items.push(data);
    this.items.sort((a, b) => a.position - b.position);
    return this.items.indexOf(data);
  }

  private pullTab(id: string) {
    this.items = this.items.filter(item => item.id !== id);
  }

  private getTabIndex(id: string) {
    return this.items.findIndex(item => item.id === id);
  }

  private getTabItem(id: string) {
    return this.items.find(item => item.id === id);
  }

  private selectTab(id: string) {
    this.tabPanel.selectedIndex = this.getTabIndex(id);
  }

  private getPreviousParamMap() {
    return convertToParamMap({
      [RouteParam.TabID]: history?.state[PREVIOUS_STATE] ?? TAB_LOAD_ID,
    });
  }

}

@Component({
  selector: "app-loading-tab",
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
export class LoadingTabComponent { }

@Injectable()
export class TabContext {

  private componentRef: RootComponent;
  public onTabChange: ConnectableObservable<TabChangeData>;

  constructor(
    private route: ActivatedRoute,
    private localization: LocalizationService,
    private router: Router,
    private currentCompanyService: CurrentCompanyService,
  ) { }

  public registerComponent(instance: RootComponent) {
    this.componentRef = instance;
    this.onTabChange = this.componentRef.tabChangeEvent
      .pipe(
        publish(),
        refCount(),
      ) as ConnectableObservable<TabChangeData>;
  }

  /**
   * Return tab panel selected item
   */
  public getSelectedItem() {
    return this.componentRef.route.paramMap
      .pipe(
        share(),
        map(params => {
          const selected = params.get(RouteParam.TabID);
          return this.componentRef.items.find(item => item.id === selected);
        }),
      );
  }

  /**
   * Push and select ordre in tab panel by routing
   * @param numero Ordre numero
   * @param campagne Campagne id
   * @param toastInfo Shows toast by default, false it not desired
   */
  public openOrdre(numero: string, campagne?: string, toastInfo?: boolean) {
    if (!numero) return;
    toastInfo = (toastInfo === undefined) ? true : toastInfo;
    if (toastInfo) notify(this.localization.localize("ouverture-ordre").replace("&NO", numero), "info", 1500);
    const campagneID = campagne ?? this.currentCompanyService.getCompany().campagne.id;
    return this.mutate("OPEN", TabType.Ordre, `${campagneID}-${numero}`);
  }

  /**
   * Push and select ordre in tab panel by routing
   * @param numero Ordre numero
   * @param campagne Campagne id
   */
  public closeOrdre(numero: string, campagne?: string) {
    const campagneID = campagne ?? this.currentCompanyService.getCompany().campagne.id;
    return this.mutate("CLOSE", TabType.Ordre, `${campagneID}-${numero}`);
  }

  /**
   * Push and select indicator in tab panel by routing
   * @param id Indicator id
   */
  public openIndicator(id: string) {
    return this.mutate("OPEN", TabType.Indicator, id);
  }

  private mutate(action: "OPEN" | "CLOSE", tabType: TabType, id: string) {
    const previous = this.componentRef.route.snapshot.paramMap.get(RouteParam.TabID);
    const alter = (params: ParamMap) => action === "OPEN"
      ? new Set([...params.getAll(tabType), id])
      : new Set([...params.getAll(tabType)].filter(v => v !== id));

    this.route.queryParamMap
      .pipe(
        first(),
        switchMap(params => this.router
          .navigate(["pages/ordres", id],
            {
              queryParams: {
                [tabType]: [...alter(params)],
              },
              queryParamsHandling: "merge",
              state: { [PREVIOUS_STATE]: previous },
            })
        )
      ).subscribe();
  }

  public parseTabID(tabID: string): [string, string?] {
    let campagneID;
    let numero = tabID;
    if (tabID.match(/\d+-\w+/))
      [campagneID, numero] = tabID.split("-");
    return [numero, campagneID];
  }

}
