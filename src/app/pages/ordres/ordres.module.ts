import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdresAccueilComponent } from './accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from './details/ordres-details.component';
import { OrdresRoutingModule } from './ordres-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DxBoxModule, DxButtonModule, DxDataGridModule, DxFormModule, DxTabPanelModule, 
  DxTagBoxModule, DxTemplateModule, DxAccordionModule, DxListModule, DxSelectBoxModule,
  DxTextBoxModule, DxCheckBoxModule, DxTextAreaModule, DxPopoverModule, DxValidatorModule,
  DxSortableModule, DxTileViewModule
  } from 'devextreme-angular';
import { EditingAlertModule } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerModule } from 'app/shared/components/file-manager/file-manager-popup.component';


@NgModule({
  declarations: [OrdresAccueilComponent, OrdresDetailsComponent],
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
