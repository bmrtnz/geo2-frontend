import { NgModule } from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {ArticlesComponent} from './articles.component';
import {
  DxAccordionModule, DxBoxModule,
  DxButtonModule, DxCheckBoxModule,
  DxDataGridModule, DxTabPanelModule,
  DxTemplateModule,
  DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
  DxTextBoxModule
} from 'devextreme-angular';


@NgModule({
  imports: [
    SharedModule,
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule, DxTabPanelModule,
    DxTemplateModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
    DxTextBoxModule
  ],
  declarations: [ArticlesComponent]
})
export class ArticlesModule { }
