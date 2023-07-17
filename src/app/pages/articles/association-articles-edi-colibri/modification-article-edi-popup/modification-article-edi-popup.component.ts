import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { DxPopupComponent, DxTextBoxComponent, DxCheckBoxComponent, DxNumberBoxComponent, DxSelectBoxComponent } from "devextreme-angular";
import { NgForm } from "@angular/forms";
import { ArticlesService, LocalizationService } from "app/shared/services";
import { alert } from "devextreme/ui/dialog";
import EdiArticleClient from "app/shared/models/article-edi.model";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { ArticlesEdiService } from "app/shared/services/api/articles-edi.service";

@Component({
  selector: 'app-modification-article-edi-popup',
  templateUrl: './modification-article-edi-popup.component.html',
  styleUrls: ['./modification-article-edi-popup.component.scss']
})
export class ModificationArticleEdiPopupComponent implements OnInit {
  constructor(
    private localizeService: LocalizationService,
    private articlesService: ArticlesService,
    private articlesEdiService: ArticlesEdiService,
  ) { }

  @ViewChild(DxPopupComponent, { static: false })
  popupComponent: DxPopupComponent;

  @ViewChild("valideBox", { static: false }) valideBox: DxCheckBoxComponent;
  @ViewChild("codeArtBWBox", { static: false }) codeArtBWBox: DxSelectBoxComponent;
  @ViewChild("GTINArtClientBox", { static: false }) GTINArtClientBox: DxTextBoxComponent;
  @ViewChild("codeArtClientBox", { static: false }) codeArtClientBox: DxTextBoxComponent;
  @ViewChild("prioriteBox", { static: false }) prioriteBox: DxNumberBoxComponent;


  @Input() EdiArticle: Partial<EdiArticleClient>;
  @Input() clientId: string;
  @Output() whenValidate = new EventEmitter<any>();

  public articlesDS: DataSource;
  public title: string;
  public visible: boolean;
  public purpose: string;
  private CR = "<br>● ";

  ngOnInit() {
    this.articlesDS = this.articlesService.getDataSource_v2(["id", "normalisation.articleClient"], "cache-first", "id");
    this.articlesDS.filter(["valide", "=", true]);
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

  onShown(e) {

    e.component
      .content()
      .parentNode.classList.add("modification-article-edi-popup");

    // Fill every field
    if (this.EdiArticle) {
      this.valideBox.value = this.EdiArticle.valide;
      this.codeArtBWBox.value = this.EdiArticle.article.id;
      this.GTINArtClientBox.value = this.EdiArticle.gtinColisClient;
      this.codeArtClientBox.value = this.EdiArticle.article.normalisation.articleClient;
      this.prioriteBox.value = this.EdiArticle.priorite;
      if (!this.GTINArtClientBox.value?.length) {
        this.GTINArtClientBox.instance.focus();
      } else if (!this.codeArtClientBox.value?.length) this.codeArtClientBox.instance.focus();
    } else {
      if (this.purpose === "ajout") {
        this.valideBox.value = true;
        this.codeArtBWBox.value = "";
        this.codeArtBWBox.instance.reset();
        this.GTINArtClientBox.instance.reset();
        this.codeArtClientBox.instance.reset();
        this.prioriteBox.instance.reset()
        this.codeArtBWBox.instance.focus();
      }
    }
  }

  onArticleChanged(e) {
    if (!e.event) return; // Only user event
    // this.codeArtClientBox.instance.reset();
    // if (e.value?.normalisation?.articleClient)
    this.codeArtClientBox.value = e.value?.normalisation?.articleClient;
  }

  onSave(form: NgForm) {

    // Check everything's OK
    let message = "Veuillez effectuer les corrections adéquates :<br>"
    const messageLength = message.length;

    if (this.purpose !== "ajout") {
      if (this.valideBox.value && !this.EdiArticle?.article.valide)
        message += `${this.CR}Le code article ${this.EdiArticle.article.id} est non-valide`;
    } else {
      if (!this.codeArtBWBox.value?.id)
        message += `${this.CR}Le code article est non-renseigné`;
    }

    if (this.GTINArtClientBox.value) {
      if (this.GTINArtClientBox.value.length < 8 || this.GTINArtClientBox.value.length > 13)
        message += `${this.CR}Le GTIN doit être au minimum de 8 chiffres et maximum de 13 chiffres`;
    } else if (!this.codeArtClientBox.value) {
      message += `${this.CR}Il faut un GTIN article client ET/OU une référence article client de renseigné`;
    }

    if (!this.prioriteBox.value) message += `${this.CR}La priorité n'est pas définie`;

    if (messageLength !== message.length) {
      alert(`${message}<br>`, this.localizeService.localize(`ordres-${this.purpose}-article`))
    } else {
      // Save : ajout & modification


      const ediArticleClientAjout = {
        id: null,
        valide: this.valideBox.value,
        gtinColisClient: this.GTINArtClientBox.value,
        priorite: this.prioriteBox.value,
        article: { id: this.codeArtBWBox.value.id },
        client: { id: this.clientId }
      }
      const ediArticleClientModif = {
        id: this.EdiArticle?.id,
        valide: this.valideBox.value,
        gtinColisClient: this.GTINArtClientBox.value,
        priorite: this.prioriteBox.value,
      }

      // Need for saving the new code article client in article table
      console.log(this.codeArtBWBox.value, this.EdiArticle?.article.id)
      if (this.purpose === "modification") {
        const article = {
          id: this.EdiArticle?.article.id,
          normalisation: { id: this.EdiArticle?.article.normalisation.id, articleClient: this.codeArtClientBox.value }
        }
        this.articlesService.save_v2(["id"], { article, clone: false }).subscribe({
          error: () => notify("Erreur lors de la sauvegarde article", "error", 3000)
        });
      }

      const ediArticleClient = this.purpose === "ajout" ? ediArticleClientAjout : ediArticleClientModif;

      this.articlesEdiService.save(new Set(["id"]), ediArticleClient).subscribe({
        next: (e) => {
          notify(
            this.localizeService.localize(this.purpose === "ajout" ? 'article-created' : 'saveOK'),
            "success", 3000
          );
          this.visible = false;
          this.whenValidate.emit(); // Refresh grid
        },
        error: () =>
          notify("Erreur lors de la sauvegarde", "error", 3000),
      });

    }

  }
}
