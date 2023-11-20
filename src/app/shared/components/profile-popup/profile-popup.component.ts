import { Component, NgModule, ViewChild } from "@angular/core";
import { SharedModule } from "../../shared.module";
import notify from "devextreme/ui/notify";
import {
  DxButtonModule,
  DxDateBoxModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxCheckBoxModule,
  DxSwitchModule,
  DxPopupModule,
  DxScrollViewModule,
  DxTextAreaModule,
  DxValidatorModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxFormModule,
  DxCheckBoxComponent,
  DxScrollViewComponent,
  DxValidatorComponent,
  DxDateBoxComponent,
} from "devextreme-angular";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, LocalizationService } from "app/shared/services";
import { DateManagementService } from "app/shared/services/date-management.service";
import { UtilisateursService } from "app/shared/services/api/utilisateurs.service";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import Utilisateur from "app/shared/models/utilisateur.model";
import Alerte from "app/shared/models/alerte.model";
import { AlertesService } from "app/shared/services/api/alert.service";
import { FunctionsService } from "app/shared/services/api/functions.service";

let self;

@Component({
  selector: "app-profile-popup",
  templateUrl: "./profile-popup.component.html",
  styleUrls: ["./profile-popup.component.scss"]
})
export class ProfilePopupComponent {

  @ViewChild("bandeauDateDebCB", { static: false }) bandeauDateDebCB: DxCheckBoxComponent;
  @ViewChild("bandeauDateFinCB", { static: false }) bandeauDateFinCB: DxCheckBoxComponent;
  @ViewChild("dateDeb", { static: false }) dateDeb: DxDateBoxComponent;
  @ViewChild("dateFin", { static: false }) dateFin: DxDateBoxComponent;
  @ViewChild("dateDebValidator", { static: false }) dateDebValidator: DxValidatorComponent;
  @ViewChild("dateFinValidator", { static: false }) dateFinValidator: DxValidatorComponent;
  @ViewChild("messageValidator", { static: false }) messageValidator: DxValidatorComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  public visible: boolean;
  public titleStart: string;
  public titleMid: string;
  public popupFullscreen: boolean;
  public periodes: any[];
  private nomUtilisateur: string;
  private nomInterne: string;
  public savingUserPrefs: boolean;
  public reportedItems: any[];
  public formGroup = new UntypedFormGroup({});
  public simpleParams = [];


  public simpleBaseParams = [
    "periode",
    "barreDefilementHaut",
    "barreDefilementBas",
    "diffSurExpedition",
  ];
  public bandeauParams = [
    "valide",
    "type",
    "message",
    "deroulant",
    "dateDebut",
    "dateFin",
  ];
  public infoMessage: string[];
  public typeMessage = [
    {
      id: "I",
      description: "info"
    },
    {
      id: "W",
      description: "Warning"
    },
    {
      id: "S",
      description: "Success"
    },
  ]

  constructor(
    private alertesService: AlertesService,
    private utilisateursService: UtilisateursService,
    private ordreLignesService: OrdreLignesService,
    private formUtilsService: FormUtilsService,
    public localizeService: LocalizationService,
    public functionsService: FunctionsService,
    public dateMgt: DateManagementService,
    public authService: AuthService,
  ) {
    self = this;
    this.nomUtilisateur = this.authService.currentUser.nomUtilisateur;
    this.nomInterne = this.authService.currentUser.nomInterne;
    this.periodes = this.dateMgt.periods();

    this.reportedItems = this.ordreLignesService.reportedItems;

    // Create controls
    this.simpleParams = this.simpleBaseParams.concat(this.bandeauParams);
    this.simpleParams.map(param => this.formGroup.addControl(param, new UntypedFormControl()));
    this.reportedItems.map((item) =>
      this.formGroup.addControl(item.name, new UntypedFormControl({
        value: item.mandatoryValue ?? !!this.authService.currentUser[item.name],
        disabled: !!item.mandatoryValue
      }))
    );
  }

  cancelClick() {
    this.hidePopup();
  }

  onShowing(e) {
    this.setTitle();
    e.component.content().parentNode.classList.add("profile-popup");
  }

