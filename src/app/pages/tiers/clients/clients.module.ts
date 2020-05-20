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
    DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ClientHomeComponent} from './home/client-home.component';


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
        DxSwitchModule
    ],
    exports: [
        // ClientsListComponent
    ],
    declarations: [
        ClientsListComponent,
        ClientHomeComponent,
        ClientDetailsComponent
    ]
})
export class ClientsModule { }
