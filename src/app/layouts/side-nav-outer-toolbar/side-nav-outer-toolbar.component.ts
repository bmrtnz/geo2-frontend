import {Component, OnInit, NgModule, Input, isDevMode, ViewChild} from '@angular/core';
import { SideNavigationMenuModule, HeaderModule } from '../../shared/components';
import { ScreenService } from '../../shared/services';
import { DxDrawerModule } from 'devextreme-angular/ui/drawer';
import { DxScrollViewModule, DxScrollViewComponent } from 'devextreme-angular/ui/scroll-view';
import { CommonModule } from '@angular/common';

import { navigation } from '../../app-navigation';
import { Router, NavigationEnd } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular';
import { ValidationService } from 'app/shared/services/api/validation.service';

@Component({
  selector: 'app-side-nav-outer-toolbar',
  templateUrl: './side-nav-outer-toolbar.component.html',
  styleUrls: ['./side-nav-outer-toolbar.component.scss']
})
export class SideNavOuterToolbarComponent implements OnInit {
  menuItems = navigation;
  selectedRoute = '';

  menuOpened: boolean;
  temporaryMenuOpened = false;

  @ViewChild(DxScrollViewComponent, { static: false }) scrollView: DxScrollViewComponent;

  @Input()
  title: string;

  menuMode = 'shrink';
  menuRevealMode = 'expand';
  minMenuSize = 0;
  shaderEnabled = false;

  constructor(
    private screen: ScreenService,
    private router: Router,
    private validationService: ValidationService
    ) { }

  ngOnInit() {
    this.filterMenuItems();
    this.menuOpened = this.screen.sizes['screen-large'];

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.selectedRoute = val.urlAfterRedirects.split('?')[0];
      }
    });

    this.screen.changed.subscribe(() => this.updateDrawer());

    this.updateDrawer();

    // Show red badges (unvalidated forms)
    this.validationService.showToValidateBadges();

  }

  onScroll(e) {
    const topValue = e.scrollOffset.top;

    // Back to top button
    const showHidePixelsFromTop = 150;
    const Element = document.querySelector('.backtotop') as HTMLElement;

    if (topValue < showHidePixelsFromTop) {
      Element.classList.add('hiddenBacktotop');
    } else {
      Element.classList.remove('hiddenBacktotop');
    }
    // Sticky order scroll buttons
    const orderScrollBtns = document.querySelector('.tabs-ordres-page .dx-item-selected .form-scrollTo-buttons-container') as HTMLElement;
    if (orderScrollBtns) {
      const newPos = topValue > 100 ? (topValue - 68) : 32;
      orderScrollBtns.style.top = newPos + 'px';
    }

  }
  scrollToTop() {
    const Element = document.querySelector('.content') as HTMLElement;
    Element.scrollIntoView({
      behavior: 'smooth'
    });
  }

  updateDrawer() {
    const isXSmall = this.screen.sizes['screen-x-small'];
    const isLarge = this.screen.sizes['screen-large'];

    this.menuMode = isLarge ? 'shrink' : 'overlap';
    this.menuRevealMode = isXSmall ? 'slide' : 'expand';
    this.minMenuSize = isXSmall ? 0 : 60;
    this.shaderEnabled = !isLarge;
  }

  get hideMenuAfterNavigation() {
    return this.menuMode === 'overlap' || this.temporaryMenuOpened;
  }

  get showMenuAfterClick() {
    return !this.menuOpened;
  }

  navigationChanged(event) {
    const path = event.itemData.path;
    const pointerEvent = event.event;

    pointerEvent.preventDefault();

    if (path && this.menuOpened) {
      this.router.navigateByUrl(path);
    }

  //   if (event.node.selected) {
  //     pointerEvent.preventDefault();
  //   } else {
  //       this.router.navigateByUrl(path);
  //     }

  //   if (this.hideMenuAfterNavigation) {
  //     this.temporaryMenuOpened = false;
  //     this.menuOpened = false;
  //     pointerEvent.stopPropagation();
  //   } else {
  //     pointerEvent.preventDefault();
  //   }
  // }

  }

  navigationClick() {
    if (this.showMenuAfterClick) {
      this.temporaryMenuOpened = true;
      this.menuOpened = true;
    }
  }

  private filterMenuItems() {
    if (!isDevMode()) {
      this.menuItems = this.menuItems.filter(item => !item.dev);
    }
  }
}

@NgModule({
  imports: [ SideNavigationMenuModule, DxDrawerModule, HeaderModule, DxButtonModule, DxScrollViewModule, CommonModule ],
  exports: [ SideNavOuterToolbarComponent ],
  declarations: [ SideNavOuterToolbarComponent ]
})
export class SideNavOuterToolbarModule { }
