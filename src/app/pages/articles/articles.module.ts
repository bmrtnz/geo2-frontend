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
import {PromptPopupModule} from '../../shared/components/prompt-popup/prompt-popup.component';
import { CommonModule } from '@angular/common';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EditingGuard } from 'app/shared/guards/editing-guard';
import { EditingAlertModule } from 'app/shared/components/editing-alert/editing-alert.component';
import { HistoriqueValideModule } from 'app/shared/components/historique-valide/historique-valide.component';

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
    DxTextBoxModule, DxValidatorModule,
    EditingAlertModule, PromptPopupModule,
    HistoriqueValideModule,
  ],
  declarations: [ArticleDetailsComponent, ArticlesListComponent],
  providers: [NestedGuard, EditingGuard],
})
export class ArticlesModule { }
