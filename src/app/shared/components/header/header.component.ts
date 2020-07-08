import {Component, NgModule, Input, Output, EventEmitter, OnInit} from '@angular/core';
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
      text: 'Profil',
      icon: 'user'
    }, {
      text: this.localizeService.localize('auth-logout'),
      icon: 'runner',
      onClick: () => {
        this.authService.logOut();
      }
    }];
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {

    const myElement =  document.querySelector('.content');
    myElement.addEventListener('scroll', (ev) => {
      const aa = ev.target as HTMLElement;
      console.log(aa.scrollTop)
      if (aa.scrollTop > 100) {
          console.log('>100')
      };

    });
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  }

  scrollToTop() {
    const Element = document.querySelector('.content') as HTMLElement;
    Element.scrollIntoView({
      behavior: 'smooth'
    });
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
