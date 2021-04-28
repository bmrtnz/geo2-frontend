import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrdresAccueilComponent } from './accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from './details/ordres-details.component';
import { OrdresRoutingModule } from './ordres-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditingAlertModule } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerModule } from 'app/shared/components/file-manager/file-manager-popup.component';
import { SharedModule } from 'app/shared/shared.module';
import {
  DxAccordionModule, DxBoxModule, DxButtonModule,
  DxAutocompleteModule,
  DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFormModule,
  DxPopupModule,
  DxListModule,
  DxLoadIndicatorModule,
  DxPopoverModule, DxSelectBoxModule,
  DxSortableModule, DxTabPanelModule,
  DxTagBoxModule,
  DxTextAreaModule, DxTextBoxModule, DxNumberBoxModule,
  DxTileViewModule, DxValidationGroupModule, DxValidatorModule
} from 'devextreme-angular';
import { GridSuiviComponent } from './grid-suivi/grid-suivi.component';
import { GridLignesComponent } from './grid-lignes/grid-lignes.component';
import { GridHistoriqueComponent } from './grid-historique/grid-historique.component';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { LitigesComponent } from './indicateurs/litiges/litiges.component';
import { GridLogistiquesComponent } from './grid-logistiques/grid-logistiques.component';
import { BonAFacturerComponent } from './indicateurs/bon-a-facturer/bon-a-facturer.component';
import { SupervisionLivraisonComponent } from './indicateurs/supervision-livraison/supervision-livraison.component';
import { OrdresNonCloturesComponent } from './indicateurs/ordres-non-clotures/ordres-non-clotures.component';
import { OrdresNonConfirmesComponent } from './indicateurs/ordres-non-confirmes/ordres-non-confirmes.component';
import { PlanningDepartComponent } from './indicateurs/planning-depart/planning-depart.component';
import { CommandesTransitComponent } from './indicateurs/commandes-transit/commandes-transit.component';
import { ClientsDepEncoursComponent } from './indicateurs/clients-dep-encours/clients-dep-encours.component';


@NgModule({
  declarations: [
    OrdresAccueilComponent,
    OrdresDetailsComponent,
    GridSuiviComponent,
    GridLignesComponent,
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
  ],
  providers: [
    OrdresIndicatorsService,
    DatePipe,
  ],
})
export class OrdresModule { }
