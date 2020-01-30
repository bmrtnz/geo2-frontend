import {NgModule} from '@angular/core';
import {ClientsRoutingModule} from './clients-routing.module';
import {ClientsListComponent} from './list/clients-list.component';
import {ClientDetailsComponent} from './details/client-details.component';
import {SharedModule} from '../../../shared/shared.module';
import {DxDataGridModule, DxFormModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule} from 'devextreme-angular';


@NgModule({
  imports: [
    SharedModule,
    ClientsRoutingModule,
    DxDataGridModule,
    DxFormModule
  ],
  declarations: [
    ClientsListComponent,
    ClientDetailsComponent
  ]
})
export class ClientsModule { }
