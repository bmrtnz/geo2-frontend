import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditingAlertModule } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerModule } from 'app/shared/components/file-manager/file-manager-popup.component';
import { ViewDocumentPopupModule } from 'app/shared/components/view-document-popup/view-document-popup.component';
import { LocalizePipe } from 'app/shared/pipes';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { SharedModule } from 'app/shared/shared.module';
import {
  DxAccordionModule, DxAutocompleteModule, DxBoxModule, DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFormModule, DxListModule,
  DxLoadIndicatorModule, DxNumberBoxModule, DxPopoverModule, DxPopupModule, DxSelectBoxModule,
  DxSortableModule, DxTabPanelModule,
  DxTagBoxModule,
  DxTextAreaModule, DxTextBoxModule, DxTileViewModule, DxValidationGroupModule, DxValidatorModule
} from 'devextreme-angular';
import { OrdresAccueilComponent } from './accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from './details/ordres-details.component';
import { FormLitigesComponent } from './form-litiges/form-litiges.component';
import { FormLogistiqueComponent } from './form-logistique/form-logistique.component';
import { GridCommentaireOrdreComponent } from './grid-commentaire-ordre/grid-commentaire-ordre.component';
import { GridControleQualiteComponent } from './grid-controle-qualite/grid-controle-qualite.component';
import { GridDetailPalettesComponent } from './grid-detail-palettes/grid-detail-palettes.component';
import { GridDetailPlanningDepartsComponent } from './grid-detail-planning-departs/grid-detail-planning-departs.component';
import { GridEnvoisComponent } from './grid-envois/grid-envois.component';
import { GridFraisComponent } from './grid-frais/grid-frais.component';
import { GridHistoriqueComponent } from './grid-historique/grid-historique.component';
import { GridLignesDetailsComponent } from './grid-lignes-details/grid-lignes-details.component';
import { GridLignesTotauxDetailComponent } from './grid-lignes-totaux-detail/grid-lignes-totaux-detail.component';
import { GridLignesComponent } from './grid-lignes/grid-lignes.component';
import { GridLitigesLignesComponent } from './grid-litiges-lignes/grid-litiges-lignes.component';
import { GridLogistiquesComponent } from './grid-logistiques/grid-logistiques.component';
import { GridMargeComponent } from './grid-marge/grid-marge.component';
import { GridOrdreLigneLogistiqueComponent } from './grid-ordre-ligne-logistique/grid-ordre-ligne-logistique.component';
import { GridSaveLogComponent } from './grid-save-log/grid-save-log.component';
import { GridSuiviComponent } from './grid-suivi/grid-suivi.component';
import { BonAFacturerComponent } from './indicateurs/bon-a-facturer/bon-a-facturer.component';
import { ClientsDepEncoursComponent } from './indicateurs/clients-dep-encours/clients-dep-encours.component';
import { CommandesTransitComponent } from './indicateurs/commandes-transit/commandes-transit.component';
import { GridClientsDepEncoursDetailComponent } from './indicateurs/grid-clients-dep-encours-detail/grid-clients-dep-encours-detail.component';
import { LitigesComponent } from './indicateurs/litiges/litiges.component';
import { OrdresNonCloturesComponent } from './indicateurs/ordres-non-clotures/ordres-non-clotures.component';
import { OrdresNonConfirmesComponent } from './indicateurs/ordres-non-confirmes/ordres-non-confirmes.component';
import { PlanningDepartComponent } from './indicateurs/planning-depart/planning-depart.component';
import { SupervisionLivraisonComponent } from './indicateurs/supervision-livraison/supervision-livraison.component';
import { OrdreService } from './ordre.service';
import { OrdresRoutingModule } from './ordres-routing.module';
import { RootComponent } from './root/root.component';


@NgModule({
  declarations: [
    OrdresAccueilComponent,
    OrdresDetailsComponent,
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
  ],
  imports: [
    OrdresRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DxNumberBoxModule,
    DxFormModule,
    DxTagBoxModule,
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxAccordionModule,
    DxAutocompleteModule,
    DxTileViewModule,
    DxListModule,
    DxSelectBoxModule,
    DxSortableModule,
    DxTabPanelModule,
    DxTextBoxModule,
    DxBoxModule,
    DxCheckBoxModule,
    DxTextAreaModule,
    DxPopoverModule,
    DxValidatorModule,
    EditingAlertModule,
    FileManagerModule,
    DxDateBoxModule,
    DxValidationGroupModule,
    DxLoadIndicatorModule,
    ViewDocumentPopupModule
  ],
  providers: [
    OrdresIndicatorsService,
    OrdreService,
    DatePipe,
    LocalizePipe,
  ],
})
export class OrdresModule { }
