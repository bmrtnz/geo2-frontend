import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent } from "devextreme-angular";
import { GridForfaitLitigeComponent } from "./grid-forfait-litige/grid-forfait-litige.component";

@Component({
  selector: "app-forfait-litige-popup",
  templateUrl: "./forfait-litige-popup.component.html",
  styleUrls: ["./forfait-litige-popup.component.scss"],
})
export class ForfaitLitigePopupComponent implements OnChanges {
  @Input() public infosLitige: any;
  @Output() public litige: any;

  public visible: boolean;
  public title: string;
  public popupFullscreen = false;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(GridForfaitLitigeComponent, { static: false })
  datagridComponent: GridForfaitLitigeComponent;

  constructor(private localizeService: LocalizationService) {}

  ngOnChanges() {
    if (this.infosLitige) {
      this.litige = this.infosLitige;
      this.setTitle();
    }
  }

  setTitle() {
    this.title = this.localizeService.localize("title-forfait-litige-popup");
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("forfait-litige-popup");
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
}
