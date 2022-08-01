import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { ModeCulture } from "app/shared/models";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { CertificationsService } from "app/shared/services/api/certification.service";
import { ModesCultureService } from "app/shared/services/api/modes-culture.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { DxListComponent, DxPopupComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { concatMap, map } from "rxjs/operators";
import { GridsService } from "../grids.service";

@Component({
  selector: "app-article-certification-popup",
  templateUrl: "./article-certification-popup.component.html",
  styleUrls: ["./article-certification-popup.component.scss"]
})
export class ArticleCertificationPopupComponent implements OnInit, OnChanges {

  @Input() public ordre: Ordre;
  @Input() public ordreLigne: OrdreLigne;
  @Output() public changeLigne = new EventEmitter<Partial<OrdreLigne>>();

  certDataSource: DataSource;
  visible: boolean;
  certifications: any[];
  idClient: string;
  certification: string;
  newCertification: string;
  alreadyLoaded: boolean;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxListComponent, { static: false }) certlist: DxListComponent;

  constructor(
    private localizeService: LocalizationService,
    public ordresService: OrdresService,
    public OrdreLigneService: OrdreLignesService,
    private modesCultureService: ModesCultureService,
    public gridsService: GridsService,
    private certificationsService: CertificationsService,
  ) {
    this.certifications = [];
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.idClient = this.ordreLigne?.ordre?.client?.id;
    this.certification = this.ordreLigne?.listeCertifications;
  }

  displayNumeroBefore(data) {
    return data ?
      (data.numero ? (data.numero.length === 1 ? "0" + data.numero : data.numero)
        + " - " + data.libelle : data.libelle)
      : null;
  }

  onShowing(e) {

    e.component.content().parentNode.classList.add("article-certification-popup");
    this.certlist.selectedItemKeys = null;
    this.newCertification = this.certification;
    // Retrieves article mode de culture cert
    this.OrdreLigneService
      .getOne_v2(this.ordreLigne.id, [
        "article.matierePremiere.modeCulture.id",
        "ordre.client.certifications.id",
        // "ordre.client.certifications.certification.id",
        // "ordre.client.certifications.certification.description",
      ])
      .pipe(
        concatMap(res => this.modesCultureService
          .getOne(res.data.ordreLigne.article.matierePremiere.modeCulture.id)
          .pipe(map(r => [res.data.ordreLigne, r.data.modeCulture] as [Partial<OrdreLigne>, Partial<ModeCulture>]))
        )
      )
      .subscribe(([ol, modeCulture]) => {
        if (modeCulture) {
          if (!this.certifications.length) {
            this.certifications.push({ text: this.formatCert(modeCulture), disabled: true });
            this.selectLastCertAdded();
          }
        }
        this.certDataSource = this.certificationsService.getDataSource("id");
        this.certDataSource.filter([
          ["valide", "=", true],
          "and",
          ["maskTiers", "startswith", "1"],
        ]);
        // Retrieves all other certs
        this.certDataSource.load().then(certs => {
          if (this.alreadyLoaded) return;
          this.alreadyLoaded = true;
          if (certs) {
            certs.map(cert => {
              this.certifications.push({ text: this.formatCert(cert) });
              if (this.certification?.split(",").includes(cert.id.toString())) this.selectLastCertAdded();
            });
          }
          if (!this.certification) {
            ol.ordre.client.certifications.map(certClt => {
              this.certifications.map(cert => {
                if (certClt.certification.id === parseInt(cert.text.split("-")[0], 10)) {
                  this.certlist.selectedItemKeys.push(cert);
                }
              });
            });
          }
        });
      });
  }

  onHidden() {
    this.certifications = [];
    this.alreadyLoaded = false;
  }

  selectLastCertAdded() {
    if (!this.certlist.selectedItemKeys) this.certlist.selectedItemKeys = [];
    this.certlist.selectedItemKeys.push(this.certifications.slice(-1)[0]);
  }

  formatCert(data) {
    return data.id + " - " + data.description;
  }

  hidePopup() {
    this.popup.visible = false;
  }

  saveCertification() {

    const list = [];
    this.certlist.selectedItemKeys.map(cert => list.push(parseInt(cert.text.split("-")[0], 10)));
    this.newCertification = list.join(",");

    const ordreLigne = { id: this.ordreLigne.id, listeCertifications: this.newCertification };
    this.OrdreLigneService.save_v2(["id", "listeCertifications"], {
      ordreLigne,
    })
      .subscribe({
        next: res => {
          notify(this.localizeService.localize("articles-save-certification"), "success", 2000);
          this.gridsService.reload("Commande");
        },
        error: (err) => {
          console.log(err);
          notify(this.localizeService.localize("articles-save-certification-error"), "error", 2000);
        }
      });
    this.hidePopup();
  }

}


