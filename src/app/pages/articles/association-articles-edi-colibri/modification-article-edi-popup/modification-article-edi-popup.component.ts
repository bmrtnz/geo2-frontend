import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { DxPopupComponent, DxTextBoxComponent, DxCheckBoxComponent, DxNumberBoxComponent } from "devextreme-angular";
import { NgForm } from "@angular/forms";
import { LocalizationService } from "app/shared/services";
import { alert } from "devextreme/ui/dialog";
import EdiArticleClient from "app/shared/models/article-edi.model";

@Component({
  selector: 'app-modification-article-edi-popup',
  templateUrl: './modification-article-edi-popup.component.html',
  styleUrls: ['./modification-article-edi-popup.component.scss']
})
export class ModificationArticleEdiPopupComponent {
  constructor(
    private localizeService: LocalizationService,
  ) { }

  @ViewChild(DxPopupComponent, { static: false })
  popupComponent: DxPopupComponent;

  @ViewChild("valideBox", { static: false }) valideBox: DxCheckBoxComponent;
  @ViewChild("codeArtBWBox", { static: false }) codeArtBWBox: DxTextBoxComponent;
  @ViewChild("GTINArtClientBox", { static: false }) GTINArtClientBox: DxTextBoxComponent;
  @ViewChild("codeArtClientBox", { static: false }) codeArtClientBox: DxTextBoxComponent;
  @ViewChild("prioriteBox", { static: false }) prioriteBox: DxNumberBoxComponent;

  @Input() EdiArticle: Partial<EdiArticleClient>;
  @Output() whenValidate = new EventEmitter<any>();

  public title: string;
  public visible: boolean;
  public purpose: string;
  public shown: boolean;

  show(mode) {
    this.purpose = mode;
    this.title = this.localizeService.localize(`ordres-${this.purpose}-article`) + " " +
      this.localizeService.localize("edi-colibri");
    this.visible = true;
    console.log(this.EdiArticle.article.valide)
  }

  onHidden() {
    this.visible = false;
    this.shown = false;

    this.valideBox.instance.reset();
    this.codeArtBWBox.instance.reset();
    this.GTINArtClientBox.instance.reset();
    this.codeArtClientBox.instance.reset();
    this.prioriteBox.instance.reset();
  }

  onShown(e) {
    e.component
      .content()
      .parentNode.classList.add("modification-article-edi-popup");

    if (this.EdiArticle) {
      this.valideBox.value = this.EdiArticle.valide;
      this.codeArtBWBox.value = this.EdiArticle.article.id;
      this.GTINArtClientBox.value = this.EdiArticle.gtinColisClient;
      this.codeArtClientBox.value = this.EdiArticle.article.normalisation.articleClient;
      this.prioriteBox.value = this.EdiArticle.priorite;
    }
    this.shown = true;
  }

  onSave(form: NgForm) {

    let message = "Veuillez effectuer les corrections adéquates :<br>"
    const messageLength = message.length;

    if (this.valideBox.value && !this.EdiArticle.article.valide)
      message += `<br>Le code article ${this.EdiArticle.article.id} est non-valide`;

    if (this.GTINArtClientBox.value?.length) {
      if (this.GTINArtClientBox.value.length < 8 || this.GTINArtClientBox.value.length > 13)
        message += "<br>Le GTIN doit être au minimum de 8 chiffres et maximum 13 chiffres";
    } else if (!this.codeArtClientBox.value) {
      message += "<br>Il faut un GTIN article client ET/OU une référence article client de renseigné";
    }

    if (messageLength !== message.length) {
      alert(message + "<br>", this.localizeService.localize(`ordres-${this.purpose}-article`))
    } else {
      // Save
    }

    this.visible = false;
  }
}
