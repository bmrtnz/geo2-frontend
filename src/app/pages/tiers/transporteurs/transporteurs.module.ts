import { NgModule } from "@angular/core";
import { TransporteursRoutingModule } from "./transporteurs-routing.module";
import { TransporteursListComponent } from "./list/transporteurs-list.component";
import { TransporteurDetailsComponent } from "./details/transporteur-details.component";
import { SharedModule } from "../../../shared/shared.module";
import {
  DxAccordionModule,
  DxBoxModule,
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxFormModule,
  DxListModule,
  DxPopoverModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxValidatorModule,
} from "devextreme-angular";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NestedGuard } from "app/shared/guards/nested-guard";
import { EditingGuard } from "app/shared/guards/editing-guard";
import { EditingAlertModule } from "app/shared/components/editing-alert/editing-alert.component";
import { InfoPopupModule } from "app/shared/components/info-popup/info-popup.component";
import { FileManagerModule } from "app/shared/components/file-manager/file-manager-popup.component";
import { ModificationListModule } from "app/shared/components/modification-list/modification-list.component";
import { PushHistoryPopupModule } from "../../../shared/components/push-history-popup/push-history-popup.component";
import { HistoriqueValideModule } from "app/shared/components/historique-valide/historique-valide.component";

@NgModule({
  imports: [
    SharedModule,
    TransporteursRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DxFormModule,
    DxDataGridModule,
    DxButtonModule,
    DxNumberBoxModule,
    DxAccordionModule,
    DxListModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxBoxModule,
    DxCheckBoxModule,
    DxTextAreaModule,
    DxPopoverModule,
    DxValidatorModule,
    EditingAlertModule,
    InfoPopupModule,
    FileManagerModule,
    ModificationListModule,
    HistoriqueValideModule,
    PushHistoryPopupModule
  ],
  declarations: [TransporteursListComponent, TransporteurDetailsComponent],
  providers: [NestedGuard, EditingGuard],
  exports: [TransporteurDetailsComponent]
})
export class TransporteursModule { }
