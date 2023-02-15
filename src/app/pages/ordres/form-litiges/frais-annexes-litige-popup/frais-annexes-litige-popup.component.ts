import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxListComponent, DxPopupComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { GridFraisAnnexesLitigeComponent } from "./grid-frais-annexes-litige/grid-frais-annexes-litige.component";


@Component({
  selector: "app-frais-annexes-litige-popup",
  templateUrl: "./frais-annexes-litige-popup.component.html",
  styleUrls: ["./frais-annexes-litige-popup.component.scss"]
})
export class FraisAnnexesLitigePopupComponent implements OnChanges {

  @Input() public litigeID: any;
  @Output() public idLitige: string;
  @Output() public updateTotalFraisLitige = new EventEmitter();

  public visible: boolean;
  public titleStart: string;
  public titleEnd: string;
  public popupFullscreen = false;


  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(GridFraisAnnexesLitigeComponent, { static: false }) datagridComponent: GridFraisAnnexesLitigeComponent;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    if (this.litigeID) {
      this.idLitige = this.litigeID;
      this.setTitle();
    }
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("title-frais-annexes-litiges-popup");
    this.titleEnd = "n° " + this.litigeID;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("frais-annexes-litige-popup");
  }

  onShown(e) {
    this.datagridComponent.enableFilters();
  }

  hidePopup() {
    this.datagridComponent.datagrid.dataSource = null;
    this.popup.visible = false;
  }

  exitPopup() {
    if (this.datagridComponent?.datagrid?.instance?.hasEditData()) {
      this.datagridComponent.datagrid.instance.cancelEditData();
    }
    setTimeout(() => this.hidePopup());
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  updateTotalFrais() {
    this.updateTotalFraisLitige.emit();
  }

}



