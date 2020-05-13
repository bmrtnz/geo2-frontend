import {NgModule} from '@angular/core';
import {TransporteursRoutingModule} from './transporteurs-routing.module';
import {TransporteursListComponent} from './list/transporteurs-list.component';
import {TransporteurDetailsComponent} from './details/transporteur-details.component';
import {SharedModule} from '../../../shared/shared.module';
import {
  DxAccordionModule, DxBoxModule,
  DxButtonModule, DxCheckBoxModule,
  DxDataGridModule,
  DxFormModule, DxListModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
  DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  imports: [
    SharedModule,
    TransporteursRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DxFormModule,
    DxDataGridModule,
    DxButtonModule,
    DxAccordionModule,
    DxListModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxBoxModule,
    DxCheckBoxModule,
    DxTextAreaModule,
    DxPopoverModule,
    DxValidatorModule
  ],
  declarations: [
    TransporteursListComponent,
    TransporteurDetailsComponent
  ]
})
export class TransporteursModule { }
