import { NgModule } from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import { ContactsComponent } from './contacts.component';
import {ContactsRoutingModule} from './contacts-routing.module';
import {
  DxAccordionModule, DxBoxModule,
  DxButtonModule, DxCheckBoxModule,
  DxDataGridModule,
  DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
  DxTextBoxModule
} from 'devextreme-angular';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';


@NgModule({
  imports: [
    SharedModule,
    ContactsRoutingModule,
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
    DxTextBoxModule
  ],
  declarations: [ContactsComponent]
})
export class ContactsModule { }
