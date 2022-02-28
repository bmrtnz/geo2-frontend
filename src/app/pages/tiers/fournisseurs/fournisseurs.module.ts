import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CertificationDatePopupModule } from "app/shared/components/certification-date-popup/certification-date-popup.component";
import { EditingAlertModule } from "app/shared/components/editing-alert/editing-alert.component";
import { FileManagerModule } from "app/shared/components/file-manager/file-manager-popup.component";
import { EditingGuard } from "app/shared/guards/editing-guard";
import { NestedGuard } from "app/shared/guards/nested-guard";
import {
    DxAccordionModule,
    DxBoxModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxFormModule,
    DxListModule,
    DxNumberBoxModule,
    DxPopoverModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxTextAreaModule,
    DxTextBoxModule,
    DxValidatorModule,
} from "devextreme-angular";
import { HistoriqueValideModule } from "../../../shared/components/historique-valide/historique-valide.component";
import { PushHistoryPopupModule } from "../../../shared/components/push-history-popup/push-history-popup.component";
import { SharedModule } from "../../../shared/shared.module";
import { FournisseurDetailsComponent } from "./details/fournisseur-details.component";
import { FournisseursRoutingModule } from "./fournisseurs-routing.module";
import { InfoPopupModule } from "app/shared/components/info-popup/info-popup.component";
import { FournisseursListComponent } from "./list/fournisseurs-list.component";
import { ModificationListModule } from "app/shared/components/modification-list/modification-list.component";

@NgModule({
    imports: [
        SharedModule,
        FournisseursRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        DxFormModule,
        DxDataGridModule,
        DxTagBoxModule,
        DxButtonModule,
        DxAccordionModule,
        DxListModule,
        DxSelectBoxModule,
        DxTextBoxModule,
        DxBoxModule,
        DxCheckBoxModule,
        DxTextAreaModule,
        DxDateBoxModule,
        DxPopoverModule,
        DxNumberBoxModule,
        DxValidatorModule,
        HistoriqueValideModule,
        PushHistoryPopupModule,
        EditingAlertModule,
        InfoPopupModule,
        FileManagerModule,
        CertificationDatePopupModule,
        ModificationListModule,
    ],
    declarations: [FournisseursListComponent, FournisseurDetailsComponent],
    providers: [NestedGuard, EditingGuard],
})
export class FournisseursModule {}
