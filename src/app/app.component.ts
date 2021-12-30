import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ScreenService } from './shared/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
  }

  constructor(
    private authService: AuthService,
    private screen: ScreenService,
    private router: Router,
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

  closest(elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }

  isAutorized() {
    return !this.router.isActive('/login', false) ?? this.authService.isLoggedIn;
  }
}
