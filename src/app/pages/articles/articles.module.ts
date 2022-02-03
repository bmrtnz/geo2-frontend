import { NgModule } from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {ArticleDetailsComponent} from './details/article-details.component';
import { ArticlesListComponent } from './list/articles-list.component';
import {
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule, DxTabPanelModule,
    DxTemplateModule, DxTagBoxModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
    DxTextBoxModule, DxValidatorModule, DxPopupModule
} from 'devextreme-angular';
import { ArticlesRoutingModule } from './articles-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {PushHistoryPopupModule} from '../../shared/components/push-history-popup/push-history-popup.component';
import { CommonModule } from '@angular/common';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EditingGuard } from 'app/shared/guards/editing-guard';
import { EditingAlertModule } from 'app/shared/components/editing-alert/editing-alert.component';
import { HistoriqueValideModule } from 'app/shared/components/historique-valide/historique-valide.component';
import { FileManagerModule } from 'app/shared/components/file-manager/file-manager-popup.component';
import { ViewDocumentPopupModule } from 'app/shared/components/view-document-popup/view-document-popup.component';

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
        DxTemplateModule, DxTagBoxModule,
        DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
        DxTextBoxModule, DxValidatorModule,
        EditingAlertModule, PushHistoryPopupModule,
        HistoriqueValideModule,
        FileManagerModule, ViewDocumentPopupModule
    ],
  declarations: [ArticleDetailsComponent, ArticlesListComponent],
  providers: [NestedGuard, EditingGuard],
  exports: [ArticlesListComponent]
})
export class ArticlesModule { }
