import { Component, ElementRef, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent, DxFileUploaderComponent } from "devextreme-angular";
import { GridImportProgrammesComponent } from "./grid-import-programmes/grid-import-programmes.component";
import { confirm } from "devextreme/ui/dialog";


@Component({
  selector: "app-import-programmes-popup",
  templateUrl: "./import-programmes-popup.component.html",
  styleUrls: ["./import-programmes-popup.component.scss"]
})
export class ImportProgrammesPopupComponent implements OnChanges {

  @Input() program: any;
  @Output() programID: string;
  @Output() title: string;

  public visible: boolean;
  public gridHasData: boolean;
  public popupFullscreen = false;
  public progressMessage: string;

  @ViewChild(GridImportProgrammesComponent, { static: false }) gridComponent: GridImportProgrammesComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  constructor(
    private localizeService: LocalizationService
  ) {
  }

  ngOnChanges() {
    this.progressMessage = "";
    this.setTitle();
  }

  download() {

  }

  setTitle() {
    if (this.program) {
      this.programID = this.program.id;
      this.title =
        this.localizeService.localize("title-import-programme-popup").replace("&P", this.program.text);
      this.progressMessage = "Fin duplication vers la SA";
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("import-programme-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  quitPopup() {
    confirm(
      this.localizeService.localize("text-popup-quit"),
      this.localizeService.localize("title-import-programme-popup").replace(" &P", "")
    ).then(res => this.popup.visible = !res);
  }

}
