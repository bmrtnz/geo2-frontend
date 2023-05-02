import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CustomCellTemplatesModule } from "app/custom-cell-templates/custom-cell-templates.module";
import { ChooseEntrepotPopupModule } from "app/shared/components/choose-entrepot-popup/choose-entrepot-popup.component";
import { ChooseOrdrePopupModule } from "app/shared/components/choose-ordre-popup/choose-ordre-popup.component";
import { ConfirmationResultPopupModule } from "app/shared/components/confirmation-result-popup/confirmation-result-popup.component";
import { SharedModule } from "app/shared/shared.module";
import {
  DxBoxModule,
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxListModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxTextBoxModule,
} from "devextreme-angular";
import { ForfaitLitigePopupComponent } from "../forfait-litige-popup/forfait-litige-popup.component";
import { GridForfaitLitigeComponent } from "../forfait-litige-popup/grid-forfait-litige/grid-forfait-litige.component";
import { FraisAnnexesLitigePopupComponent } from "../form-litiges/frais-annexes-litige-popup/frais-annexes-litige-popup.component";
import { GridFraisAnnexesLitigeComponent } from "../form-litiges/frais-annexes-litige-popup/grid-frais-annexes-litige/grid-frais-annexes-litige.component";
import { GestionOperationsPopupComponent } from "../gestion-operations-popup/gestion-operations-popup.component";
import { GridLitigesLignesComponent } from "../grid-litiges-lignes/grid-litiges-lignes.component";
import { LitigeCloturePopupComponent } from "../indicateurs/litiges/litige-cloture-popup/litige-cloture-popup.component";
import { SelectionLignesLitigePopupComponent } from "../selection-lignes-litige-popup/selection-lignes-litige-popup.component";
import { GridLotComponent } from "./grid-lot/grid-lot.component";

@NgModule({
  declarations: [
    GridLitigesLignesComponent,
    LitigeCloturePopupComponent,
    FraisAnnexesLitigePopupComponent,
    GridFraisAnnexesLitigeComponent,
    SelectionLignesLitigePopupComponent,
    GestionOperationsPopupComponent,
    ForfaitLitigePopupComponent,
    GridForfaitLitigeComponent,
    GridLotComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    CustomCellTemplatesModule,
    ChooseEntrepotPopupModule,
    ChooseOrdrePopupModule,
    ConfirmationResultPopupModule,
    DxDataGridModule,
    DxBoxModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxButtonModule,
    DxFormModule,
    DxPopupModule,
    DxListModule,
    DxScrollViewModule,
    DxRadioGroupModule,
    DxSelectBoxModule,
  ],
  exports: [
    GestionOperationsPopupComponent,
    GridLitigesLignesComponent,
    LitigeCloturePopupComponent,
    FraisAnnexesLitigePopupComponent,
    SelectionLignesLitigePopupComponent,
  ],
})
export class GestionLitigesModule {}
