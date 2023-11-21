import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Injectable,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  ActivatedRoute,
  convertToParamMap,
  NavigationStart,
  ParamMap,
  Router,
} from "@angular/router";
import { LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { AuthService } from "app/shared/services/auth.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { OrdresIndicatorsService } from "app/shared/services/ordres-indicators.service";
import { DxLoadPanelComponent, DxTabPanelComponent } from "devextreme-angular";
import { on } from "devextreme/events";
import { Statut } from "app/shared/models/ordre.model";
import notify from "devextreme/ui/notify";
import { dxTabPanelItem } from "devextreme/ui/tab_panel";
import {
  concat,
  ConnectableObservable,
  defer,
  EMPTY,
  iif,
  Observable,
  of,
  Subject,
} from "rxjs";
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
  tap,
} from "rxjs/operators";
import { FormComponent } from "../form/form.component";
import { GridsService } from "../grids.service";

let self;

const TAB_HOME_ID = "home";
const TAB_LOAD_ID = "loading";
const PREVIOUS_STATE = "previous_tab_id";
const TAB_CLOSE_ALL_ORDRES = "close_all_orders";
export const TAB_ORDRE_CREATE_ID = "create";
export enum TabType {
  Indicator = "indicateur",
  Ordre = "ordre",
}
export enum RouteParam {
  TabID = "tabid",
}
enum Position {
  Front,
  Start,
  End,
  Back,
}
export type TabPanelItem = dxTabPanelItem & {
  id: string;
  icon?: string;
  title?: string;
  details?: string;
  position: number;
  component?: FormComponent | any;
  status?: boolean;
  unsaved?: boolean,
  type?: string;
};

export type TabChangeData = {
  status: "in" | "out";
  item: Partial<TabPanelItem>;
};

@Injectable()
export class TabContext {
  private componentRef: RootComponent;
  public onTabChange: ConnectableObservable<TabChangeData>;

  constructor(
    private route: ActivatedRoute,
    private localization: LocalizationService,
    private router: Router,
    private currentCompanyService: CurrentCompanyService
  ) {
    self = this;
  }

  public registerComponent(instance: RootComponent) {
    this.componentRef = instance;
    this.onTabChange = this.componentRef.tabChangeEvent.pipe(
      publish(),
      refCount()
    ) as ConnectableObservable<TabChangeData>;
  }

  /**
   * Return ALL tab panel items
   */
  public getAllItems() {
    return this.componentRef.route.paramMap.pipe(
      share(),
      map((params) => {
        const selected = params.get(RouteParam.TabID);
        return this.componentRef.items;
      })
    );
  }

  /**
   * Return tab panel selected item
   */
  public getSelectedItem() {
    return this.componentRef.route.paramMap.pipe(
      share(),
      map((params) => {
        const selected = params.get(RouteParam.TabID);
        return this.componentRef.items.find((item) => item.id === selected);
      })
    );
  }

  /**
   * Return All tab panel unselected items
   */
  public getNotSelectedItems() {
    return this.componentRef.route.paramMap.pipe(
      share(),
      map((params) => {
        const selected = params.get(RouteParam.TabID);
        return this.componentRef.items.filter((item) => item.id !== selected);
      })
    );
  }

  /**
   * Push and select ordre in tab panel by routing
   * @param numero Ordre numero
   * @param campagne Campagne id
   * @param toastInfo Shows toast by default, false it not desired
   */
  public openOrdre(numero: string, campagne?: string, toastInfo?: boolean, specialText?: string) {
    if (!numero) return;
    this.openIndicator("loading"); // KEEP THIS & the timeout !!! Possible previous order display error See #22195
    setTimeout(() => {
      toastInfo = toastInfo === undefined ? true : toastInfo;
      if (toastInfo)
        notify(
          (specialText ?? this.localization.localize("ouverture-ordre")).replace("&NO", numero),
          "info",
          1500
        );
      const campagneID =
        campagne ?? this.currentCompanyService.getCompany().campagne.id;
      return this.mutate("OPEN", TabType.Ordre, `${campagneID}-${numero}`);
    }, 100);
  }

