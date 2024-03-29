import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { AjoutArticlesHistoPopupComponent } from 'app/pages/ordres/ajout-articles-histo-popup/ajout-articles-histo-popup.component';
import { AjoutArticlesManuPopupComponent } from 'app/pages/ordres/ajout-articles-manu-popup/ajout-articles-manu-popup.component';
import { AjoutArticlesRefClientPopupComponent } from 'app/pages/ordres/ajout-articles-ref-client-popup/ajout-articles-ref-client-popup.component';
import { AjoutArticlesStockPopupComponent } from 'app/pages/ordres/ajout-articles-stock-popup/ajout-articles-stock-popup.component';
import { EdiLigne } from 'app/shared/models';
import Ordre from 'app/shared/models/ordre.model';
import { Maybe } from 'graphql/jsutils/Maybe';
import { GridsService } from '../grids.service';


@Component({
  selector: 'app-add-article-to-order-buttons',
  templateUrl: './add-article-to-order-buttons.component.html',
  styleUrls: ['./add-article-to-order-buttons.component.scss']
})
export class AddArticleToOrderButtonsComponent implements OnChanges {

  @Input() public gridCommandesAlias;
  @Input() public articleRowKeyAlias: string;
  @Input() public singleAlias: boolean;
  @Input() public fullOrderNumberAlias: string;
  @Input() public allowMutationsAlias: boolean;
  @Input() public histoLigneOrdreTextAlias: string;
  @Input() public histoLigneOrdreROTextAlias: string;
  @Input() public ordreAlias: Ordre
  @Input() public readOnlyModeAlias: boolean;
  @Input() public ediLigneID: EdiLigne["id"];

  @Output() public gridCommandes;
  @Output() public articleRowKey: string;
  @Output() public single: boolean;
  @Output() public fullOrderNumber: string;
  @Output() public allowMutations: boolean;
  @Output() public histoLigneOrdreText: string;
  @Output() public histoLigneOrdreReadOnlyText: string;
  @Output() public ordre: Ordre
  @Output() public readOnlyMode: boolean;

  @Output() public lignesChanged = new EventEmitter();

  @ViewChild(AjoutArticlesRefClientPopupComponent, { static: false }) ajoutArtRefClt: AjoutArticlesRefClientPopupComponent;
  @ViewChild(AjoutArticlesManuPopupComponent, { static: false }) ajoutArtManu: AjoutArticlesManuPopupComponent;
  @ViewChild(AjoutArticlesHistoPopupComponent, { static: false }) ajoutArtHisto: AjoutArticlesHistoPopupComponent;
  @ViewChild(AjoutArticlesStockPopupComponent, { static: false }) ajoutArtStock: AjoutArticlesStockPopupComponent;

  public running = {
    ajoutArtManu: false,
    ajoutArtHisto: false,
    ajoutArtStock: false,
    ajoutArtRefClt: false
  }

  constructor(
    private gridsService: GridsService
  ) { }

  ngOnChanges() {
    this.gridCommandes = this.gridCommandesAlias;
    this.articleRowKey = this.articleRowKeyAlias;
    this.single = this.singleAlias;
    this.fullOrderNumber = this.fullOrderNumberAlias;
    this.allowMutations = this.allowMutationsAlias;
    this.histoLigneOrdreText = this.histoLigneOrdreTextAlias
    this.histoLigneOrdreReadOnlyText = this.histoLigneOrdreROTextAlias;
    this.ordre = this.ordreAlias;
    this.readOnlyMode = this.readOnlyModeAlias;
  }

  async addArticleClick(popup) {
    this.running[popup] = true;
    await this.saveGridCde();
    if (popup === "ajoutArtHisto") this.readOnlyMode = !this.fullOrderNumber || !this.allowMutations;
    this[popup].visible = true;
  }

  saveGridCde() {
    return this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
  }

  onLignesChanged(e) {
    this.lignesChanged.emit(e);
  }

}

