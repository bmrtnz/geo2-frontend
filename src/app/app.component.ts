import {Component, ElementRef, HostBinding} from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import {AuthService, ScreenService, LocalizationService} from './shared/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public static readonly START_DEV_YEAR: number = 2020;

  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
  }

  closest(elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }

  public copyrightYear = '';

  constructor(
    private authService: AuthService,
    private screen: ScreenService,
    private elementRef : ElementRef
  ) {
    const year = new Date().getFullYear();

    if (year !== AppComponent.START_DEV_YEAR) {
      this.copyrightYear = '-' + year;
    }

    // Close columnchooser on outside click (non standard)
    let that = this;

    document.addEventListener('mousedown', e => {
      let chooser = that.closest(e.target, ".dx-datagrid-column-chooser");

      let allDataGrids = elementRef.nativeElement.querySelectorAll('dx-data-grid');
      allDataGrids.forEach(element => {
        // @ts-ignore
        if (!chooser) {window.ng.getComponent<DxDataGridComponent>(element).instance.hideColumnChooser();}
      });

     });

  }

  isAutorized() {
    return this.authService.isLoggedIn;
  }
}