  /**
   * Push and select ordre in tab panel by routing
   * @param numero Ordre numero
   * @param campagne Campagne id
   */
  public closeOrdre(numero: string, campagne?: string) {
    const campagneID =
      campagne ?? this.currentCompanyService.getCompany().campagne.id;
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
    let previous = this.componentRef.route.snapshot.paramMap.get(
      RouteParam.TabID
    );
    const alter = (params: ParamMap) =>
      action === "OPEN"
        ? new Set([...params.getAll(tabType), id])
        : new Set([...params.getAll(tabType)].filter((v) => v !== id));

    if (action === "CLOSE") previous = TAB_HOME_ID;

    this.route.queryParamMap
      .pipe(
        first(),
        switchMap((params) =>
          this.router.navigate(["pages/ordres", id], {
            queryParams: {
              [tabType]: [...alter(params)],
            },
            queryParamsHandling: "merge",
            state: { [PREVIOUS_STATE]: (previous !== TAB_LOAD_ID) ? previous : TAB_HOME_ID },
          })
        )
      )
      .subscribe();
  }

  public parseTabID(tabID: string): [string, string?] {
    let campagneID;
    let numero = tabID;
    if (tabID.match(/\d+-\w+/)) [campagneID, numero] = tabID.split("-");
    return [numero, campagneID];
  }
}

