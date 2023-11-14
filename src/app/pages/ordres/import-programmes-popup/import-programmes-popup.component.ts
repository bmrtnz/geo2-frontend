import { Component, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { ConfirmationResultPopupComponent } from "app/shared/components/confirmation-result-popup/confirmation-result-popup.component";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FluxEnvoisService } from "app/shared/services/flux-envois.service";
import { Program, ProgramService } from "app/shared/services/program.service";
import {
  DxFileUploaderComponent,
  DxPopupComponent,
  DxScrollViewComponent,
} from "devextreme-angular";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { lastValueFrom, } from "rxjs";
import { GridImportProgrammesComponent } from "./grid-import-programmes/grid-import-programmes.component";
import { DocumentsOrdresPopupComponent } from "../documents-ordres-popup/documents-ordres-popup.component";
import { FunctionsService } from "app/shared/services/api/functions.service";

@Component({
  selector: "app-import-programmes-popup",
  templateUrl: "./import-programmes-popup.component.html",
  styleUrls: ["./import-programmes-popup.component.scss"],
})
export class ImportProgrammesPopupComponent implements OnChanges {
  @Input() program: { id: string; name: string; text: string };
  @Output() programID: string;
  @Output() shown: boolean;

  @ViewChild(ConfirmationResultPopupComponent)
  resultPopup: ConfirmationResultPopupComponent;
  @ViewChild(DocumentsOrdresPopupComponent)
  docsPopup: DocumentsOrdresPopupComponent;

  public visible: boolean;
  public gridHasData: boolean;
  public popupFullscreen = false;
  public loadingMessage: string;
  public bodyName = ProgramService.bodyName;
  public buildAccept = ProgramService.buildAccept();
  public customUploadData;
  public loading: boolean;
  public title: string;

  @ViewChild(GridImportProgrammesComponent, { static: false })
  gridComponent: GridImportProgrammesComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;
  @ViewChild(DxFileUploaderComponent, { static: false })
  uploader: DxFileUploaderComponent;

  constructor(
    private localizeService: LocalizationService,
    private programService: ProgramService,
    private envoisService: EnvoisService,
    private ordresService: OrdresService,
    private currentCompanyService: CurrentCompanyService,
    private functionsService: FunctionsService,
    private authService: AuthService,
  ) { }

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
    if (this.programID === "tesco")
      this.customUploadData = this.programService.buildCustomData(false);
    chooseFileButton.click();
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

  async onUploaded(e: { request: XMLHttpRequest }) {
    const DSitems = e.request?.response?.rows;

    if (e.request.status !== 200)
      return notify("L'import du programme a échoué", "error", 7000);

    if (!DSitems?.length) return this.noDataError();

    if ([Program.PRÉORDRES, Program.ORCHARD].map(p => p.toString()).includes(this.programID)) {
      const ordreNums = DSitems.filter(item => !item.erreurs.length).map(item => item.ordreNum);
      const response = await this.handleConfirmationsCommande(ordreNums);
      response.forEach(({ ordreNum, envoisDone }) => {
        const row = DSitems.find(item => item.ordreNum === ordreNum);
        if (row) row.messages.push(envoisDone
          ? "Confirmation d'ordre envoyée !!"
          : "Confirmation d'ordre N'EST PAS envoyée !!",
        )
      });
    }

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

  setSpecialColumnHeader() {
    if (this.gridComponent?.datagrid) {
      const header = `ordres-program-loadRef-${this.program?.id === Program.PRÉORDRES ? "preordres" : "others"}`;
      this.gridComponent.datagrid.instance
        .columnOption(
          "loadRef",
          "caption",
          this.localizeService.localize(header)
        );
    }
  }

  onShowing(e) {
    this.shown = false;
    e.component.content().parentNode.classList.add("import-programme-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.setSpecialColumnHeader();
    this.shown = true;
  }

  onHidden(e) {
    this.shown = false;
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

  /** Handle "confirmation popup" for the provided orders */
  private async handleConfirmationsCommande(ordreNums: Array<Ordre["numero"]>) {
    const response: { ordreNum: Ordre["numero"], envoisDone: boolean }[] = [];
    const flux = "ORDRE";
    const { id, campagne } = this.currentCompanyService.getCompany();
    for (const num of ordreNums) {
      try {
        const res = await lastValueFrom(this.ordresService
          .getOneByNumeroAndSocieteAndCampagne(num, id, campagne.id, ["id", "numero", "type.id"]));
        const ordre = res.data.ordreByNumeroAndSocieteAndCampagne;
        await lastValueFrom(this.functionsService
          .geoPrepareEnvois(
            ordre.id,
            flux,
            true,
            false,
            this.authService.currentUser.nomUtilisateur
          ));
        const envois = await lastValueFrom(this.envoisService.getList(
          `ordre.id==${ordre.id} and traite==A and flux.id==${flux}`,
          ["id"],
        ));
        await lastValueFrom(this.envoisService
          .saveAll(envois.data.allEnvoisList.map(({ id }) => ({ id, traite: 'N' })), new Set(["id"])));
        response.push({ ordreNum: num, envoisDone: true });
      } catch (error) {
        console.error(`Erreur lors de l'envoi automatique pour l'ordre numero ${num}`, error);
        response.push({ ordreNum: num, envoisDone: false });
      }
    }
    return response;
  }
}
