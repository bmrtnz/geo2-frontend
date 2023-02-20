import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import {
  ConfirmationResultPopupComponent
} from "app/pages/ordres/actions-documents-ordres/confirmation-result-popup/confirmation-result-popup.component";
import { LocalizationService } from "app/shared/services";
import { FunctionResult } from "app/shared/services/api/functions.service";
import { ClotureResponse, LitigesService } from "app/shared/services/api/litiges.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxListComponent, DxPopupComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { Observable, of } from "rxjs";
import { concatMap, filter, map, tap } from "rxjs/operators";


@Component({
  selector: "app-litige-cloture-popup",
  templateUrl: "./litige-cloture-popup.component.html",
  styleUrls: ["./litige-cloture-popup.component.scss"]
})
export class LitigeCloturePopupComponent implements OnInit, OnChanges {

  @Input() public infosLitige: any;
  @Output() public clotureChanged = new EventEmitter();

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
  @ViewChild("clotureWarning") clotureWarningPopup: ConfirmationResultPopupComponent;

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

  doCloture() {
    return this.validateCloture().subscribe({
      error: (err: Error) => notify(err.message, "ERROR", 3500),
      next: r => this.clotureChanged.emit(),
    });
  }

  validateCloture(context: Record<string, boolean> = {}) {

    let cloture: Observable<ClotureResponse>;
    const args: [string, string, typeof context] = [
      this.infosLitige.litige.id,
      this.currentCompanyService.getCompany().id,
      context,
    ];

    switch (this.selected) {
      case this.choices[0]: {
        // Client
        cloture = this.litigesService.ofClotureLitigeClient(...args)
          .pipe(map(res => res.data.ofClotureLitigeClient));
        break;
      }
      case this.choices[1]: {
        // Responsable
        cloture = this.litigesService.ofClotureLitigeResponsable(...args)
          .pipe(map(res => res.data.ofClotureLitigeResponsable));
        break;
      }
      case this.choices[2]: {
        // Client ET Responsable
        cloture = this.litigesService.ofClotureLitigeGlobale(...args)
          .pipe(map(res => res.data.ofClotureLitigeGlobale));
        break;
      }
    }

    return cloture.pipe(
      tap(() => this.hidePopup()),
      concatMap(result =>
        result.res === FunctionResult.Warning
          ? this.openRecurse(result, context)
          : of(result)
      ));


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

  /** Bounce back the "litige cloture", keep the recursive context */
  private openRecurse(result: ClotureResponse, context: Record<string, boolean>) {
    return this.clotureWarningPopup.openAs("WARNING", result.msg).pipe(
      filter(pass => pass),
      concatMap(choice => this.validateCloture({ ...context, [result.data.triggered_prompt]: choice })),
    );
  }

}



