import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrdresAccueilComponent } from './accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from './details/ordres-details.component';
import { OrdresIndicateursComponent } from './indicateurs/ordres-indicateurs.component';
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


@NgModule({
  declarations: [
    OrdresAccueilComponent,
    OrdresDetailsComponent,
    GridSuiviComponent,
    OrdresIndicateursComponent,
    GridLignesComponent,
    GridHistoriqueComponent,
    LitigesComponent,
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
