import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import {
  DxPopupComponent,
  DxDateBoxComponent,
  DxNumberBoxComponent,
  DxTextBoxComponent,
  DxSwitchComponent
} from "devextreme-angular";
import { NgForm } from "@angular/forms";
import { AuthService, LocalizationService } from "app/shared/services";
import { DateManagementService } from "app/shared/services/date-management.service";
import Ordre from "app/shared/models/ordre.model";
import { GridPackingListComponent } from "./grid-packing-list/grid-packing-list.component";
import { PacklistsService } from "app/shared/services/api/packlists.service";
import notify from "devextreme/ui/notify";

@Component({
  selector: "app-packing-list-popup",
  templateUrl: "./packing-list-popup.component.html",
  styleUrls: ["./packing-list-popup.component.scss"]
})
export class PackingListPopupComponent implements OnChanges {

  constructor(
    private localizeService: LocalizationService,
    private authService: AuthService,
    private packlistsService: PacklistsService
  ) { }

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(GridPackingListComponent, { static: false }) gridComponent: GridPackingListComponent;

  @ViewChild("entrepot", { static: false }) entrepotInput: DxTextBoxComponent;
  @ViewChild("dateDep", { static: false }) dateDepInput: DxDateBoxComponent;
  @ViewChild("dateArr", { static: false }) dateArrInput: DxDateBoxComponent;
  @ViewChild("dateImp", { static: false }) dateImpInput: DxDateBoxComponent;
  @ViewChild("PO", { static: false }) POInput: DxTextBoxComponent;
  @ViewChild("switchCltEnt", { static: false }) switchCltEnt: DxSwitchComponent;

  @Input() ordre: Ordre;

  @Output() whenValidate = new EventEmitter<any>();
  @Output() ordreId: string;

  public title: string;
  public paloxLabel: string;
  public dateLabel: string;
  public visible: boolean;
  public popupFullscreen = false;
  public labelEntrepot: string;
  public validOk: boolean;
  public ordresIds: string[];
  public shown: boolean;

  ngOnChanges() {
    if (this.ordre) {
      this.title = this.localizeService.localize("packing-list-popup-title");
      this.ordreId = this.ordre.id;
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("packing-list-popup");
  }

  onShown(e) {
    this.entrepotInput.value = `${this.ordre.entrepot.code} - ${this.ordre.entrepot.raisonSocial}`;
    this.dateDepInput.value = this.ordre.etdDate ?? new Date();
    this.dateArrInput.value = this.ordre.etaDate ?? new Date();
    this.dateImpInput.value = new Date();
    this.switchCltEnt.value = true;
    this.gridComponent.enableFilters();
    console.log(this.authService.currentUser);
    console.log("mail", this.authService.currentUser.email);
    this.shown = true;
  }

  onHiding() {
  }

  onHidden() {
    this.visible = false;
    this.shown = false;
    this.entrepotInput.instance.reset();
    this.dateDepInput.instance.reset();
    this.dateArrInput.instance.reset();
    this.POInput.instance.reset();
    this.switchCltEnt.instance.reset();
    this.gridComponent.datagrid.dataSource = null;
    this.gridComponent.datagrid.instance.clearSelection();
  }

  hidePopup() {
    this.popup.visible = false;
  }

  selectedOrderIds(e) {
    this.ordresIds = e;
    this.validOk = e?.length;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  onSubmit() {
    if (!this.dateDepInput.value || !this.dateArrInput.value) return;

    const myOrdres = [];
    this.ordresIds.map(ord => myOrdres.push({ ordre: { id: ord } }));

    this.packlistsService.save({
      depart: new Date(this.dateDepInput.value).toISOString(),
      livraison: new Date(this.dateArrInput.value).toISOString(),
      impression: new Date(this.dateImpInput.value).toISOString(),
      numeroPo: this.POInput.value,
      typeTier: { id: this.switchCltEnt.value ? "E" : "C" },
      mail: this.authService.currentUser.email ?? "",
      ordres: myOrdres
    }, new Set(["id"])).subscribe({
      next: (res) => {
        // Message and close
        notify("Sauvegardé", "success", 3000);
        this.hidePopup();
      },
      error: (error: Error) => {
        console.log(error);
        notify(this.messageFormat(error.message), "error", 7000);
      },
      complete: () => console.log("complete")
    });

  }

  private messageFormat(mess) {
    const functionNames =
      ["savePacklistEntete"
      ];
    functionNames.map(fn => mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""));
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }

}


