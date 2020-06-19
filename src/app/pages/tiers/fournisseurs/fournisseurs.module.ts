import {NgModule} from '@angular/core';

import {FournisseursRoutingModule} from './fournisseurs-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import { FournisseursListComponent } from './list/fournisseurs-list.component';
import {
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule, DxTagBoxModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
    DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FournisseurDetailsComponent } from './details/fournisseur-details.component';
import {HistoriqueValideModule} from '../../../shared/components/historique-valide/historique-valide.component';


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
        DxPopoverModule,
        DxNumberBoxModule,
        DxValidatorModule,
        HistoriqueValideModule
    ],
  declarations: [
    FournisseursListComponent,
    FournisseurDetailsComponent
  ]
})
export class FournisseursModule { }


