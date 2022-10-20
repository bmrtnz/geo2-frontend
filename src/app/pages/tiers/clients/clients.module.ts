import { NgModule } from "@angular/core";
import { ClientsRoutingModule } from "./clients-routing.module";
import { ClientsListComponent } from "./list/clients-list.component";
import { ClientDetailsComponent } from "./details/client-details.component";
import { SharedModule } from "../../../shared/shared.module";
import {
  DxAccordionModule,
  DxBoxModule,
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxFormModule,
  DxListModule,
  DxNumberBoxModule,
  DxPopoverModule,
  DxSelectBoxModule,
  DxSwitchModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidatorModule,
  DxTagBoxModule,
  DxDateBoxModule,
  DxPopupModule,
  DxScrollViewModule,
} from "devextreme-angular";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PushHistoryPopupModule } from "../../../shared/components/push-history-popup/push-history-popup.component";
import { HistoriqueValideModule } from "app/shared/components/historique-valide/historique-valide.component";
import { NestedGuard } from "app/shared/guards/nested-guard";
import { EntrepotsModule } from "../entrepots/entrepots.module";
import { EditingAlertModule } from "app/shared/components/editing-alert/editing-alert.component";
import { EditingGuard } from "app/shared/guards/editing-guard";
import { FileManagerModule } from "app/shared/components/file-manager/file-manager-popup.component";
import { ModificationListModule } from "app/shared/components/modification-list/modification-list.component";
import { InfoPopupModule } from "app/shared/components/info-popup/info-popup.component";
import { OrderHistoryPopupComponent } from "./order-history/order-history-popup.component";
import { GridOrderHistoryComponent } from "./order-history/grid-order-history/grid-order-history.component";
import { ArticlesModule } from "app/pages/articles/articles.module";
import { ZoomArticlePopupComponent } from "app/pages/ordres/zoom-article-popup/zoom-article-popup.component";

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
    DxPopupModule,
    DxTagBoxModule,
    DxListModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxBoxModule,
    DxScrollViewModule,
    DxCheckBoxModule,
    DxTextAreaModule,
    DxPopoverModule,
    DxNumberBoxModule,
    DxValidatorModule,
    DxSwitchModule,
    DxDateBoxModule,
    HistoriqueValideModule,
    PushHistoryPopupModule,
    InfoPopupModule,
    EditingAlertModule,
    ModificationListModule,
    FileManagerModule,
    ArticlesModule,
  ],
  declarations: [
    ClientsListComponent,
    ClientDetailsComponent,
    OrderHistoryPopupComponent,
    GridOrderHistoryComponent,
    ZoomArticlePopupComponent
  ],
  providers: [NestedGuard, EditingGuard],
  exports: [ClientDetailsComponent, OrderHistoryPopupComponent, GridOrderHistoryComponent]
})
export class ClientsModule { }
