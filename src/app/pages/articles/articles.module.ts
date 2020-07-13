import { NgModule } from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {ArticleDetailsComponent} from './details/article-details.component';
import { ArticlesListComponent } from './list/articles-list.component';
import {
  DxAccordionModule, DxBoxModule,
  DxButtonModule, DxCheckBoxModule,
  DxDataGridModule, DxTabPanelModule,
  DxTemplateModule,
  DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
  DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { ArticlesRoutingModule } from './articles-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NestedGuard } from 'app/shared/guards/nested-guard';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ArticlesRoutingModule,
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule, DxTabPanelModule,
    DxTemplateModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
    DxTextBoxModule, DxValidatorModule
  ],
  declarations: [ArticleDetailsComponent, ArticlesListComponent],
  providers: [NestedGuard],
})
export class ArticlesModule { }
