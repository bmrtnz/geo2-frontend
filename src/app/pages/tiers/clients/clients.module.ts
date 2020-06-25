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


@NgModule({
    imports: [
        SharedModule,
        ClientsRoutingModule,
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
    ],
    declarations: [
        ClientsListComponent,
        ClientDetailsComponent
    ]
})
export class ClientsModule { }
