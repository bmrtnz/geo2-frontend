import {Component, NgModule, Input, Output, EventEmitter, HostListener} from '@angular/core';
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

  @HostListener('scroll', ['$event']) onScrollEvent($event) {
    // console.log($event['Window']);
     console.log('scrolling');
  }

  // @HostListener('window:scroll', ['$event']) onWindowScroll(e) {
  //   console.log('scrolling');
  //   // console.log(e.target['scrollingElement'].scrollTop)

  //   // Your Code Here

  // }

  // tslint:disable-next-line: use-lifecycle-interface
  // ngAfterViewInit(): void {
  //   const myElement =  document.querySelector('.content') as HTMLElement;

  //   myElement.addEventListener('scroll', (e) => {
  //     const aa = e.target as HTMLElement;
  //     console.log(aa.scrollTop)
  //     if (aa.scrollTop > 100) {
  //         console.log('>100')
  //     };
  //   });

  // }
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