@Component({
  selector: "app-root",
  templateUrl: "./root.component.html",
  styleUrls: ["./root.component.scss"],
})
export class RootComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy = new Subject<boolean>();

  public tabChangeEvent = new EventEmitter<TabChangeData>();
  public tabPanelInitialized = new EventEmitter<any>();
  public tabPanelReady = new EventEmitter<any>();
  private fastPrevButton: HTMLElement;
  private fastNextButton: HTMLElement;
  public activeStateEnabled = false;
  public typeTab = TabType;
  public tabsUnpined: boolean;
  public TAB_CLOSE_ALL_ORDRES = TAB_CLOSE_ALL_ORDRES;
  public moreThanOneOpenOrder: number;
  public atLeastOneOpenIndicator: number;
  private gridUnsavedInterval: any;

  public items: TabPanelItem[] = [];
  @ViewChild(DxTabPanelComponent, { static: true }) tabPanel: DxTabPanelComponent;
  @ViewChild("tabLoadPanel") tabLoadPanel: DxLoadPanelComponent;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public ordresIndicatorsService: OrdresIndicatorsService,
    private currentCompanyService: CurrentCompanyService,
    private localizationService: LocalizationService,
    private ordresService: OrdresService,
    private functionsService: FunctionsService,
    private gridsService: GridsService,
    private dateManagementService: DateManagementService,
    private authService: AuthService,
    private tabContext: TabContext
  ) {
    this.moreThanOneOpenOrder = 0;
    this.atLeastOneOpenIndicator = 0;
  }

  ngOnInit() {
    this.tabContext.registerComponent(this);

    const openOrder = window.sessionStorage.getItem("openOrder");
    if (openOrder) {
      this.tabContext.openOrdre(
        openOrder.split("|")[0],
        openOrder.split("|")[1]
      );
      window.sessionStorage.removeItem("openOrder");
    }

    this.tabPanelInitialized
      .pipe(
        concatMapTo(this.fillInitialItems()),
        concatMapTo(this.handleRouting()),
        concatMapTo(this.router.events),
        filter<NavigationStart>((event) => event instanceof NavigationStart),
        debounceTime(10),
        switchMapTo(this.handleRouting()),
        takeUntil(this.destroy),
      )
      .subscribe();
    this.surveyBlockage();
    this.gridUnsavedControl(); // Unsaved red dot on tabs
    window.sessionStorage.removeItem("idOrdre");
    setInterval(() => {
      const leftArrow = this.tabPanel?.instance.$element()[0].querySelector(".dx-widget.dx-tabs-nav-button-left") as HTMLElement;
      this.fastPrevButton.style.visibility = (leftArrow && !leftArrow.classList.contains("dx-state-disabled")) ? "visible" : "hidden";
      const rightArrow = this.tabPanel?.instance.$element()[0].querySelector(".dx-widget.dx-tabs-nav-button-right") as HTMLElement;
      this.fastNextButton.style.visibility = (rightArrow && !rightArrow.classList.contains("dx-state-disabled")) ? "visible" : "hidden";
    }, 500);
  }

  ngAfterViewInit() {
    this.fastPrevButton = document.querySelector(".dx-fast-prev-btn");
    this.fastNextButton = document.querySelector(".dx-fast-next-btn");
    setTimeout(() => this.updateAllTabsStatusDots(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.gridUnsavedInterval);
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }

  @HostListener("window:unload")
  windowUnload() {
    window.sessionStorage.removeItem("surveyRunning");
  }

  gridUnsavedControl() {
    // Pastille rouge "ordre non sauvegardé"
    this.gridUnsavedInterval = setInterval(() => {
      this.tabContext.getAllItems().subscribe(tabs =>
        tabs.filter((tab) => tab.type === TabType.Ordre)
          .map(t => t.unsaved = !!this.gridsService.get("Commande", t.id)?.instance.hasEditData())
      );
    }, 1500);
  }

  onScroll(e) {
    const topValue = e.scrollOffset.top;

    // Back to top button
    const showHidePixelsFromTop = 150;
    const Element = document.querySelector(".backtotop") as HTMLElement;

    if (topValue < showHidePixelsFromTop) {
      Element.classList.add("hiddenBacktotop");
    } else {
      Element.classList.remove("hiddenBacktotop");
    }
  }

  updateAllTabsStatusDots() {
    // Pastille verte "Confirmé"
    this.tabContext.getNotSelectedItems().subscribe(tabs =>
      tabs
        .filter((tab) => tab.type === TabType.Ordre)
        .map(t => {
          this.ordresService
            .getOneByNumeroAndSocieteAndCampagne(
              t.id.split("-")[1],
              this.currentCompanyService.getCompany().id,
              t.id.split("-")[0],
              ["statut"]
            )
            .subscribe((res) => {
              const result = res.data.ordreByNumeroAndSocieteAndCampagne;
              if (!result) return;
              t.status = Statut[result.statut] === Statut.CONFIRME.toString()
            });
        })
    );
  }

  surveyBlockage() {
    if (window.sessionStorage.getItem("surveyRunning")) return;
    window.sessionStorage.setItem("surveyRunning", "true");
    setInterval(() => {
      const id = window.sessionStorage.getItem("idOrdre");
      const isOrdresRouteActive = this.router.isActive("pages/ordres", {
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      });
      if (id && isOrdresRouteActive) {
        this.functionsService
          .fInitBlocageOrdre(id, this.authService.currentUser.nomUtilisateur)
          .valueChanges.subscribe((res) => {
            window.sessionStorage.setItem(
              "blockage",
              res.data.fInitBlocageOrdre.data.bloquer ? "true" : "false"
            );
          });
      }
    }, 10000);
  }

  onFastPrevNextClick(dir) {
    let pos;
    const tabCont = this.tabPanel.instance.$element()[0].querySelector(".dx-scrollable-container") as HTMLElement;
    const tabSubCont = tabCont.querySelector(".dx-scrollable-content") as HTMLElement;
    pos = (dir === "prev") ? 0 : tabSubCont?.offsetWidth - tabCont?.offsetWidth + 2;
    tabCont.scrollTo({ left: pos, behavior: "smooth" });
  }

  onTabsPinClick() {
    this.tabsUnpined = !this.tabsUnpined;
    window.localStorage.setItem(
      "OrderTabsUnpined",
      this.tabsUnpined ? "true" : "false"
    );
  }

  onTabTitleClick(event: { itemData: Partial<TabPanelItem> }) {

    const previous = this.route.snapshot.paramMap.get(RouteParam.TabID);
    if (event.itemData.id === previous) return;

    if (event.itemData?.id === TAB_CLOSE_ALL_ORDRES) {
      if (window.localStorage.getItem("ctrlKey") === "true") return this.closeEveryIndicator();
      this.closeEveryOrdre();
    } else {
      const numeroOrdre = isNaN(parseInt(event.itemData.id, 10))
        ? null
        : event.itemData.id;
      const idOrdre = window.sessionStorage.getItem("numeroOrdre" + numeroOrdre);
      if (numeroOrdre && idOrdre) {
        window.sessionStorage.setItem("idOrdre", idOrdre);
      } else {
        window.sessionStorage.removeItem("idOrdre");
      }

      if (event.itemData.id !== TAB_CLOSE_ALL_ORDRES) {
        this.router.navigate(["pages/ordres", event.itemData.id], {
          queryParamsHandling: "merge",
          state: { [PREVIOUS_STATE]: previous },
        });
      }
    }
  }

  onTabTitleRendered(event) {
    if (this.tabsUnpined === undefined)
      this.tabsUnpined = window.localStorage.getItem("OrderTabsUnpined") === "true" ? true : false;
    const replaceEvent = (e) => {
      const id = e.currentTarget.querySelector("[data-item-id]").dataset.itemId;
      this.onTabTitleClick({ itemData: { id } });
      e.stopPropagation();
    };
    on(event.itemElement, "dxpointerdown", (e) => e.stopPropagation());
    on(event.itemElement, "dxclick", replaceEvent);
    on(event.itemElement, "dxhoverstart", (e) => this.setTabTooltip(event));
  }

  setTabTooltip(item) {
    const data = item.itemData;
    // Display client code in tab title
    if (!item.itemElement.title && data.type === TabType.Ordre) {
      this.ordresService
        .getOneByNumeroAndSocieteAndCampagne(
          data.id.split("-")[1],
          this.currentCompanyService.getCompany().id,
          data.id.split("-")[0],
          ["id", "client.code", "entrepot.code", "dateDepartPrevue"]
        )
        .subscribe((res) => {
          const result = res.data.ordreByNumeroAndSocieteAndCampagne;
          if (!result) return;
          let dateDep = result.dateDepartPrevue ?? "-";
          if (result.dateDepartPrevue !== "-")
            dateDep = this.dateManagementService.friendlyDate(
              result.dateDepartPrevue,
              true
            );
          item.itemElement.title = `Client : ${result.client.code}\r\n`;
          item.itemElement.title += `Entrepôt : ${result.entrepot.code}\r\n`;
          item.itemElement.title += `Départ : ${dateDep}`;
        });
    }
  }

  async onTabCloseClick(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    // Save before closing
    // Seen with Bruno 18-08-2023 : no confirmation required
    const closeTabBtn = (event.target as HTMLElement);
    const pullID = closeTabBtn.parentElement.dataset.itemId;
    const grid = this.gridsService.get("Commande", pullID);
    if (grid?.instance.hasEditData()) closeTabBtn.classList.add("infinite-rotate");
    await this.gridsService.waitUntilAllGridDataSaved(grid);

    this.selectTab(TAB_LOAD_ID);
    const indicateur = this.route.snapshot.queryParamMap
      .getAll(TabType.Indicator)
      .filter((param) => param !== pullID);
    const ordre = this.route.snapshot.queryParamMap
      .getAll(TabType.Ordre)
      .filter((param) => param !== pullID);

    let navID = history?.state[PREVIOUS_STATE] ?? TAB_HOME_ID;
    navID = (navID !== TAB_LOAD_ID) ? navID : TAB_HOME_ID;

    this.router.navigate(["pages/ordres", TAB_LOAD_ID]).then((_) =>
      this.router.navigate(["pages/ordres", navID], {
        queryParams: { indicateur, ordre },
      })
    );
    // Update delete all orders tab
    this.items.find((item) => item.id === TAB_CLOSE_ALL_ORDRES).visible =
      !!ordre?.length;
    this.moreThanOneOpenOrder = (ordre?.length > 1) ? 1 : 0;
    this.atLeastOneOpenIndicator = (indicateur?.length) ? 1 : 0;
  }

  closeEveryOrdre() {
    this.selectTab(TAB_LOAD_ID);
    const indicateur = this.route.snapshot.queryParamMap.getAll(TabType.Indicator);
    let ordre = this.route.snapshot.queryParamMap.getAll(TabType.Ordre);

    // Checking if grids have unsaved data
    ordre.map(ord => this.gridsService.waitUntilAllGridDataSaved(this.gridsService.get("Commande", ord)));

    ordre = [];
    let navID = history?.state[PREVIOUS_STATE] ?? TAB_HOME_ID;
    navID = (navID !== TAB_LOAD_ID) ? navID : TAB_HOME_ID;

    this.router.navigate(["pages/ordres", TAB_LOAD_ID]).then((_) =>
      this.router.navigate(["pages/ordres", navID], {
        queryParams: { indicateur, ordre },
      })
    );
    // Update delete all orders tab
    this.items.find((item) => item.id === TAB_CLOSE_ALL_ORDRES).visible = false;
    notify(this.localizationService.localize(
      this.moreThanOneOpenOrder ? "all-orders-were-closed" : "open-order-was-closed")
    );
  }

  // Keep CTRL pressed when clicking - dev util
  closeEveryIndicator() {
    if (!this.atLeastOneOpenIndicator) return;
    this.selectTab(TAB_LOAD_ID);
    const ordre = this.route.snapshot.queryParamMap.getAll(TabType.Ordre);
    let indicateur = [];
    const navID = history?.state[PREVIOUS_STATE] ?? TAB_HOME_ID;

    this.router.navigate(["pages/ordres", TAB_LOAD_ID]).then((_) =>
      this.router.navigate(["pages/ordres", navID], {
        queryParams: { indicateur, ordre },
      })
    );
    this.atLeastOneOpenIndicator = 0;
    notify(this.localizationService.localize("indicators-were-closed"));
  }

  private handleRouting() {
    return of(this.selectTab(TAB_LOAD_ID)).pipe(
      tap(() => this.tabLoadPanel.visible = true),
      switchMapTo(this.route.queryParamMap.pipe(first())),
      switchMap((queries) => defer(() => this.handleQueries(queries))),
      switchMapTo(this.route.paramMap),
      map((p: ParamMap) => p),
      first(),
      filter((currentParams) => {
        const previousID = this.getTabItem(
          this.getPreviousParamMap().get(RouteParam.TabID)
        );
        const currentID = this.getTabItem(currentParams.get(RouteParam.TabID));
        return ![currentID, TAB_LOAD_ID].includes(previousID);
      }),
      tap((currentParams) => {
        this.selectTab(this.handleParams(currentParams));
        const item = this.getTabItem(
          this.getPreviousParamMap().get(RouteParam.TabID)
        );
        this.tabChangeEvent.emit({ status: "out", item });
      }),
      switchMap((currentParams) => {
        const item = this.getTabItem(currentParams.get(RouteParam.TabID));
        this.tabChangeEvent.emit({ status: "in", item });
        return of("done");
      }),
      tap(() => this.tabLoadPanel.visible = false),
    );
  }

  public isStaticItem(item: TabPanelItem) {
    return [Position.Front, Position.Back].includes(item.position);
  }

  private fillInitialItems() {
    const getItems: () => Promise<TabPanelItem[]> = async () => [
      {
        id: TAB_LOAD_ID,
        component: LoadingTabComponent,
        position: Position.Front,
      },
      {
        id: TAB_HOME_ID,
        icon: "material-icons home",
        class: "home-tab",
        component: (await import("../accueil/ordres-accueil.component"))
          .OrdresAccueilComponent,
        position: Position.Front,
      },
      {
        id: TAB_ORDRE_CREATE_ID,
        title: "nouvel",
        details: "ordre",
        class: "create-order-tab",
        icon: "material-icons note_add",
        component: (await import("../nouvel-ordre/nouvel-ordre.component"))
          .NouvelOrdreComponent,
        position: Position.Front,
      },
      {
        id: TAB_CLOSE_ALL_ORDRES,
        class: "close-all-orders-tab multiline-tab",
        multiLineTitle: [
          this.localizationService.localize("close-open-order"),
          this.localizationService.localize("close-all-orders")
        ],
        visible: false,
        icon: "material-icons disabled_by_default",
        position: Position.Front,
      },
    ];
    return concat(
      defer(getItems).pipe(tap((items) => (this.items = items))),
      this.tabPanelReady.pipe(first())
    ).pipe(first());
  }

  private handleQueries(queries: ParamMap) {
    const mutations = [];
    const pushMutation = (cbk: () => Observable<any>) =>
      mutations.push(defer(cbk));

    this.items
      .filter(
        (item) => ![Position.Front, Position.Back].includes(item.position)
      )
      .filter(
        (item) =>
          ![
            ...queries.getAll(TabType.Indicator),
            ...queries.getAll(TabType.Ordre),
          ].find((param) => item.id === param)
      )
      .forEach((item) => {
        pushMutation(() => {
          this.pullTab(item.id);
          return this.tabPanelReady.pipe(take(1));
        });
      });

    (
      [
        ...queries
          .getAll(TabType.Indicator)
          .map((param) => [param, TabType.Indicator]),
        ...queries.getAll(TabType.Ordre).map((param) => [param, TabType.Ordre]),
      ] as [string, TabType][]
    )
      .filter(([param]) => !this.items.find((item) => item.id === param))
      .forEach(([id, tabType]) => {
        pushMutation(() => {
          this.pushTab(tabType, {
            id,
            position:
              tabType === TabType.Indicator ? Position.Start : Position.End,
          });
          return this.tabPanelReady.pipe(take(1));
        });
      });

    return iif(
      () => !!mutations.length,
      concat(...mutations).pipe(last()),
      EMPTY.pipe(startWith(0))
    );
  }

  private handleParams(params: ParamMap) {
    const paramID = params.get(RouteParam.TabID);
    return !this.items.find((item) => item.id === paramID)
      ? TAB_HOME_ID
      : paramID;
  }

  private async pushTab(type: TabType, data: TabPanelItem): Promise<number> {
    if (type === TabType.Indicator) {
      const indicator = this.ordresIndicatorsService.getIndicatorByName(
        data.id
      );
      // Inconcistency with one or several indicators? Cleans as it can
      if (!indicator) {
        this.pullTab(data.id)
        this.selectTab(TAB_HOME_ID);
        return;
      }
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

    // Update delete all orders tab
    this.items.find((item) => item.id === TAB_CLOSE_ALL_ORDRES).visible =
      !!this.route.snapshot.queryParamMap.getAll(TabType.Ordre)?.length;
    this.moreThanOneOpenOrder = (this.route.snapshot.queryParamMap.getAll(TabType.Ordre)?.length > 1) ? 1 : 0;
    this.atLeastOneOpenIndicator = this.route.snapshot.queryParamMap.getAll(TabType.Indicator)?.length ? 1 : 0;
    return this.items.indexOf(data);
  }

  private pullTab(id: string) {
    this.items = this.items.filter((item) => item.id !== id);
  }

  private getTabIndex(id: string) {
    return this.items.findIndex((item) => item.id === id);
  }

  private getTabItem(id: string) {
    return this.items.find((item) => item.id === id);
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
    <div
      id="tab-load"
      style="height: 70vh;"
    ></div>
    <dx-load-panel
      [position]="{ of: '#tab-load' }"
      [container]="'#tab-load'"
      [visible]="true"
      [showIndicator]="true"
    ></dx-load-panel>
  `,
})
export class LoadingTabComponent { }
