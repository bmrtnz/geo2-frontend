import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxListComponent, DxPopupComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";


@Component({
  selector: "app-litige-cloture-popup",
  templateUrl: "./litige-cloture-popup.component.html",
  styleUrls: ["./litige-cloture-popup.component.scss"]
})
export class LitigeCloturePopupComponent implements OnInit, OnChanges {

  @Input() public infosLitige: any;

  visible: boolean;
  titleStart: string;
  titleEnd: string;
  tiersList: any[];
  enableCloture: boolean;
  oneIsCloture: boolean;
  choices: string[];
  selected: string;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxListComponent, { static: false }) list: DxListComponent;

  constructor(
    private localizeService: LocalizationService,
    private litigesService: LitigesService,
    private currentCompanyService: CurrentCompanyService
  ) {
    this.choices = ["Client", "Responsable", "Client ET Responsable"];
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.infosLitige) {
      this.setTitle();
      this.oneIsCloture = this.infosLitige.clientClos || this.infosLitige.fournisseurClos;
    }
  }

  resetList() {
    this.tiersList = [
      {
        text: this.choices[0],
        disabled: this.infosLitige.clientClos,
        value: this.oneIsCloture
      },
      {
        text: this.choices[1],
        disabled: this.infosLitige.fournisseurClos,
        value: this.oneIsCloture
      },
      {
        text: this.choices[2],
        disabled: this.oneIsCloture
      }
    ];
    this.list.selectedItemKeys = [];
    this.tiersList.map(tiers => {
      if (tiers.value) this.list.selectedItemKeys.push(tiers);
    });
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("title-cloture-popup");
    this.titleEnd = "n° " + this.infosLitige.litige.id;
  }

  changeTiers(e) {
    this.enableCloture = !!this.list.selectedItemKeys?.length || this.oneIsCloture;
    // Do not allow multiple selection when no cloture yet
    if (this.list.selectedItems.length && !this.oneIsCloture) this.list.selectedItemKeys.shift();
    this.selected = (e.addedItems?.length) ? e.addedItems.filter(r => !r.disabled)[0].text : "";
  }

  onShowing(e) {
    this.resetList();
    e.component.content().parentNode.classList.add("litige-cloture-popup");
  }

  validateCloture() {

    /////////////////////////////////
    // Cloture function
    /////////////////////////////////

    switch (this.selected) {
      case this.choices[0]: {
        // Client
        this.litigesService.ofClotureLitigeClient(
          this.infosLitige.litige.id,
          this.currentCompanyService.getCompany().id
        ).subscribe({
          next: (res) => console.log(res),
          error: (error: Error) => {
            console.log(error);
            notify(this.messageFormat(error.message), "error", 7000);
          }
        });
        break;
      }
      case this.choices[1]: {
        // Responsable
        break;
      }
      case this.choices[2]: {
        // Client ET Responsable
        break;
      }
    }

    this.hidePopup();

  }

  hidePopup() {
    this.enableCloture = false;
    this.popup.visible = false;
  }

  private messageFormat(mess) {
    mess = mess
      .replace("Exception while fetching data (/fCreeOrdresEdi) : ", "")
      .replace("Exception while fetching data (/ofSauveOrdre) : ", "")
      .replace("Exception while fetching data (/fCreeOrdreComplementaire) : ", "");
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }

}


