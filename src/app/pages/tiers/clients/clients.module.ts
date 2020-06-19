import {NgModule} from '@angular/core';
import {ClientsRoutingModule} from './clients-routing.module';
import {ClientsListComponent} from './list/clients-list.component';
import {ClientDetailsComponent} from './details/client-details.component';
import {SharedModule} from '../../../shared/shared.module';
import {
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
    DxTextBoxModule, DxValidatorModule, DxDateBoxModule
} from 'devextreme-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HistoriqueValideModule} from '../../../shared/components/historique-valide/historique-valide.component';
import {PromptPopupModule} from '../../../shared/components/prompt-popup/prompt-popup.component';


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
        DxListModule,
        DxSelectBoxModule,
        DxTextBoxModule,
        DxBoxModule,
        DxCheckBoxModule,
        DxTextAreaModule,
        DxPopoverModule,
        DxNumberBoxModule,
        DxValidatorModule,
        DxDateBoxModule,
        HistoriqueValideModule,
        PromptPopupModule
    ],
  declarations: [
    ClientsListComponent,
    ClientDetailsComponent
  ]
})
export class ClientsModule { }
