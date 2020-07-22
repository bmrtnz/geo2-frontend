import {NgModule} from '@angular/core';
import {ClientsRoutingModule} from './clients-routing.module';
import {ClientsListComponent} from './list/clients-list.component';
import {ClientDetailsComponent} from './details/client-details.component';
import {SharedModule} from '../../../shared/shared.module';
import {
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxSwitchModule, DxTextAreaModule,
    DxTextBoxModule, DxValidatorModule, DxTagBoxModule, DxDateBoxModule
} from 'devextreme-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HistoriqueValideModule } from 'app/shared/components/historique-valide/historique-valide.component';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EntrepotsModule } from '../entrepots/entrepots.module';
import { EditingAlertModule } from 'app/shared/components/editing-alert/editing-alert.component';
import { EditingGuard } from 'app/shared/guards/editing-guard';


@NgModule({
    imports: [
        SharedModule,
        ClientsRoutingModule,
        EntrepotsModule,
        FormsModule,
        ReactiveFormsModule,
        DxFormModule,
        DxDataGridModule,
        DxButtonModule,
        DxAccordionModule,
        DxTagBoxModule,
        DxListModule,
        DxSelectBoxModule,
        DxTextBoxModule,
        DxBoxModule,
        DxCheckBoxModule,
        DxTextAreaModule,
        DxPopoverModule,
        DxNumberBoxModule,
        DxValidatorModule,
        DxSwitchModule,
        DxDateBoxModule,
        HistoriqueValideModule,
        EditingAlertModule,
    ],
    declarations: [
        ClientsListComponent,
        ClientDetailsComponent
    ],
    providers: [NestedGuard, EditingGuard],
})
export class ClientsModule { }
