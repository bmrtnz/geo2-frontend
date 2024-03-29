import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import { LocalizationService } from "app/shared/services";
import { DepartementsService } from "app/shared/services/api/departements.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { RegionsService } from "app/shared/services/api/regions.service";
import { ZonesGeographiquesService } from "app/shared/services/api/zones-geographiques.service";
import { DxListComponent, DxPopupComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { GridsService } from "../grids.service";

@Component({
  selector: "app-article-origine-popup",
  templateUrl: "./article-origine-popup.component.html",
  styleUrls: ["./article-origine-popup.component.scss"],
})
export class ArticleOriginePopupComponent implements OnInit, OnChanges {
  @Input() public ordreLigne: OrdreLigne;
  @Output() public changeLigne = new EventEmitter<Partial<OrdreLigne>>();
  @Output() public update = new EventEmitter();

  dataSource: DataSource;
  departementDataSource: DataSource;
  regionDataSource: DataSource;
  zoneGeographiqueDataSource: DataSource;
  visible: boolean;
  localSegment: string[];
  segment: any;
  origine: string;
  newOrigine: string;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxListComponent, { static: false }) geolist: DxListComponent;

  constructor(
    private localizeService: LocalizationService,
    public departementsService: DepartementsService,
    public regionsService: RegionsService,
    public OrdreLigneService: OrdreLignesService,
    public gridsService: GridsService,
    public zonesGeographiquesService: ZonesGeographiquesService
  ) {
    this.localSegment = ["departement", "region", "zone"];
    this.displaySegment = this.displaySegment.bind(this);
  }

  ngOnInit() {
    this.departementDataSource = this.departementsService.getDataSource_v2([
      "id",
      "numero",
      "libelle",
    ]);
    this.regionDataSource = this.regionsService.getDataSource_v2([
      "id",
      "libelle",
    ]);
    this.zoneGeographiqueDataSource =
      this.zonesGeographiquesService.getDataSource_v2(["id", "libelle"]);
  }

  ngOnChanges() {
    this.origine = this.ordreLigne?.origineCertification;
  }

  displayNumeroBefore(data) {
    return data
      ? data.numero
        ? (data.numero.length === 1 ? "0" + data.numero : data.numero) +
          " - " +
          data.libelle
        : data.libelle
      : null;
  }

  changeSegment(e) {
    this.geolist.dataSource = null;
    switch (e.value) {
      case this.localSegment[0]:
        this.geolist.dataSource = this.departementDataSource;
        break;
      case this.localSegment[1]:
        this.geolist.dataSource = this.regionDataSource;
        break;
      case this.localSegment[2]:
        this.geolist.dataSource = this.zoneGeographiqueDataSource;
        break;
    }
  }

  displaySegment(data) {
    return data
      ? this.localizeService.localize("articles-liste-origine-" + data)
      : null;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("article-origine-popup");
    this.geolist.selectedItemKeys = null;
    this.dataSource = this.departementDataSource;
    this.geolist.instance.repaint();
  }

  onItemRendered(e) {
    // Identify origin on list
    if (e.itemData.libelle === this.origine && !this.newOrigine)
      setTimeout(() => (this.geolist.selectedItems = [e.itemData]), 10);
  }

  onSelectionChanged(e) {
    // Only one item can be selected at once
    if (this.geolist.selectedItems.length)
      this.geolist.selectedItemKeys.shift();
    this.newOrigine = e.addedItems[0]?.libelle;
  }

  hidePopup() {
    this.popup.visible = false;
  }

  saveOrigine() {
    const ordreLigne = {
      id: this.ordreLigne.id,
      origineCertification: this.newOrigine ? this.newOrigine : "",
    };
    this.OrdreLigneService.save_v2(["id", "origineCertification"], {
      ordreLigne,
    }).subscribe({
      next: (res) => {
        notify(
          this.localizeService.localize("articles-save-origin"),
          "success",
          2000
        );
        this.update.emit(); // Deep grid refresh
      },
      error: (err) => {
        console.log(err);
        notify(
          this.localizeService.localize("articles-save-origin-error"),
          "error",
          2000
        );
      },
    });
    this.hidePopup();
  }
}
