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

  DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFormModule,
  DxListModule,
  DxPopoverModule, DxSelectBoxModule,

  DxSortableModule, DxTabPanelModule,
  DxTagBoxModule,
  DxTextAreaModule, DxTextBoxModule,
  DxTileViewModule, DxValidatorModule
} from 'devextreme-angular';
import { GridSuiviComponent } from './grid-suivi/grid-suivi.component';


@NgModule({
  declarations: [OrdresAccueilComponent, OrdresDetailsComponent, GridSuiviComponent, OrdresIndicateursComponent],
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
    FileManagerModule,
    DxDateBoxModule,
  ]
})
export class OrdresModule { }
