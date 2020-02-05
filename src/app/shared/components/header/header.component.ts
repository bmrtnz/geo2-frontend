import {Component, NgModule, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuthService, LocalizationService} from '../../services';
import {UserPanelModule} from '../user-panel/user-panel.component';
import {DxButtonModule} from 'devextreme-angular/ui/button';
import {DxToolbarModule} from 'devextreme-angular/ui/toolbar';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title: string;

  userMenuItems: any[];

  constructor(
    private localizeService: LocalizationService,
    private authService: AuthService
  ) {
    this.userMenuItems = [{
      text: 'Profile',
      icon: 'user'
    }, {
      text: this.localizeService.localize('auth-logout'),
      icon: 'runner',
      onClick: () => {
        this.authService.logOut();
      }
    }];
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    UserPanelModule,
    DxToolbarModule
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent]
})
export class HeaderModule {
}
