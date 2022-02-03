import {Component, Input, OnInit, ViewChild, AfterViewInit, Output, EventEmitter} from '@angular/core';
import { ArticlesService, LocalizationService } from 'app/shared/services';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { DxDataGridComponent, DxTagBoxComponent, DxSelectBoxComponent, DxPopupComponent } from 'devextreme-angular';
import { ArticlesListComponent } from 'app/pages/articles/list/articles-list.component';
import Ordre from 'app/shared/models/ordre.model';

@Component({
  selector: 'app-ajout-articles-manu-popup',
  templateUrl: './ajout-articles-manu-popup.component.html',
  styleUrls: ['./ajout-articles-manu-popup.component.scss']
})

export class AjoutArticlesManuPopupComponent implements OnInit, AfterViewInit {

  @Input() public ordre: Ordre;

  visible: boolean;
  idArticlesDS: DataSource;
  codeChangeProcess: boolean;
  articlesKO = true;
  validBtnText: string;
  nbARticles: number;
  chosenArticles: [];
  ordreInfo = '';
  title: string;

  @ViewChild(ArticlesListComponent, {static: false}) catalogue: ArticlesListComponent;
  @ViewChild(DxTagBoxComponent, {static: false}) saisieCode: DxTagBoxComponent;
  @ViewChild(DxPopupComponent, {static: false}) popup: DxPopupComponent;

  constructor(
    private articlesService: ArticlesService,
    private localizeService: LocalizationService
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.catalogue.dataGrid.selection = {mode : 'multiple'};
    this.catalogue.validSB.value = this.catalogue.trueFalse[1];
  }

  onShowing() {
    this.ordreInfo = this.ordre.campagne.id + '-' + this.ordre.numero + ' (' + this.ordre.client.code + ')';
    this.title = this.localizeService.localize('ajout-articles') + this.ordreInfo;
  }

  updateChosenArticles() {
    const articleTags: any = this.saisieCode.value ? this.saisieCode.value : [];
    this.chosenArticles = articleTags.concat(this.getGridSelectedArticles());
    this.nbARticles = this.chosenArticles.length;
    this.articlesKO = !this.nbARticles;
    this.validBtnText = this.localizeService.localize('btn-valider-article' + (this.nbARticles > 1 ? 's' : ''))
    .replace('&&', this.nbARticles.toString());
  }

  getGridSelectedArticles() {
    return this.catalogue.dataGrid.instance.getSelectedRowKeys();
  }

  selectFromGrid(e) {
    const tagArray = this.saisieCode.value;
    if (tagArray?.length) {
      if (tagArray.includes(e.currentSelectedRowKeys[0])) {
        this.alreadySelected();
        e.component.deselectRows(e.currentSelectedRowKeys);
      }
    }
    this.updateChosenArticles();
  }

  alreadySelected() {
    notify('Cet article est déjà sélectionné', 'warning', 3000);
  }

  onValueChanged(e) {
    // We check that this change is coming from the user, not following a period change
    if (this.codeChangeProcess) return;
    this.codeChangeProcess = true;
    const tagArray = e.component.option('value');
    if (tagArray?.length) {
      let myValue = tagArray.pop();
      if (myValue.length > 6) {
        notify(myValue + ': longueur code incorrecte', 'error', 3000);
      } else {
        myValue = ('000000' + myValue).slice(-6);
        if (!tagArray.includes(myValue) && !this.getGridSelectedArticles().includes(myValue)) {
          tagArray.push(myValue);
        } else {
          this.alreadySelected();
        }
        e.component.option('value', tagArray);
        this.articlesKO = true;
        this.articlesService.getOne(myValue)
        .subscribe(res => {
          const myArt = res?.data?.article;
          this.articlesKO = !myArt || myArt.valide !== true;
          if (this.articlesKO) {
            notify('L\'article ' + myValue + ' n\'existe pas', 'error', 3000);
            if (tagArray.includes(myValue)) tagArray.pop();
            e.component.option('value', tagArray);
          }
          this.updateChosenArticles();
          this.codeChangeProcess = false;
        });
        return;

      }
      e.component.option('value', tagArray);
    }
    this.codeChangeProcess = false;
    this.updateChosenArticles();
  }

  clearArticles() {
    this.codeChangeProcess = true;
    this.saisieCode.value = null;
    this.catalogue.dataGrid.instance.clearSelection();
    this.updateChosenArticles();
    this.codeChangeProcess = false;
  }

  onCancel() {
    this.popup.visible = false;
    this.clearArticles();
  }

}


