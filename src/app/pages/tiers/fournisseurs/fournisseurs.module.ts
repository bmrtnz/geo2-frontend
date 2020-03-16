import {NgModule} from '@angular/core';

import {FournisseursRoutingModule} from './fournisseurs-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import { FournisseursListComponent } from './list/fournisseurs-list.component';
import {
  DxAccordionModule, DxBoxModule,
  DxButtonModule, DxCheckBoxModule,
  DxDataGridModule,
  DxFormModule, DxListModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
  DxTextBoxModule
} from 'devextreme-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FournisseurDetailsComponent } from './details/fournisseur-details.component';


@NgModule({
  imports: [
    SharedModule,
    FournisseursRoutingModule,
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
    DxPopoverModule
  ],
  declarations: [
    FournisseursListComponent,
    FournisseurDetailsComponent
  ]
})
export class FournisseursModule { }


