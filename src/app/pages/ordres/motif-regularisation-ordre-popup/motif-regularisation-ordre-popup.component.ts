import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { LitigeCausesService } from "app/shared/services/api/litige-causes.service";
import {
  DxCheckBoxComponent,
  DxListComponent,
  DxPopupComponent,
  DxRadioGroupComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";

@Component({
  selector: "app-motif-regularisation-ordre-popup",
  templateUrl: "./motif-regularisation-ordre-popup.component.html",
  styleUrls: ["./motif-regularisation-ordre-popup.component.scss"],
})
export class MotifRegularisationOrdrePopupComponent {
  @Output() whenQuitRegulPopup = new EventEmitter<any>();

  dataSource: DataSource;
  motifDataSource: DataSource;
  visible: boolean;
  motif: string;
  typesRegul: string[];
  running: boolean;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxListComponent, { static: false }) motiflist: DxListComponent;
  @ViewChild("conserverDetail", { static: false })
  conserverDetail: DxCheckBoxComponent;
  @ViewChild("typeRegul", { static: false }) typeRegul: DxRadioGroupComponent;

  constructor(public motifsService: LitigeCausesService) {
    this.typesRegul = ["Prix uniquement", "Prix + poids"];
  }

  enableFilters() {
    this.motifDataSource = this.motifsService.getDataSource_v2([
      "id",
      "description",
    ]);
    this.motifDataSource.filter([
      ["valide", "=", true],
      "and",
      ["indicateurRegularisation", "=", true],
    ]);
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("motif-regularisation-ordre-popup");
    this.motiflist.selectedItemKeys = null;
    this.enableFilters();
    this.dataSource = this.motifDataSource;
    this.motiflist.instance.repaint();
  }

  onHiding() {
    this.motif = null;
    this.typeRegul.value = null;
    this.conserverDetail.value = false;
  }

  onHidden() {
    this.running = false;
  }

  onSelectionChanged(e) {
    // Only one item can be selected at once
    if (this.motiflist.selectedItems.length)
      this.motiflist.selectedItemKeys.shift();
    this.motif = e.addedItems[0]?.id;
  }

  hidePopup() {
    this.popup.visible = false;
  }

  applyClick() {
    this.running = true;
    const infosMotif = {
      lcaCode: this.motif,
      typeReg: this.typeRegul.value === this.typesRegul[0] ? "RPR" : "RPO",
      indDetail: this.conserverDetail.value,
    };
    this.whenQuitRegulPopup.emit(infosMotif);
    this.hidePopup();
  }

  cancelClick() {
    this.whenQuitRegulPopup.emit();
    this.hidePopup();
  }
}
