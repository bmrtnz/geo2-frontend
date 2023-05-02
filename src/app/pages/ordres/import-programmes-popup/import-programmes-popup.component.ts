import { Component, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { Program, ProgramService } from "app/shared/services/program.service";
import {
  DxFileUploaderComponent,
  DxPopupComponent,
  DxScrollViewComponent,
} from "devextreme-angular";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { GridImportProgrammesComponent } from "./grid-import-programmes/grid-import-programmes.component";

@Component({
  selector: "app-import-programmes-popup",
  templateUrl: "./import-programmes-popup.component.html",
  styleUrls: ["./import-programmes-popup.component.scss"],
})
export class ImportProgrammesPopupComponent implements OnChanges {
  @Input() program: { id: string; name: string; text: string };
  @Output() programID: string;
  @Output() title: string;

  public visible: boolean;
  public gridHasData: boolean;
  public popupFullscreen = false;
  public loadingMessage: string;
  public bodyName = ProgramService.bodyName;
  public buildAccept = ProgramService.buildAccept();
  public customUploadData;
  public loading: boolean;

  @ViewChild(GridImportProgrammesComponent, { static: false })
  gridComponent: GridImportProgrammesComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;
  @ViewChild(DxFileUploaderComponent, { static: false })
  uploader: DxFileUploaderComponent;

  constructor(
    private localizeService: LocalizationService,
    private programService: ProgramService
  ) {}

  ngOnChanges() {
    this.loadingMessage = "";
    this.setTitle();
  }

  uploadUrl() {
    return ProgramService.buildImportUrl(Program[this.program.name]);
  }

  onClickUpload() {
    const chooseFileButton = document.querySelector(
      ".import-programme-popup .dx-fileuploader-button"
    ) as HTMLElement;
    if (this.programID === "tesco") {
      this.customUploadData = this.programService.buildCustomData(false);
      chooseFileButton.click();
    } else {
      chooseFileButton.click();
    }
  }

  onBeforeSend(e) {
    this.loading = true;
    this.gridComponent.datagrid.dataSource = null;
    ProgramService.setupUploadRequest(e.request);
  }

  onProgress(e) {
    const progressStatut = document.querySelector(
      ".import-programme-popup .dx-progressbar-status"
    ) as HTMLElement;
    if (progressStatut?.innerHTML === "100%") {
      progressStatut.innerHTML = this.localizeService.localize(
        "traitement-en-cours"
      );
      this.gridComponent.datagrid.instance.beginCustomLoading("");
    }
  }

  onUploaded(e: { request: XMLHttpRequest }) {
    const DSitems = e.request?.response?.rows;

    if (e.request.status !== 200)
      return notify("L'import du programme a échoué", "error", 7000);

    if (!DSitems?.length) return this.noDataError();

    DSitems.map((item, index) => {
      item.id = index;
      item.erreurs = item.erreurs.join(" / ");
      item.messages = item.messages.join(" / ");
    });

    this.gridComponent.datagrid.dataSource = DSitems;

    // Downloading modified Excel file
    ProgramService.downloadAndSave();
    notify(
      this.localizeService.localize("telechargement-fichier-retour"),
      "success",
      7000
    );
    this.endLoading();
  }

  onUploadAborted(e) {
    this.endLoading();
    notify(
      this.localizeService.localize("chargement-fichier-interrompu"),
      "warning",
      3000
    );
  }

  onUploadError(e) {
    this.endLoading();
    notify(`${e.message} : ${e.error?.response?.message}`, "error", 7000);
    console.log(e.message, e.error?.response);
  }

  noDataError() {
    this.endLoading();
    notify(
      this.localizeService.localize("aucune-donnee-recuperee"),
      "warning",
      7000
    );
  }

  endLoading() {
    this.gridComponent.datagrid.instance.endCustomLoading();
    this.loading = false;
  }

  setTitle() {
    if (this.program) {
      this.programID = this.program.id;
      this.title = this.localizeService
        .localize("title-import-programme-popup")
        .replace("&P", this.program.text);
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
    if (this.loading) {
      confirm(
        this.localizeService.localize("text-popup-quit"),
        this.localizeService
          .localize("title-import-programme-popup")
          .replace(" &P", "")
      ).then((res) => (this.popup.visible = !res));
    } else {
      this.popup.visible = false;
    }
  }
}
