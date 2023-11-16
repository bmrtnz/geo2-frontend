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
} from "devextreme-angular";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, LocalizationService } from "app/shared/services";
import { DateManagementService } from "app/shared/services/date-management.service";
import { UtilisateursService } from "app/shared/services/api/utilisateurs.service";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import Utilisateur from "app/shared/models/utilisateur.model";

let self;

@Component({
  selector: "app-profile-popup",
  templateUrl: "./profile-popup.component.html",
  styleUrls: ["./profile-popup.component.scss"]
})
export class ProfilePopupComponent {

  @ViewChild("form") NgForm: any;
  @ViewChild("bandeauDateCB", { static: false }) bandeauDateCB: DxCheckBoxComponent;
  @ViewChild("dateValidator", { static: false }) dateValidator: DxValidatorComponent;
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
  public simpleParams = [
    "periode",
    "barreDefilementHaut",
    "barreDefilementBas",
    "diffSurExpedition",
    "bandeauActif",
    "bandeauType",
    "bandeauTexte",
    "bandeauScroll",
    "bandeauDateFIn"
  ];
  public infoMessage = [];
  public typeMessage = [
    {
      id: "info"
    },
    {
      id: "warning"
    },
    {
      id: "success"
    },
  ]

  constructor(
    private utilisateursService: UtilisateursService,
    private ordreLignesService: OrdreLignesService,
    private formUtilsService: FormUtilsService,
    public localizeService: LocalizationService,
    public dateMgt: DateManagementService,
    public authService: AuthService,
  ) {
    self = this;
    this.nomUtilisateur = this.authService.currentUser.nomUtilisateur;
    this.nomInterne = this.authService.currentUser.nomInterne;
    this.periodes = this.dateMgt.periods();

    this.reportedItems = this.ordreLignesService.reportedItems;

    // Create controls
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
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0); // Scroll top
    // Apply all parameters to widgets
    // Standard
    this.simpleParams.map(param =>
      this.formGroup.get(param).setValue(
        this.authService.currentUser[param])
    );
    // Specials
    this.reportedItems.map((item) =>
      this.formGroup.get(item.name).setValue(
        item.mandatoryValue ?? !!this.authService.currentUser[item.name]
      )
    );
    // Unuseful for the moment but in case of...
    this.formGroup.get(this.simpleParams[2]).setValue(!this.formGroup.get(this.simpleParams[1]).value);


    this.formGroup.get(this.simpleParams[4]).setValue(true); /// !!!! A VIRER
    this.formGroup.get(this.simpleParams[5]).setValue(this.typeMessage[1].id); /// !!!! A VIRER
    this.formGroup.get(this.simpleParams[7]).setValue(true); /// !!!! A VIRER
  }

  onHidden() {
    // Reset fields
    this.simpleParams.map(param => this.formGroup.get(param).reset());
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

  saveAndHidePopup() {
    const utilisateur = this.formUtilsService.extractDirty(
      this.formGroup.controls,
      Utilisateur.getKeyField()
    );

    // Handle user & not-user specific fields
    const bannerInfo = {};
    this.simpleParams.map(prop => {
      if (prop.indexOf("bandeau") === 0) {
        delete utilisateur[prop];
        bannerInfo[prop] = this.formGroup.get(prop).value;
      }
    });

    // Save banner info
    if (Object.keys(bannerInfo).length) {
      window.localStorage.setItem("bannerInfo", JSON.stringify(bannerInfo));
      notify(
        this.localizeService.localize("user-profile-saved"),
        "success",
        2500
      );
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
    const functionNames = ["saveUtilisateur"];
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

  async checkValidDate(e) {
    return new Date(e?.value) > new Date();
  }

  onBannerDateClick(e) {
    if (!e.event) return; // Only user event
    const date = this.dateMgt.datePipe.transform(this.dateMgt.addHours(new Date(), 1).valueOf(), "yyyy-MM-ddTHH:mm:ss");
    this.formGroup.get(this.simpleParams[8]).patchValue(e.value ? date : null);
    this.formGroup.get(this.simpleParams[8]).markAsDirty();
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
