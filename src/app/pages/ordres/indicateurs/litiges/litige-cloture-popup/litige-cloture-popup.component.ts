import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ConfirmationResultPopupComponent } from "app/shared/components/confirmation-result-popup/confirmation-result-popup.component";
import Litige from "app/shared/models/litige.model";
import { LocalizationService } from "app/shared/services";
import { FunctionResult } from "app/shared/services/api/functions.service";
import {
  ClotureResponse,
  LitigesService,
} from "app/shared/services/api/litiges.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxListComponent, DxPopupComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { Observable, of } from "rxjs";
import { concatMap, filter, map, tap } from "rxjs/operators";

/** Litige cloture possible targets */
export enum ClotureTarget {
  Client = "Client",
  Responsable = "Responsable",
  Both = "Client ET Responsable",
}

@Component({
  selector: "app-litige-cloture-popup",
  templateUrl: "./litige-cloture-popup.component.html",
  styleUrls: ["./litige-cloture-popup.component.scss"],
})
export class LitigeCloturePopupComponent implements OnChanges {
  @Input() public infosLitige: any;
  @Output() public clotureChanged = new EventEmitter<
    [Litige["id"], ClotureTarget]
  >();

  visible: boolean;
  titleStart: string;
  titleEnd: string;
  tiersList: any[];
  enableCloture: boolean;
  oneIsCloture: boolean;
  choices: string[];
  selected: string;
  public running;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxListComponent, { static: false }) list: DxListComponent;
  @ViewChild("clotureWarning")
  clotureWarningPopup: ConfirmationResultPopupComponent;

  constructor(
    private localizeService: LocalizationService,
    private litigesService: LitigesService,
    private currentCompanyService: CurrentCompanyService
  ) {
    this.choices = Object.values(ClotureTarget);
  }

  ngOnChanges() {
    if (this.infosLitige) {
      this.setTitle();
      this.oneIsCloture =
        this.infosLitige.clientClos || this.infosLitige.fournisseurClos;
    }
  }

  resetList() {
    this.tiersList = [
      {
        text: this.choices[0],
        disabled: this.infosLitige.clientClos,
        value: this.oneIsCloture,
      },
      {
        text: this.choices[1],
        disabled: this.infosLitige.fournisseurClos,
        value: this.oneIsCloture,
      },
      {
        text: this.choices[2],
        disabled: this.oneIsCloture,
      },
    ];
    this.list.selectedItemKeys = [];
    this.tiersList.map((tiers) => {
      if (tiers.value) this.list.selectedItemKeys.push(tiers);
    });
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("title-cloture-popup");
    this.titleEnd = "n° " + this.infosLitige.litige.id;
  }

  changeTiers(e) {
    this.enableCloture =
      !!this.list.selectedItemKeys?.length || this.oneIsCloture;
    // Do not allow multiple selection when no cloture yet
    if (this.list.selectedItems.length && !this.oneIsCloture)
      this.list.selectedItemKeys.shift();
    this.selected = e.addedItems?.length
      ? e.addedItems.filter((r) => !r.disabled)[0].text
      : "";
  }

  onShowing(e) {
    this.running = false;
    this.resetList();
    e.component.content().parentNode.classList.add("litige-cloture-popup");
  }

  doCloture() {
    this.running = true;
    return this.validateCloture().subscribe({
      error: (err: Error) =>
        notify(this.messageFormat(err.message), "ERROR", 7000),
      next: (r) =>
        this.clotureChanged.emit([
          this.infosLitige.litige.id,
          ClotureTarget[this.selected],
        ]),
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
        cloture = this.litigesService
          .ofClotureLitigeClient(...args)
          .pipe(map((res) => res.data.ofClotureLitigeClient));
        break;
      }
      case this.choices[1]: {
        // Responsable
        cloture = this.litigesService
          .ofClotureLitigeResponsable(...args)
          .pipe(map((res) => res.data.ofClotureLitigeResponsable));
        break;
      }
      case this.choices[2]: {
        // Client ET Responsable
        cloture = this.litigesService
          .ofClotureLitigeGlobale(...args)
          .pipe(map((res) => res.data.ofClotureLitigeGlobale));
        break;
      }
    }

    return cloture.pipe(
      tap(() => this.hidePopup()),
      concatMap((result) =>
        result.res === FunctionResult.Warning
          ? this.openRecurse(result, context)
          : of(result)
      )
    );
  }

  hidePopup() {
    this.enableCloture = false;
    this.popup.visible = false;
  }

  private messageFormat(mess) {
    mess = mess
      .replace("Exception while fetching data (/ofClotureLitigeGlobale) : ", "")
      .replace(
        "Exception while fetching data (/ofClotureLitigeResponsable) : ",
        ""
      )
      .replace("Exception while fetching data (/ofClotureLitigeClient) : ", "");
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }

  /** Bounce back the "litige cloture", keep the recursive context */
  private openRecurse(
    result: ClotureResponse,
    context: Record<string, boolean>
  ) {
    return this.clotureWarningPopup.openAs("WARNING", result.msg).pipe(
      filter((pass) => pass),
      concatMap((choice) =>
        this.validateCloture({
          ...context,
          [result.data.triggered_prompt]: choice,
        })
      )
    );
  }
}
