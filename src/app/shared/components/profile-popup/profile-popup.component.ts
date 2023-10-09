import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
  ViewChild,
} from "@angular/core";
import { SharedModule } from "../../shared.module";
import notify from "devextreme/ui/notify";
import {
  DxButtonModule,
  DxDateBoxModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxCheckBoxModule,
  DxPopupModule,
  DxSelectBoxComponent,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxFormModule,
} from "devextreme-angular";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, LocalizationService } from "app/shared/services";
import { DateManagementService } from "app/shared/services/date-management.service";
import { UtilisateursService } from "app/shared/services/api/utilisateurs.service";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import Utilisateur from "app/shared/models/utilisateur.model";

@Component({
  selector: "app-profile-popup",
  templateUrl: "./profile-popup.component.html",
  styleUrls: ["./profile-popup.component.scss"]
})
export class ProfilePopupComponent {
  @Input() public ligneDetail: any;
  @ViewChild("form") NgForm: any;
  @Output() refreshGrid = new EventEmitter();

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

  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;

  constructor(
    private localizeService: LocalizationService,
    private utilisateursService: UtilisateursService,
    private ordreLignesService: OrdreLignesService,
    private authService: AuthService,
    private formUtilsService: FormUtilsService,
    public dateManagementService: DateManagementService
  ) {
    this.nomUtilisateur = this.authService.currentUser.nomUtilisateur;
    this.nomInterne = this.authService.currentUser.nomInterne;
    this.periodes = this.dateManagementService.periods();

    this.reportedItems = this.ordreLignesService.reportedItems;

    this.formGroup.addControl("periode", new UntypedFormControl());
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

  onShown(e) {
    this.formGroup.get("periode").setValue(
      this.authService.currentUser?.periode
    );
    this.reportedItems.map((item) =>
      this.formGroup.get(item.name).setValue(
        item.mandatoryValue ?? !!this.authService.currentUser[item.name]
      )
    );
  }

  onHidden() {
    this.formGroup.get("periode").reset();
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
    this.titleStart = this.localizeService.localize("profil");
    this.titleStart +=
      " " +
      (this.vowelTest(this.nomInterne[0])
        ? this.localizeService.localize("d")
        : this.localizeService.localize("of") + " ");
    this.titleMid = this.formatName(this.nomInterne);
  }

  resetAllReportCheckboxes() {
    this.reportedItems
      .filter((item) => !item.mandatoryValue)
      .map((item) => {
        this.formGroup.get(item.name).setValue(false);
        this.formGroup.get(item.name).markAsDirty();
      });
  }

  formatName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  messageFormat(mess) {
    const functionNames = ["saveUtilisateur"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    return mess;
  }

  saveAndHidePopup() {
    const utilisateur = this.formUtilsService.extractDirty(
      this.formGroup.controls,
      Utilisateur.getKeyField()
    );
    utilisateur.nomUtilisateur = this.nomUtilisateur;

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

  hidePopup() {
    this.visible = false;
  }

  vowelTest(text) {
    return /^[AEIOUYaeiouy]$/i.test(text);
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
    DxDateBoxModule,
    FormsModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
  ],
  exports: [ProfilePopupComponent],
})
export class ProfilePopupModule { }
