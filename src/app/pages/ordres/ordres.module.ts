import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonLoaderModule } from "app/shared/components/button-loader/button-loader.component";
import { EditingAlertModule } from "app/shared/components/editing-alert/editing-alert.component";
import { EntityCellTemplateModule } from "app/shared/components/entity-cell-template/entity-cell-template.component";
import { FileManagerModule } from "app/shared/components/file-manager/file-manager-popup.component";
import { InfoPopupModule } from "app/shared/components/info-popup/info-popup.component";
import { ViewDocumentPopupModule } from "app/shared/components/view-document-popup/view-document-popup.component";
import { OrdresTabsPersistGuard } from "app/shared/guards/ordres-tabs-persist.guard";
import { LocalizePipe } from "app/shared/pipes";
import { OrdresIndicatorsService } from "app/shared/services/ordres-indicators.service";
import { SharedModule } from "app/shared/shared.module";
import {
  DxAccordionModule,
  DxActionSheetModule,
  DxAutocompleteModule,
  DxBoxModule,
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxListModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxPopoverModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxSortableModule,
  DxSwitchModule,
  DxTabPanelModule,
  DxTagBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxTileViewModule,
  DxTooltipModule,
  DxValidationGroupModule,
  DxValidatorModule
} from "devextreme-angular";
import { PromptPopupModule } from "../../shared/components/prompt-popup/prompt-popup.component";
import { ArticlesModule } from "../articles/articles.module";
import { ContactsModule } from "../tiers/contacts/contacts.module";
import { FournisseursModule } from "../tiers/fournisseurs/fournisseurs.module";
import { LieuxPassageAQuaiModule } from "../tiers/lieux-passage-a-quai/lieux-passage-a-quai.module";
import { TransporteursModule } from "../tiers/transporteurs/transporteurs.module";
import { OrdresAccueilComponent } from "./accueil/ordres-accueil.component";
import { ActionsDocumentsOrdresComponent } from "./actions-documents-ordres/actions-documents-ordres.component";
import { ConfirmationResultPopupComponent } from "./actions-documents-ordres/confirmation-result-popup/confirmation-result-popup.component";
import { AjoutArticlesHistoPopupComponent } from "./ajout-articles-histo-popup/ajout-articles-histo-popup.component";
import { AjoutArticlesManuPopupComponent } from "./ajout-articles-manu-popup/ajout-articles-manu-popup.component";
import { AjoutArticlesStockPopupComponent } from "./ajout-articles-stock-popup/ajout-articles-stock-popup.component";
import { AjoutEtapeLogistiquePopupComponent } from "./ajout-etape-logistique-popup/ajout-etape-logistique-popup.component";
import { AnnuleRemplacePopupComponent } from "./annule-remplace-popup/annule-remplace-popup.component";
import { ArticleCertificationPopupComponent } from "./article-certification-popup/article-certification-popup.component";
import { ArticleOriginePopupComponent } from "./article-origine-popup/article-origine-popup.component";
import { ChoixRaisonDecloturePopupComponent } from "./choix-raison-decloture-popup/choix-raison-decloture-popup.component";
import { DocumentsOrdresPopupComponent } from "./documents-ordres-popup/documents-ordres-popup.component";
import { FormLitigesComponent } from "./form-litiges/form-litiges.component";
import { FormLogistiqueComponent } from "./form-logistique/form-logistique.component";
import { FormComponent } from "./form/form.component";
import { GridAnnuleRemplaceComponent } from "./grid-annule-remplace/grid-annule-remplace.component";
import { GridChoixEnvoisComponent } from "./grid-choix-envois/grid-choix-envois.component";
import { GridClientsDepEncoursDetailComponent } from "./grid-clients-dep-encours-detail/grid-clients-dep-encours-detail.component";
import { GridCommandesComponent } from "./grid-commandes/grid-commandes.component";
import { GridCommentaireOrdreComponent } from "./grid-commentaire-ordre/grid-commentaire-ordre.component";
import { GridControleQualiteComponent } from "./grid-controle-qualite/grid-controle-qualite.component";
import { GridDetailPalettesComponent } from "./grid-detail-palettes/grid-detail-palettes.component";
import { GridDetailPlanningDepartsComponent } from "./grid-detail-planning-departs/grid-detail-planning-departs.component";
import { GridEntrepotsComponent } from "./grid-entrepots/grid-entrepots.component";
import { GridEnvoisComponent } from "./grid-envois/grid-envois.component";
import { GridFraisComponent } from "./grid-frais/grid-frais.component";
import { GridHistoModifDetailComponent } from "./grid-histo-modif-detail/grid-histo-modif-detail.component";
import { GridHistoriqueEntrepotsComponent } from "./grid-historique-entrepots/grid-historique-entrepots.component";
import { GridHistoriqueComponent } from "./grid-historique/grid-historique.component";
import { GridLignesDetailsComponent } from "./grid-lignes-details/grid-lignes-details.component";
import { GridLignesHistoriqueComponent } from "./grid-lignes-historique/grid-lignes-historique.component";
import { GridLignesTotauxDetailComponent } from "./grid-lignes-totaux-detail/grid-lignes-totaux-detail.component";
import { GridLignesComponent } from "./grid-lignes/grid-lignes.component";
import { GridLitigesLignesComponent } from "./grid-litiges-lignes/grid-litiges-lignes.component";
import { GridLogistiquesComponent } from "./grid-logistiques/grid-logistiques.component";
import { GridMargeComponent } from "./grid-marge/grid-marge.component";
import { GridOrdreLigneLogistiqueComponent } from "./grid-ordre-ligne-logistique/grid-ordre-ligne-logistique.component";
import { GridSaveLogComponent } from "./grid-save-log/grid-save-log.component";
import { GridStockComponent } from "./grid-stock/grid-stock.component";
import { ReservationPopupComponent } from "./grid-stock/reservation-popup/reservation-popup.component";
import { GridSuiviComponent } from "./grid-suivi/grid-suivi.component";
import { HistoriqueModifDetailPopupComponent } from "./historique-modif-detail-popup/historique-modif-detail-popup.component";
import { BonAFacturerComponent } from "./indicateurs/bon-a-facturer/bon-a-facturer.component";
import { ClientsDepEncoursComponent } from "./indicateurs/clients-dep-encours/clients-dep-encours.component";
import { CommandesTransitComponent } from "./indicateurs/commandes-transit/commandes-transit.component";
import { LitigesComponent } from "./indicateurs/litiges/litiges.component";
import { OrdresNonCloturesComponent } from "./indicateurs/ordres-non-clotures/ordres-non-clotures.component";
import { OrdresNonConfirmesComponent } from "./indicateurs/ordres-non-confirmes/ordres-non-confirmes.component";
import { PlanningDepartComponent } from "./indicateurs/planning-depart/planning-depart.component";
import { PlanningFournisseursComponent } from "./indicateurs/planning-fournisseurs/planning-fournisseurs.component";
import {
  PlanningTransporteursApprocheComponent
} from "./indicateurs/planning-transporteurs-approche/planning-transporteurs-approche.component";
import PlanningTransporteursComponent from "./indicateurs/planning-transporteurs/planning-transporteurs.component";
import { SupervisionAFacturerComponent } from "./indicateurs/supervision-a-facturer/supervision-a-facturer.component";
import { SupervisionComptesPaloxComponent } from "./indicateurs/supervision-comptes-palox/supervision-comptes-palox.component";
import { SupervisionLivraisonComponent } from "./indicateurs/supervision-livraison/supervision-livraison.component";
import { ModifDetailLignesPopupComponent } from "./modif-detail-lignes-popup/modif-detail-lignes-popup.component";
import { NouvelOrdreComponent } from "./nouvel-ordre/nouvel-ordre.component";
import { OrdresRoutingModule } from "./ordres-routing.module";
import { LoadingTabComponent, RootComponent, TabContext } from "./root/root.component";
import OrdresSuiviComponent from "./suivi/ordres-suivi.component";
import { ZoomArticlePopupComponent } from "./zoom-article-popup/zoom-article-popup.component";
import { ZoomFournisseurPopupComponent } from "./zoom-fournisseur-popup/zoom-fournisseur-popup.component";
import { ZoomLieupassageaquaiPopupComponent } from "./zoom-lieupassageaquai-popup/zoom-lieupassageaquai-popup.component";
import { ZoomTransporteurPopupComponent } from "./zoom-transporteur-popup/zoom-transporteur-popup.component";

