import {NgModule} from '@angular/core';
import {EntrepotsRoutingModule} from './entrepots-routing.module';
import {EntrepotsListComponent} from './list/entrepots-list.component';
import {EntrepotDetailsComponent} from './details/entrepot-details.component';
import {SharedModule} from '../../../shared/shared.module';
import {
    DxAccordionModule, DxBoxModule,
    DxButtonModule, DxCheckBoxModule,
    DxDataGridModule, DxDateBoxModule,
    DxFormModule, DxListModule, DxNumberBoxModule, DxPopoverModule, DxSelectBoxModule, DxTextAreaModule,
    DxTextBoxModule, DxValidatorModule
} from 'devextreme-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EditingGuard } from 'app/shared/guards/editing-guard';
import { EditingAlertModule } from 'app/shared/components/editing-alert/editing-alert.component';
import { ModificationListModule } from 'app/shared/components/modification-list/modification-list.component';


@NgModule({
  imports: [
      SharedModule,
      EntrepotsRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      DxFormModule,
      DxDataGridModule,
      DxAccordionModule,
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
      EditingAlertModule,
      ModificationListModule,
  ],
  declarations: [
    EntrepotsListComponent,
    EntrepotDetailsComponent
  ],
  providers: [NestedGuard, EditingGuard],
})
export class EntrepotsModule { }
