import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  DxListModule,
  DxLoadIndicatorModule,
  DxPopoverModule, DxSelectBoxModule,

  DxSortableModule, DxTabPanelModule,
  DxTagBoxModule,
  DxTextAreaModule, DxTextBoxModule,
  DxTileViewModule, DxValidationGroupModule, DxValidatorModule
} from 'devextreme-angular';
import { GridSuiviComponent } from './grid-suivi/grid-suivi.component';
import { GridLignesComponent } from './grid-lignes/grid-lignes.component';
// import { GridHistoriqueComponent } from './grid-historique/grid-historique.component';


@NgModule({
  declarations: [OrdresAccueilComponent, OrdresDetailsComponent, GridSuiviComponent, OrdresIndicateursComponent, GridLignesComponent],
  imports: [
    OrdresRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DxFormModule,
    DxTagBoxModule,
    DxDataGridModule,
    DxButtonModule,
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
  ]
})
export class OrdresModule { }
