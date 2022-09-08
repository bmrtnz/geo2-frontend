import { Component, Input, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { alert } from "devextreme/ui/dialog";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, EntrepotsService, LocalizationService } from "app/shared/services";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { DxPopupComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { TabContext } from "../root/root.component";

@Component({
  selector: "app-duplication-ordre-popup",
  templateUrl: "./duplication-ordre-popup.component.html",
  styleUrls: ["./duplication-ordre-popup.component.scss"]
})
export class DuplicationOrdrePopupComponent {

  constructor(
    public dateManagementService: DateManagementService,
    public ordresService: OrdresService,
    public currentCompanyService: CurrentCompanyService,
    public authService: AuthService,
    private tabContext: TabContext,
    private entrepotsService: EntrepotsService,
    private localization: LocalizationService,
  ) {
    this.itemsToKeep = [
      { name: "codeChargement", checked: true },
      { name: "propExp", checked: true },
      { name: "prixUniteAchat", checked: false },
      { name: "prixUniteVente", checked: false },
      { name: "DLUO", checked: true },
      { name: "ETD", checked: false },
      { name: "ETA", checked: false },
      { name: "portDepart", checked: false },
      { name: "portArrivee", checked: false },
      { name: "incoterm", checked: false },
    ];
    this.itemsToKeep.map(item => this.formGroup.addControl(item.name, new FormControl()));
  }

  @Input() ordre: Ordre;

  public visible: boolean;
  public processRunning: boolean;
  public itemsToKeep: any[];
  public activateEntrepot: boolean;
  public entrepotDS: DataSource;
  public showModify: boolean;
  public formGroup = new FormGroup({
    dateDepartPrevue: new FormControl(),
    dateLivraisonPrevue: new FormControl(),
    entrepot: new FormControl(),
  });

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) entrepotSB: DxSelectBoxComponent;

  onShowing(e) {
    e.component.content().parentNode.classList.add("duplication-ordre-popup");
    this.setDefaultValues();
    this.showModify = false;
    if (this.ordre) {
      this.entrepotDS = this.entrepotsService.getDataSource_v2(["id", "code", "raisonSocial"]);
      this.entrepotDS.filter([
        ["valide", "=", true],
        "and",
        ["client.id", "=", this.ordre.client?.id]
      ]);
      // Only show modify button when several entrepôts
      this.entrepotDS.load().then(res => this.showModify = res.length > 1);
    }
  }

  hidePopup() {
    this.processRunning = false;
    this.popup.visible = false;
  }

  setDefaultValues() {
    this.itemsToKeep.map(item => {
      this.formGroup.get(item.name).patchValue(item.checked);
    });
    this.formGroup.get("dateDepartPrevue").patchValue(this.ordre.dateDepartPrevue);
    this.formGroup.get("dateLivraisonPrevue").patchValue(this.ordre.dateLivraisonPrevue);
    this.formGroup.get("entrepot").patchValue({
      id: this.ordre.entrepot.id,
      code: this.ordre.entrepot.code,
      raisonSocial: this.ordre.entrepot.raisonSocial
    });
    this.activateEntrepot = false;
  }

  displayCodeBefore(data) {
    return data ? data.code + " - " + data.raisonSocial : null;
  }

  changeEntrepot() {
    this.activateEntrepot = true;
    this.entrepotSB.instance.open();
  }

  applyClick() {

    this.processRunning = true;
    const values = this.formGroup.value;

    this.ordresService.wDupliqueOrdreOnDuplique(
      values.codeChargement,
      values.propExp,
      values.prixUniteAchat,
      values.prixUniteVente,
      values.DLUO,
      values.ETD,
      values.ETA,
      values.portDepart,
      values.portArrivee,
      values.incoterm,
      this.ordre.id,
      this.currentCompanyService.getCompany().id,
      this.authService.currentUser.nomUtilisateur
    ).subscribe({
      next: (res) => {
        console.log(res);
        // notify(this.localization.localize("ordre-cree").replace("&O", res.numero), "success", 7000);
        // setTimeout(() =>
        //   this.tabContext.openOrdre(res.numero, this.currentCompanyService.getCompany().campagne.id, false)
        // );
        // this.initializeForm("no-cache");
        this.hidePopup();
      },
      error: (error: Error) => {
        this.processRunning = false;
        console.log(error);
        alert(error.message.replace("Exception while fetching data (/wDupliqueOrdreOnDuplique) : ", ""),
          this.localization.localize("ordre-duplication-creation"));
      }
    });

  }

}