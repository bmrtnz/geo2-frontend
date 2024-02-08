import { Component, NgModule, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { SharedModule } from "../../shared.module";
import notify from "devextreme/ui/notify";
import { confirm } from "devextreme/ui/dialog";
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
  DxTagBoxComponent,
  DxScrollViewComponent,
  DxValidatorComponent,
  DxDateBoxComponent,
  DxTagBoxModule,
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
import { SecteursService } from "app/shared/services/api/secteurs.service";
import DataSource from "devextreme/data/data_source";
import { TopRightPopupButtonsModule } from "../top-right-popup-buttons/top-right-popup-buttons.component";

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
  @ViewChildren(DxValidatorComponent) validators: QueryList<DxValidatorComponent>;
  @ViewChild("secteursList", { static: false }) secteursList: DxTagBoxComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  public secteurs: DataSource;
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
  public simpleParams: string[] = [];
  public simpleBaseParams: string[] = [
    "periode",
    "barreDefilementHaut",
    "barreDefilementVisible",
    "diffSurExpedition",
  ];
  public alerteParams: string[] = this.alertesService.alerteParams();
  public alerteTypes: any[] = this.alertesService.alerteTypes();
  public infoMessage: string[];
  public limitTags: boolean;
  public messageText: string;
  public messageRange = { min: 2, max: 1024 };
  private currentAlert: Partial<Alerte>;

  constructor(
    private alertesService: AlertesService,
    private utilisateursService: UtilisateursService,
    private ordreLignesService: OrdreLignesService,
    private formUtilsService: FormUtilsService,
    public secteursService: SecteursService,
    public localizeService: LocalizationService,
    public functionsService: FunctionsService,
    public dateMgt: DateManagementService,
    public authService: AuthService,
  ) {
    self = this;
    this.messageText = this.localizeService.localize("warning-out-wrong-message", this.messageRange.min, this.messageRange.max);
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter(["valide", "=", true]);
    this.nomUtilisateur = this.authService.currentUser.nomUtilisateur;
    this.nomInterne = this.authService.currentUser.nomInterne;
    this.periodes = this.dateMgt.periods();

    this.reportedItems = this.ordreLignesService.reportedItems().filter(item => !item.hidden);

    // Create controls
    this.simpleParams = this.simpleBaseParams.concat(this.alerteParams);
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
    this.formGroup.get("barreDefilementVisible").patchValue(false);
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
        this.currentAlert = res?.data?.fetchAlerte;
        if (this.currentAlert) {
          this.alerteParams.map(prop =>
            this.formGroup.get(prop).patchValue((prop === "secteur" && this.currentAlert[prop]) ? [this.currentAlert[prop]?.id] : this.currentAlert[prop])
          );
          // Dx bug with fieldTemplate in selectbox. Customvalue doesn't work well
          this.infoMessage.push(this.currentAlert.message);
        }
        else {
          this.formGroup.get("type").setValue(this.alerteTypes[0].id);
          this.formGroup.get("deroulant").setValue(true);
        }
      },
      error: (error: Error) =>
        notify(this.messageFormat(error.message), "error", 7000)
    });
  }

  onHidden() {
    // Reset fields
    this.simpleParams.map(param => this.formGroup.get(param).reset());
    if (this.bandeauDateDebCB) this.bandeauDateDebCB.value = false;
    if (this.bandeauDateFinCB) this.bandeauDateFinCB.value = false;
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

  async checkValidators() {
    const validates = [];
    await this.validators.map(async (validator) => {
      let v = (await validator.instance.validate()?.complete)?.isValid;
      v = v || (v === undefined);
      validates.push(v);
    });
    return validates;
  }

  async saveAndHidePopup() {

    const validates = await (await this.checkValidators());
    const invalids = validates.filter(v => !v);

    if (invalids.length) return notify({
      message: this.localizeService.localize("warning-invalid-fields", invalids.length),
      type: "warning"
    },
      { position: 'bottom center', direction: 'up-stack' }
    );
    const startAlert = this.formGroup.get("valide").value === true && !this.currentAlert?.valide;
    const stopAlert = this.formGroup.get("valide").value !== true && this.currentAlert?.valide;

    if (startAlert) {
      const sector = this.formGroup.get("secteur").value;
      const type = this.alerteTypes.find(a => a.id === this.formGroup.get("type").value).description.toUpperCase();
      let warn = this.localizeService.localize(
        "warn-turn-on-alert",
        this.localizeService.localize((sector?.length ? "on-sector" : "generale"), sector),
        type
      );
      if (!await confirm(warn, this.localizeService.localize("text-general-banner"))) return;
    }

    const utilisateur = this.formUtilsService.extractDirty(
      this.formGroup.controls,
      Utilisateur.getKeyField()
    );

    // Alert changed?
    let alerteTouched;
    Object.keys(utilisateur).map(prop =>
      alerteTouched = alerteTouched || this.alerteParams.includes(prop)
    );

    // Split user & not-user specific fields
    const alerte: Partial<Alerte> = {};
    this.simpleParams.map(prop => {
      if (this.alerteParams.includes(prop)) {
        delete utilisateur[prop];
        alerte[prop] = this.formGroup.get(prop).value;
        if (prop === "secteur") alerte[prop] = { id: this.formGroup.get(prop).value?.length ? alerte[prop][0] : null };
      }
    });

    // Save banner info
    if (this.authService.isAdmin && alerteTouched) {
      this.savingUserPrefs = true;
      this.alertesService.save_v2(
        this.formUtilsService.extractPaths(alerte)
        , { alerte }).subscribe({
          next: () => {
            const action = startAlert ? "start" : stopAlert ? "stop" : "saved";
            notify({
              message: this.localizeService.localize("user-alert-" + action),
              type: "success"
            },
              { position: 'bottom center', direction: 'up-stack' }
            );
            this.hidePopup();
          },
          error: ({ message }: Error) => {
            this.savingUserPrefs = false;
            notify({
              message: `${this.localizeService.localize(
                "user-alert-save-error"
              )} : ${this.messageFormat(message)}`,
              type: "error",
              displayTime: 7000
            },
              { position: 'bottom center', direction: 'up-stack' }
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
            this.authService.userChange.next();
            notify({
              message: this.localizeService.localize("user-profile-saved"),
              type: "success"
            },
              { position: 'bottom center', direction: 'up-stack' }
            );
            this.hidePopup();
          },
          error: ({ message }: Error) => {
            this.savingUserPrefs = false;
            notify({
              message: `${this.localizeService.localize(
                "user-profile-save-error"
              )} : ${this.messageFormat(message)}`,
              type: "error",
              displayTime: 7000
            },
              { position: 'bottom center', direction: 'up-stack' }
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

  async checkValidDebDate(e) {
    return !self.bandeauDateDebCB?.value ||
      !self.bandeauDateFinCB?.value ||
      (new Date(e?.value) < new Date(self.formGroup.get(self.simpleParams[9])?.value));
  }

  async checkValidFinDate(e) {
    return !self.bandeauDateFinCB?.value ||
      ((new Date(e?.value) > new Date()) && (new Date(e?.value) > new Date(self.formGroup.get(self.simpleParams[8])?.value)));
  }

  async checkMessageLength(e) {
    return e?.value?.length >= self.messageRange.min && e?.value?.length <= self.messageRange.max;
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

  onSecteurChanged(e) {
    if (!e.event) return; // Only user event
    // Limit to 1 sector for the moment
    if (e.value?.length > 1) e.component.option('value', [e.value[1]]);
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
    DxTagBoxModule,
    DxScrollViewModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    TopRightPopupButtonsModule
  ],
  exports: [ProfilePopupComponent],
})
export class ProfilePopupModule { }
