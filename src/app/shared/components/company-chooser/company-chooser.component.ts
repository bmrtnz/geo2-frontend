import {Component, Input, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DxListModule} from 'devextreme-angular/ui/list';
import {DxContextMenuModule} from 'devextreme-angular/ui/context-menu';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-chooser-panel',
  templateUrl: 'company-chooser.component.html',
  styleUrls: ['./company-chooser.component.scss']
})

export class CompanyChooserComponent implements OnInit {
  @Input()
  companyItems: DataSource;

  @Input()
  menuMode: string;

  societe: {};

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.societe = environment.societe.raisonSocial;
  }

  selectCompany(e) {
    environment.societe.id = e.itemData.id;
    environment.societe.raisonSocial = e.itemData.raisonSocial;
    this.societe = environment.societe.raisonSocial;
    // Back home
    this.router.navigate([`/**`]);
  }

}

@NgModule({
  imports: [
    DxListModule,
    DxContextMenuModule,
    CommonModule
  ],
  declarations: [CompanyChooserComponent],
  exports: [CompanyChooserComponent]
})
export class CompanyChooserModule {
  }

