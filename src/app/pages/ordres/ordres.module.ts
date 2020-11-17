import { NgModule } from '@angular/core';
<<<<<<< HEAD
import { CommonModule } from '@angular/common';
import { OrdresAccueilComponent } from './accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from './details/ordres-details.component';
import { OrdresIndicateursComponent } from './indicateurs/ordres-indicateurs.component';
import { OrdresRoutingModule } from './ordres-routing.module';
import { SharedModule } from 'app/shared/shared.module';
=======
>>>>>>> 5c172372492ad4e4c6fe94b0a3a38c579e69a345
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditingAlertModule } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerModule } from 'app/shared/components/file-manager/file-manager-popup.component';
import { SharedModule } from 'app/shared/shared.module';
import {
  DxAccordionModule, DxBoxModule, DxButtonModule,

  DxCheckBoxModule, DxDataGridModule, DxFormModule,
  DxListModule,
  DxPopoverModule, DxSelectBoxModule,

  DxSortableModule, DxTabPanelModule,
  DxTagBoxModule,
  DxTextAreaModule, DxTextBoxModule,
  DxTileViewModule, DxValidatorModule
} from 'devextreme-angular';
import { OrdresAccueilComponent } from './accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from './details/ordres-details.component';
import { GridSuiviComponent } from './grid-suivi/grid-suivi.component';
import { OrdresRoutingModule } from './ordres-routing.module';


@NgModule({
<<<<<<< HEAD
  declarations: [OrdresAccueilComponent, OrdresDetailsComponent, OrdresIndicateursComponent],
=======
  declarations: [OrdresAccueilComponent, OrdresDetailsComponent, GridSuiviComponent],
>>>>>>> 5c172372492ad4e4c6fe94b0a3a38c579e69a345
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
    FileManagerModule
  ]
})
export class OrdresModule { }