  onShown() {
    this.infoMessage = [];
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0); // Scroll top
    // Apply all parameters to widgets
    // Standard
    this.simpleParams.map(param =>
      this.formGroup.get(param).setValue(this.authService.currentUser[param])
    );
    // Specials
    this.reportedItems.map((item) =>
      this.formGroup.get(item.name).setValue(
        item.mandatoryValue ?? !!this.authService.currentUser[item.name]
      )
    );
    // Get current alert
    this.alertesService.fetchAlerte().subscribe({
      next: (res) => {
        const alerte = res?.data?.fetchAlerte;
        if (alerte) {
          this.bandeauParams.map(prop => this.formGroup.get(prop).patchValue(alerte[prop]));
          // Dx bug with fieldTemplate in selectbox. Customvalue doesn't work well
          this.infoMessage.push(alerte.message)
        }
      },
      error: (error: Error) =>
        notify(this.messageFormat(error.message), "error", 7000)
    });
    // Unuseful for the moment but in case of...
    this.formGroup.get("barreDefilementBas").setValue(!this.formGroup.get("barreDefilementHaut").value);
  }

  onHidden() {
    // Reset fields
    this.simpleParams.map(param => this.formGroup.get(param).reset());
    this.bandeauDateDebCB.value = false;
    this.bandeauDateFinCB.value = false;
    this.reportedItems
      .filter((item) => !item.mandatoryValue)
      .map((item) => {
        this.formGroup.get(item.name).reset()
        this.formGroup.get(item.name).setValue(false);
        this.formGroup.get(item.name).markAsPristine;
      });
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  setTitle() {
    this.titleStart = this.firstUpper(this.localizeService.localize("profil"));
    this.titleStart +=
      " " +
      (this.vowelTest(this.nomInterne[0])
        ? this.localizeService.localize("d")
        : this.localizeService.localize("of") + " ");
    this.titleMid = this.firstUpper(this.nomInterne);
  }

  resetAllReportCheckboxes() {
    this.reportedItems
      .filter((item) => !item.mandatoryValue)
      .map((item) => {
        this.formGroup.get(item.name).setValue(false);
        this.formGroup.get(item.name).markAsDirty();
      });
  }

  firstUpper(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  async saveAndHidePopup() {
    const utilisateur = this.formUtilsService.extractDirty(
      this.formGroup.controls,
      Utilisateur.getKeyField()
    );

    // Handle user & not-user specific fields
    const alerte = {};
    this.simpleParams.map(prop => {
      if (this.bandeauParams.includes(prop)) {
        delete utilisateur[prop];
        alerte[prop] = this.formGroup.get(prop).value;
      }
    });

    // Save banner info
    if (Object.keys(alerte).length) {
      this.savingUserPrefs = true;
      this.alertesService.save_v2(
        Object.keys(alerte)
        , { alerte }).subscribe({
          next: () => {
            notify(
              this.localizeService.localize("user-profile-saved"),
              "success",
              2500
            );
            this.hidePopup();
          },
          error: ({ message }: Error) => {
            this.savingUserPrefs = false;
            notify(
              `${this.localizeService.localize(
                "user-profile-save-error"
              )} : ${this.messageFormat(message)}`,
              "error",
              7000
            );
          },
          complete: () => {
            this.savingUserPrefs = false;
          },
        });
    }

    // Save user info
    if (Object.keys(utilisateur).length) {
      utilisateur.nomUtilisateur = this.nomUtilisateur;
      this.authService.applySpecificParameters(utilisateur);
      this.savingUserPrefs = true;
      this.utilisateursService.save_v2(
        Object.keys(utilisateur)
        , { utilisateur }).subscribe({
          next: () => {
            this.authService.setCurrentUser(utilisateur);
            notify(
              this.localizeService.localize("user-profile-saved"),
              "success",
              2500
            );
            this.hidePopup();
          },
          error: ({ message }: Error) => {
            this.savingUserPrefs = false;
            notify(
              `${this.localizeService.localize(
                "user-profile-save-error"
              )} : ${this.messageFormat(message)}`,
              "error",
              7000
            );
          },
          complete: () => {
            this.savingUserPrefs = false;
          },
        });
    }
  }

  messageFormat(mess) {
    const functionNames = ["saveUtilisateur", "fetchAlerte"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    return mess;
  }

  hidePopup() {
    this.visible = false;
  }

  vowelTest(text) {
    return /^[AEIOUYaeiouy]$/i.test(text);
  }

  ////////////////////////////////
  // Specific option functions
  ////////////////////////////////

  async checkValidFinDate(e) {
    const isDeltaValid = (!self.bandeauDateDebCB?.value || (new Date(e?.value) > new Date(self.formGroup.get(self.simpleParams[8])?.value)));
    return isDeltaValid && new Date(e?.value) > new Date();
  }

  async checkValidDebDate(e) {
    const isDeltaValid = (!self.bandeauDateFinCB?.value || (new Date(e?.value) < new Date(self.formGroup.get(self.simpleParams[9])?.value)));
    return isDeltaValid;
  }

  onBannerDateDebClick(e) {
    if (!e.event) return; // Only user event
    const date = this.dateMgt.datePipe.transform(new Date().setSeconds(0).valueOf(), "yyyy-MM-ddTHH:mm:ss");
    this.formGroup.get("dateDebut").patchValue(e.value ? date : null);
    this.formGroup.get("dateDebut").markAsDirty();
  }

  onBannerDateFinClick(e) {
    if (!e.event) return; // Only user event
    let date = this.dateMgt.datePipe.transform(this.dateMgt.addHours(new Date(), 1).valueOf(), "yyyy-MM-ddTHH:mm:ss");
    date = date.slice(0, -2) + "00";
    this.formGroup.get("dateFin").patchValue(e.value ? date : null);
    this.formGroup.get("dateFin").markAsDirty();
  }

}

@NgModule({
  declarations: [ProfilePopupComponent],
  imports: [
    SharedModule,
    DxPopupModule,
    DxLoadPanelModule,
    DxTextBoxModule,
    DxButtonModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxFormModule,
    DxSwitchModule,
    DxValidatorModule,
    DxDateBoxModule,
    FormsModule,
    DxTextAreaModule,
    DxScrollViewModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
  ],
  exports: [ProfilePopupComponent],
})
export class ProfilePopupModule { }
