import {Component, Input, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DxListModule} from 'devextreme-angular/ui/list';
import {DxContextMenuModule} from 'devextreme-angular/ui/context-menu';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import notify from 'devextreme/ui/notify';

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
    private router: Router,
    public currentCompanyService: CurrentCompanyService,
  ) {}

  ngOnInit() {

    // Local storage
    let data =this.currentCompanyService.getCompany();
    if (data !== null) {
      this.societe = data.raisonSocial;
    } else {
      this.companyItems.load().then(res => {
        if (res.length) {
          this.selectCompany(res[0]);
        } else {
          notify('Aucune société liée au compte', 'error');
        }
      })
    }
 
  }

  selectCompany(e) {
    if (e.itemData) {e = e.itemData;}

    const societe = {
      id : e.id,
      raisonSocial : e.raisonSocial
    }
    // Local storage
    this.currentCompanyService.setCompany(societe);
    this.societe = societe.raisonSocial;
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

