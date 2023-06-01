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
  DxPopupModule,
  DxSelectBoxComponent,
  DxSelectBoxModule,
  DxTextBoxModule,
} from "devextreme-angular";
import { AuthService, LocalizationService } from "app/shared/services";
import { DateManagementService } from "app/shared/services/date-management.service";
import { UtilisateursService } from "app/shared/services/api/utilisateurs.service";

@Component({
  selector: "app-profile-popup",
  templateUrl: "./profile-popup.component.html",
  styleUrls: ["./profile-popup.component.scss"],
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
  public toto: any;
  public saveUserPrefs: boolean;

  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;

  constructor(
    private localizeService: LocalizationService,
    private utilisateursService: UtilisateursService,
    private authService: AuthService,
    public dateManagementService: DateManagementService
  ) {
    this.nomUtilisateur = this.authService.currentUser.nomUtilisateur;
    this.nomInterne = this.authService.currentUser.nomInterne;
    this.periodes = this.dateManagementService.periods();
  }

  cancelClick() {
    this.hidePopup();
  }

  onShowing(e) {
    this.setTitle();
    e.component.content().parentNode.classList.add("profile-popup");
  }

  onShown(e) {
    this.periodeSB.instance.option(
      "value",
      this.dateManagementService.getPeriodFromId(
        this.authService.currentUser?.periode,
        this.periodes
      )
    );
  }

  onHidden() {
    this.periodeSB.instance.reset();
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
    const newPeriod = this.periodeSB.value?.id ?? "";
    const utilisateur = {
      nomUtilisateur: this.nomUtilisateur,
      periode: newPeriod,
    };
    this.saveUserPrefs = true;
    this.utilisateursService.save_v2(["periode"], { utilisateur }).subscribe({
      next: () => {
        this.authService.currentUser.periode = newPeriod;
        notify(
          this.localizeService.localize("user-profile-saved"),
          "success",
          1500
        );
        this.hidePopup();
      },
      error: ({ message }: Error) => {
        this.saveUserPrefs = false;
        notify(
          `${this.localizeService.localize(
            "user-profile-save-error"
          )} : ${this.messageFormat(message)}`,
          "error",
          7000
        );
      },
      complete: () => {
        this.saveUserPrefs = false;
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
    DxDateBoxModule,
    DxSelectBoxModule,
  ],
  exports: [ProfilePopupComponent],
})
export class ProfilePopupModule {}
