import {Component, ElementRef, HostBinding, OnInit, OnChanges} from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import {AuthService, ScreenService, LocalizationService} from './shared/services';
import { ValidationService } from './shared/services/api/validation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
  }

  constructor(
    private authService: AuthService,
    private screen: ScreenService,
    private validationService: ValidationService
  ) {
    const year = new Date().getFullYear();

    if (year !== AppComponent.START_DEV_YEAR) {
      this.copyrightYear = '-' + year;
    }

    // Close columnchooser on outside click (non standard)
    document.addEventListener('mousedown', e => {
      const el = e.target;
      const context = el as HTMLElement;
      const context2 = context.closest('.dx-datagrid-column-chooser');
      if (!context2) {
        document.querySelectorAll('.dx-datagrid-column-chooser .dx-closebutton').forEach((btn) => {
          const closeBtn = btn as HTMLElement;
          closeBtn.click();
        });
      }
     });

  }
  public static readonly START_DEV_YEAR: number = 2020;
  public version = require( '../../package.json').version;
  public copyrightYear = '';

  ngOnInit() {}

  closest(elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }

  isAutorized() {
    return this.authService.isLoggedIn;
  }
}
