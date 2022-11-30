import { Component, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent, DxFileUploaderComponent } from "devextreme-angular";
import { GridImportProgrammesComponent } from "./grid-import-programmes/grid-import-programmes.component";
import { confirm } from "devextreme/ui/dialog";
import { Program, ProgramService } from "app/shared/services/program.service";
import notify from "devextreme/ui/notify";


@Component({
  selector: "app-import-programmes-popup",
  templateUrl: "./import-programmes-popup.component.html",
  styleUrls: ["./import-programmes-popup.component.scss"]
})
export class ImportProgrammesPopupComponent implements OnChanges {

  @Input() program: { id: string, name: string, text: string };
  @Output() programID: string;
  @Output() title: string;

  public visible: boolean;
  public gridHasData: boolean;
  public popupFullscreen = false;
  public loadingMessage: string;
  public bodyName = ProgramService.bodyName;
  public buildAccept = ProgramService.buildAccept();
  public programService = ProgramService;
  public loading: boolean;

  @ViewChild(GridImportProgrammesComponent, { static: false }) gridComponent: GridImportProgrammesComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild(DxFileUploaderComponent, { static: false }) uploader: DxFileUploaderComponent;

  constructor(
    private localizeService: LocalizationService
  ) {
  }

  ngOnChanges() {
    this.loadingMessage = "";
    this.setTitle();
  }

  onBeforeSend(e) {
    this.gridComponent.datagrid.dataSource = null;
    this.loading = true;
    e.request.withCredentials = true;
    e.request.responseType = "json";
    this.gridComponent.datagrid.instance.beginCustomLoading("");
  }

  uploadUrl() {
    return this.programService.buildImportUrl(Program[this.program.name]);
  }

  onUploaded(e) {
    const DSitems = e.request?.response?.rows;
    DSitems.map((item, index) => {
      item.id = index;
      item.erreurs = item.erreurs.join(" / ");
      item.messages = item.messages.join(" / ");
    });

    this.gridComponent.datagrid.dataSource = DSitems;

    // Downloading modified Excel file
    this.programService.downloadAndSave();
    notify(
      this.localizeService.localize("telechargement-fichier").replace("&F", e.file.name),
      "success",
      7000
    );
    this.endLoading();
  }

  onUploadAborted(e) {
    this.endLoading();
    notify(this.localizeService.localize("chargement-fichier-interrompu"), "warning", 3000);
  }

  onUploadError(e) {
    this.endLoading();
    notify(`${e.message} : ${e.error?.response?.message}`, "error", 7000);
    console.log(e.message, e.error?.response);
  }

  endLoading() {
    this.gridComponent.datagrid.instance.endCustomLoading();
    this.loading = false;
  }

  setTitle() {
    if (this.program) {
      this.programID = this.program.id;
      this.title =
        this.localizeService.localize("title-import-programme-popup").replace("&P", this.program.text);
      this.loadingMessage = "fake";
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("import-programme-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
  }

  onHidden(e) {
    this.uploader.instance.reset();
    this.gridComponent.datagrid.dataSource = null;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  quitPopup() {
    if (this.loading) return;
    confirm(
      this.localizeService.localize("text-popup-quit"),
      this.localizeService.localize("title-import-programme-popup").replace(" &P", "")
    ).then(res => this.popup.visible = !res);
  }

}
