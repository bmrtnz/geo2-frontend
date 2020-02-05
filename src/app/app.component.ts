import {Component, HostBinding} from '@angular/core';
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

  public copyrightYear = '';

  constructor(
    private localizationService: LocalizationService,
    private authService: AuthService,
    private screen: ScreenService
  ) {
    const year = new Date().getFullYear();

    if (year !== AppComponent.START_DEV_YEAR) {
      this.copyrightYear = '-' + year;
    }
  }

  isAutorized() {
    return this.authService.isLoggedIn;
  }
}
