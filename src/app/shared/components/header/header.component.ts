import {Component, NgModule, Input, Output, EventEmitter, HostListener} from '@angular/core';
import {CommonModule} from '@angular/common';
import DataSource from 'devextreme/data/data_source';
import {AuthService, LocalizationService} from '../../services';
import {SocietesService} from 'app/shared/services/societes.service';
import {UserPanelModule} from '../user-panel/user-panel.component';
import {CompanyChooserModule} from '../company-chooser/company-chooser.component';
import {DxButtonModule} from 'devextreme-angular/ui/button';
import {DxToolbarModule} from 'devextreme-angular/ui/toolbar';
import {FileManagerModule} from '../file-manager/file-manager-popup.component';

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

  societeSource: DataSource;
  userMenuItems: any[];

  constructor(
    private localizeService: LocalizationService,
    private authService: AuthService,
    public societeService: SocietesService,
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
    this.societeSource = this.societeService.getDataSource();
    this.societeSource.searchExpr('valide');
    this.societeSource.searchOperation('=');
    this.societeSource.searchValue('true');
  }

  @HostListener('scroll', ['$event']) onScrollEvent($event) {
     console.log('scrolling');
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
    CompanyChooserModule,
    FileManagerModule,
    DxToolbarModule
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent]
})
export class HeaderModule {
}
