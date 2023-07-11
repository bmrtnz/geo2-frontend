import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import {
  DxPopupComponent,
  DxTextBoxComponent,
  DxCheckBoxComponent,
} from "devextreme-angular";
import { NgForm } from "@angular/forms";
import { LocalizationService } from "app/shared/services";
import { DateManagementService } from "app/shared/services/date-management.service";

@Component({
  selector: 'app-modification-article-edi-popup',
  templateUrl: './modification-article-edi-popup.component.html',
  styleUrls: ['./modification-article-edi-popup.component.scss']
})
export class ModificationArticleEdiPopupComponent implements OnChanges {
  constructor(
    private localizeService: LocalizationService,
  ) { }

  @ViewChild(DxPopupComponent, { static: false })
  popupComponent: DxPopupComponent;

  @ViewChild("valideBox", { static: false }) valideBox: DxCheckBoxComponent;
  @ViewChild("codeArtBWBox", { static: false }) codeArtBWBox: DxTextBoxComponent;
  @ViewChild("GTINArtClientBox", { static: false }) GTINArtClientBox: DxTextBoxComponent;
  @ViewChild("codeArtClientBox", { static: false }) codeArtClientBox: DxTextBoxComponent;
  @ViewChild("prioriteBox", { static: false }) prioriteBox: DxTextBoxComponent;

  @Input() info: any;

  @Output() whenValidate = new EventEmitter<any>();
  @Output() whenShown = new EventEmitter<any>();

  public title: string;
  public visible: boolean;
  public purpose: string;

  ngOnChanges() {
    console.log("")
  }

  show(mode) {
    this.purpose = mode;
    this.title = this.localizeService.localize(`ordres-${this.purpose}-article`) + " " +
      this.localizeService.localize("edi-colibri");
    this.visible = true;
  }

  onHidden() {
    this.visible = false;

    this.valideBox.instance.reset();
    this.codeArtBWBox.instance.reset();
    this.GTINArtClientBox.instance.reset();
    this.codeArtClientBox.instance.reset();
    this.prioriteBox.instance.reset();
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("modification-article-edi-popup");
    // this.paloxBox?.instance.focus();
    // this.entrepotBox.value = this.info?.entrepotCode;
    // this.stationBox.value = this.info?.stationCode;
    // this.typePaloxBox.value = this.info?.paloxCode;
  }

  onSave(form: NgForm) {
    if (
      form.value.palox === null ||
      form.value.palox === ""
    )
      return;
    this.whenValidate.emit({
      nbPalox: form.value.palox,
      commentaire: form.value.commentaire,
    });
    this.visible = false;
  }
}
