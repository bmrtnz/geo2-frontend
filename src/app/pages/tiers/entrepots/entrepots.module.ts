import {NgModule} from '@angular/core';
import {EntrepotsRoutingModule} from './entrepots-routing.module';
import {EntrepotsListComponent} from './list/entrepots-list.component';
import {EntrepotDetailsComponent} from './details/entrepot-details.component';
import {SharedModule} from '../../../shared/shared.module';
import {
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
    DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  imports: [
      SharedModule,
      EntrepotsRoutingModule,
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
      DxNumberBoxModule,
      DxValidatorModule
  ],
  declarations: [
    EntrepotsListComponent,
    EntrepotDetailsComponent
  ]
})
export class EntrepotsModule { }
