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
  public version = require( '../../package.json').version;

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
  ) {
    const year = new Date().getFullYear();

    if (year !== AppComponent.START_DEV_YEAR) {
      this.copyrightYear = '-' + year;
    }

    // Close columnchooser on outside click (non standard)
    document.addEventListener('mousedown', e => {
      document.querySelectorAll('.dx-datagrid-column-chooser .dx-closebutton').forEach((btn) => {
        const closeBtn = btn as HTMLElement;
        closeBtn.click();
      })
     });

  }

  isAutorized() {
    return this.authService.isLoggedIn;
  }
}
