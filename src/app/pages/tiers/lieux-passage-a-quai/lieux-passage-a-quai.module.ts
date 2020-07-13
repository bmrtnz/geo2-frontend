import {NgModule} from '@angular/core';

import {LieuxPassageAQuaiRoutingModule} from './lieux-passage-a-quai-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import {
  DxAccordionModule, DxBoxModule,
  DxButtonModule, DxCheckBoxModule,
  DxDataGridModule,
  DxFormModule, DxListModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
  DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LieuxPassageAQuaiDetailsComponent } from './details/lieux-passage-a-quai-details.component';
import { LieuxPassageAQuaiListComponent } from './list/lieux-passage-a-quai-list.component';
import { NestedGuard } from 'app/shared/guards/nested-guard';


@NgModule({
  imports: [
    SharedModule,
    LieuxPassageAQuaiRoutingModule,
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
    LieuxPassageAQuaiListComponent,
    LieuxPassageAQuaiDetailsComponent
  ],
  providers: [NestedGuard],
})
export class LieuxPassageAQuaiModule { }


