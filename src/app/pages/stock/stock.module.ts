import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockListComponent } from './list/stock-list.component';
import { SharedModule } from 'app/shared/shared.module';
import { StockRoutingModule } from './stock-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DxAccordionModule, DxBoxModule,
  DxButtonModule, DxCheckBoxModule,
  DxDataGridModule, DxTabPanelModule,
  DxTemplateModule, DxAutocompleteModule,
  DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
  DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StockRoutingModule,
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule, DxTabPanelModule, DxAutocompleteModule,
    DxTemplateModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
    DxTextBoxModule, DxValidatorModule
  ],
  declarations: [StockListComponent],
})
export class StockModule { }
