import {
  Component,
  OnInit,
  NgModule,
  Input,
  isDevMode,
  ViewChild,
} from "@angular/core";
import {
  SideNavigationMenuModule,
  HeaderModule,
} from "../../shared/components";
import { AuthService, ScreenService } from "../../shared/services";
import { DxDrawerModule } from "devextreme-angular/ui/drawer";
import { ChooseArticleZoomPopupModule } from "../choose-article-zoom/choose-article-zoom-popup.component";
import {
  DxScrollViewModule,
  DxScrollViewComponent,
} from "devextreme-angular/ui/scroll-view";
import { CommonModule } from "@angular/common";
import { SharedModule } from "app/shared/shared.module";

import { navigation } from "../../pages/pages-navigation";
import { Router, NavigationEnd } from "@angular/router";
import { DxButtonModule } from "devextreme-angular";
import { ValidationService } from "app/shared/services/api/validation.service";
import { ChooseArticleZoomPopupComponent } from "../choose-article-zoom/choose-article-zoom-popup.component";
import Alerte from "app/shared/models/alerte.model";
import { VersionService } from "app/shared/services/version.service";
import { AlertesService } from "app/shared/services/api/alert.service";


@Component({
  selector: "app-side-nav-outer-toolbar",
  templateUrl: "./side-nav-outer-toolbar.component.html",
  styleUrls: ["./side-nav-outer-toolbar.component.scss"],
})
export class SideNavOuterToolbarComponent implements OnInit {
  menuItems = navigation;
  selectedRoute = "";

  menuOpened: boolean;
  temporaryMenuOpened = false;

  @ViewChild(DxScrollViewComponent, { static: false }) scrollView: DxScrollViewComponent;
  @ViewChild(ChooseArticleZoomPopupComponent, { static: false }) chooseArticlePopup: ChooseArticleZoomPopupComponent;

  @Input() title: string;

  menuMode = "shrink";
  menuRevealMode = "expand";
  minMenuSize = 0;
  shaderEnabled = false;
  mainBannerInterval: any;
  bannerVisible = false;

  public alerteInfo: Partial<Alerte>;


  constructor(
    private screen: ScreenService,
    private router: Router,
    private authService: AuthService,
    private alertesService: AlertesService,
    private validationService: ValidationService,
    private versionService: VersionService
  ) { }

  ngOnInit() {
    this.menuOpened = this.screen.sizes["screen-large"];
    if (window.sessionStorage.getItem("HideMainDrawer") === "true") {
      this.menuOpened = false;
    }

    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.selectedRoute = val.urlAfterRedirects.split("?")[0];
      }
    });

    this.screen.changed.subscribe(() => this.updateDrawer());

    this.updateDrawer();

    // Show red badges (unvalidated forms)
    this.validationService.showToValidateBadges();

    // Periodic banner info retrieval
    clearInterval(this.mainBannerInterval);
    this.mainBannerInterval = setInterval(() => {
      this.alertesService.fetchAlerte().subscribe({
        next: (res) => {
          this.alerteInfo = res?.data?.fetchAlerte;
          if (this.alerteInfo) {
            // Is that our commercial area?
            const sectorMatch = this.authService.isAdmin ||
              (!!this.alerteInfo.secteur?.id && !!this.authService.currentUser.secteurCommercial.id
                && this.alerteInfo.secteur?.id === this.authService.currentUser.secteurCommercial.id
              );
            // Is it the right timing?
            const timingMatch = (!this.alerteInfo?.dateDebut || (this.alerteInfo?.dateDebut &&
              new Date() > new Date(this.alerteInfo?.dateDebut))) &&
              (!this.alerteInfo?.dateFin || (this.alerteInfo?.dateFin && new Date() < new Date(this.alerteInfo?.dateFin)));
            this.bannerVisible = this.alerteInfo?.valide && timingMatch && sectorMatch;
          }
        },
        error: (error: Error) =>
          console.log(error.message)
      });
    }, 5000);

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
    // Sticky order scroll buttons
    const orderScrollBtns = document.querySelector(
      ".tabs-ordres-page .dx-item-selected .form-scrollTo-buttons-container"
    ) as HTMLElement;
    if (orderScrollBtns) {
      const newPos = topValue > 100 ? topValue - 68 : 32;
      orderScrollBtns.style.top = newPos + "px";
    }
  }

  scrollToTop() {
    // Check scroll context
    const target = window.localStorage.getItem("OrderTabsUnpined") === "true" ?
      ".content" :
      ".dx-multiview-item.dx-item-selected .scrollview-ordre-content .dx-scrollview-content";
    const Element = document.querySelector(target) as HTMLElement;
    Element?.scrollIntoView({ behavior: "smooth" });
  }

  updateDrawer() {
    const isXSmall = this.screen.sizes["screen-x-small"];
    const isLarge = this.screen.sizes["screen-large"];

    this.menuMode = isLarge ? "shrink" : "overlap";
    this.menuRevealMode = isXSmall ? "slide" : "expand";
    this.minMenuSize = isXSmall ? 0 : 60;
    this.shaderEnabled = !isLarge;
  }

  get hideMenuAfterNavigation() {
    return this.menuMode === "overlap" || this.temporaryMenuOpened;
  }

  get showMenuAfterClick() {
    return !this.menuOpened;
  }

  navigationChanged(event) {
    const path = event.itemData.path;
    const open = event.itemData.open;
    const pointerEvent = event.event;

    pointerEvent.preventDefault();

    if (!open) {
      // Standard case = routing
      if (
        path &&
        this.menuOpened &&
        !(path === "pages/ordres" && this.router.url.includes(path))
      ) this.router.navigateByUrl(path);
    } else {
      // Special cases
      switch (open) {
        case "ChooseArticleZoomPopupComponent":
          this.chooseArticlePopup.visible = true;
          break;
      }
    }
  }

  menuToggle() {
    this.menuOpened = !this.menuOpened;
    window.sessionStorage.setItem(
      "HideMainDrawer",
      !this.menuOpened ? "true" : "false"
    );
    this.versionService.updateCopyrightTextDisplay();
  }

  navigationClick() {
    if (this.showMenuAfterClick) {
      this.temporaryMenuOpened = true;
      this.menuOpened = true;
    }
  }

}

@NgModule({
  imports: [
    SideNavigationMenuModule,
    DxDrawerModule,
    HeaderModule,
    ChooseArticleZoomPopupModule,
    DxButtonModule,
    DxScrollViewModule,
    CommonModule,
    SharedModule
  ],
  exports: [SideNavOuterToolbarComponent],
  declarations: [SideNavOuterToolbarComponent],
})
export class SideNavOuterToolbarModule { }
