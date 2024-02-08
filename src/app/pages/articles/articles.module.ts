import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { ArticleDetailsComponent } from "./details/article-details.component";
import { ArticlesListComponent } from "./list/articles-list.component";
import {
  DxAccordionModule,
  DxBoxModule,
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxTabPanelModule,
  DxTemplateModule,
  DxTagBoxModule,
  DxFormModule,
  DxListModule,
  DxNumberBoxModule,
  DxPopoverModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidatorModule,
  DxPopupModule,
  DxAutocompleteModule,
  DxScrollViewModule,
  DxDateBoxModule,
} from "devextreme-angular";
import { ArticlesRoutingModule } from "./articles-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PushHistoryPopupModule } from "../../shared/components/push-history-popup/push-history-popup.component";
import { CommonModule } from "@angular/common";
import { NestedGuard } from "app/shared/guards/nested-guard";
import { EditingGuard } from "app/shared/guards/editing-guard";
import { EditingAlertModule } from "app/shared/components/editing-alert/editing-alert.component";
import { HistoriqueValideModule } from "app/shared/components/historique-valide/historique-valide.component";
import { FileManagerModule } from "app/shared/components/file-manager/file-manager-popup.component";
import { ViewDocumentPopupModule } from "app/shared/components/view-document-popup/view-document-popup.component";
import { AssociationArticlesEDICOLIBRIComponent } from './association-articles-edi-colibri/association-articles-edi-colibri.component';
import { GridArticlesEdiColibriComponent } from "./association-articles-edi-colibri/grid-articles-edi-colibri/grid-articles-edi-colibri.component";
import { ModificationArticleEdiPopupComponent } from "./association-articles-edi-colibri/modification-article-edi-popup/modification-article-edi-popup.component";
import { GridsService } from "../ordres/grids.service";
import { StatistiquesArticlePopupComponent } from './statistiques/statistiques-article-popup.component';
import { GridStatArticleClientsComponent } from './statistiques/grid-stat-article-clients/grid-stat-article-clients.component';
import { GridStatArticleFournisseursComponent } from './statistiques/grid-stat-article-fournisseurs/grid-stat-article-fournisseurs.component';
import { TopRightPopupButtonsModule } from "app/shared/components/top-right-popup-buttons/top-right-popup-buttons.component";


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ArticlesRoutingModule,
    DxAccordionModule,
    DxBoxModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxTabPanelModule,
    DxTemplateModule,
    DxTagBoxModule,
    DxFormModule,
    DxListModule,
    DxNumberBoxModule,
    DxPopoverModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxTextBoxModule,
    DxValidatorModule,
    EditingAlertModule,
    DxScrollViewModule,
    DxAutocompleteModule,
    PushHistoryPopupModule,
    HistoriqueValideModule,
    FileManagerModule,
    ViewDocumentPopupModule,
    DxPopupModule,
    TopRightPopupButtonsModule
  ],
  declarations: [
    ArticleDetailsComponent,
    ArticlesListComponent,
    AssociationArticlesEDICOLIBRIComponent,
    GridArticlesEdiColibriComponent,
    ModificationArticleEdiPopupComponent,
    StatistiquesArticlePopupComponent,
    GridStatArticleFournisseursComponent,
    GridStatArticleClientsComponent,
    GridStatArticleFournisseursComponent,
  ],

  providers: [NestedGuard, EditingGuard, GridsService],
  exports: [
    ArticleDetailsComponent,
    ArticlesListComponent,
    AssociationArticlesEDICOLIBRIComponent,
    GridArticlesEdiColibriComponent,
    ModificationArticleEdiPopupComponent
  ],
})
export class ArticlesModule { }
