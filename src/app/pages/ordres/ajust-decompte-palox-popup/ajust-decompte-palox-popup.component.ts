import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import {
  DxPopupComponent,
  DxDateBoxComponent,
  DxNumberBoxComponent,
  DxTextBoxComponent
} from "devextreme-angular";
import { NgForm } from "@angular/forms";
import { LocalizationService } from "app/shared/services";

@Component({
  selector: "app-ajust-decompte-palox-popup",
  templateUrl: "./ajust-decompte-palox-popup.component.html",
  styleUrls: ["./ajust-decompte-palox-popup.component.scss"]
})
export class AjustDecomptePaloxPopupComponent implements OnChanges {

  constructor(
    private localizeService: LocalizationService
  ) { }

  @ViewChild(DxPopupComponent, { static: false })
  popupComponent: DxPopupComponent;

  @ViewChild("paloxBox", { static: false }) paloxBox: DxNumberBoxComponent;
  @ViewChild("dateBox", { static: false }) dateBox: DxDateBoxComponent;
  @ViewChild("entrepotBox", { static: false }) entrepotBox: DxTextBoxComponent;
  @ViewChild("stationBox", { static: false }) stationBox: DxTextBoxComponent;
  @ViewChild("typePaloxBox", { static: false }) typePaloxBox: DxTextBoxComponent;
  @ViewChild("commentBox", { static: false }) commentBox: DxTextBoxComponent;

  @Input() purpose = "";
  @Input() info: any;

  @Output() whenValidate = new EventEmitter<any>();
  @Output() whenShown = new EventEmitter<any>();

  public title: string;
  public paloxLabel: string;
  public dateLabel: string;
  public visible: boolean;


  ngOnChanges() {
    if (this.purpose === "adjust") {
      this.title = this.localizeService.localize("text-palox-popup-title-ajuster");
      this.paloxLabel = this.localizeService.localize("text-palox-popup-ajuster-palox");
      this.dateLabel = this.localizeService.localize("text-palox-popup-date-application");
    } else {
      this.title = this.localizeService.localize("text-palox-popup-title-decompte");
      this.paloxLabel = this.localizeService.localize("text-palox-popup-nombre-palox");
      this.dateLabel = this.localizeService.localize("text-palox-popup-date-decompte");
    }
  }

  show() {
    this.visible = true;
  }

  onHidden() {
    this.visible = false;
    this.paloxBox.instance.reset();
    this.dateBox.instance.reset();
    this.entrepotBox.instance.reset();
    this.stationBox.instance.reset();
    this.typePaloxBox.instance.reset();
    if (this.commentBox) this.commentBox.instance.reset();
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("ajust-decompte-palox-popup");
    const date = new Date();
    const currendDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    this.paloxBox?.instance.focus();
    this.dateBox.value = currendDate;
    this.entrepotBox.value = this.info.entrepotCode;
    this.stationBox.value = this.info.stationCode;
    this.typePaloxBox.value = this.info.paloxCode;
  }

  onSubmit(form: NgForm) {
    if (form.value.date === null || form.value.date === ""
      || form.value.palox === null || form.value.palox === "") return;
    this.whenValidate.emit({
      nbPalox: form.value.palox,
      date: form.value.date,
      commentaire: form.value.commentaire
    });
    this.visible = false;
  }

}