@NgModule({
  declarations: [
    OrdresAccueilComponent,
    OrdresSuiviComponent,
    GridSuiviComponent,
    GridLignesComponent,
    GridEnvoisComponent,
    GridHistoriqueComponent,
    LitigesComponent,
    GridLogistiquesComponent,
    BonAFacturerComponent,
    SupervisionLivraisonComponent,
    OrdresNonCloturesComponent,
    OrdresNonConfirmesComponent,
    PlanningDepartComponent,
    CommandesTransitComponent,
    ClientsDepEncoursComponent,
    GridLignesDetailsComponent,
    GridSaveLogComponent,
    GridCommentaireOrdreComponent,
    GridOrdreLigneLogistiqueComponent,
    FormLitigesComponent,
    GridControleQualiteComponent,
    GridLignesTotauxDetailComponent,
    GridLitigesLignesComponent,
    GridDetailPalettesComponent,
    GridMargeComponent,
    GridFraisComponent,
    FormLogistiqueComponent,
    GridDetailPlanningDepartsComponent,
    GridClientsDepEncoursDetailComponent,
    RootComponent,
    LoadingTabComponent,
    FormComponent,
    PlanningTransporteursComponent,
    PlanningFournisseursComponent,
    PlanningTransporteursApprocheComponent,
    SupervisionComptesPaloxComponent,
    NouvelOrdreComponent,
    GridEntrepotsComponent,
    GridHistoriqueEntrepotsComponent,
    SupervisionAFacturerComponent,
    AjoutArticlesManuPopupComponent,
    ZoomArticlePopupComponent,
    ZoomFournisseurPopupComponent,
    ArticleOriginePopupComponent,
    ArticleCertificationPopupComponent,
    ZoomTransporteurPopupComponent,
    ZoomLieupassageaquaiPopupComponent,
    AjoutEtapeLogistiquePopupComponent,
    ActionsDocumentsOrdresComponent,
    DocumentsOrdresPopupComponent,
    GridChoixEnvoisComponent,
    GridAnnuleRemplaceComponent,
    AnnuleRemplacePopupComponent,
    ModifDetailLignesPopupComponent,
    AjoutArticlesHistoPopupComponent,
    GridLignesHistoriqueComponent,
    ConfirmationResultPopupComponent,
    ChoixRaisonDecloturePopupComponent,
    HistoriqueModifDetailPopupComponent,
    GridHistoModifDetailComponent,
    AjoutArticlesStockPopupComponent,
    GridStockComponent,
    ReservationPopupComponent,
    GridCommandesComponent,
  ],
  imports: [
    OrdresRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ArticlesModule,
    DxNumberBoxModule,
    DxFormModule,
    DxScrollViewModule,
    DxTagBoxModule,
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxAccordionModule,
    DxAutocompleteModule,
    DxTileViewModule,
    DxSwitchModule,
    DxListModule,
    DxSelectBoxModule,
    DxSortableModule,
    DxTabPanelModule,
    DxActionSheetModule,
    DxTextBoxModule,
    DxRadioGroupModule,
    DxBoxModule,
    DxCheckBoxModule,
    DxTextAreaModule,
    DxPopoverModule,
    DxValidatorModule,
    InfoPopupModule,
    EditingAlertModule,
    FileManagerModule,
    DxDateBoxModule,
    DxValidationGroupModule,
    DxLoadIndicatorModule,
    ViewDocumentPopupModule,
    DxLoadPanelModule,
    ButtonLoaderModule,
    FournisseursModule,
    TransporteursModule,
    LieuxPassageAQuaiModule,
    ContactsModule,
    DxTooltipModule,
    EntityCellTemplateModule,
    PromptPopupModule
  ],
  providers: [
    OrdresIndicatorsService,
    DatePipe,
    LocalizePipe,
    TabContext,
    OrdresTabsPersistGuard,
  ],
})
export class OrdresModule { }
