import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { ArticlesListComponent } from 'app/pages/articles/list/articles-list.component';
import Ordre from 'app/shared/models/ordre.model';
import { ArticlesService, LocalizationService } from 'app/shared/services';
import { FunctionsService } from 'app/shared/services/api/functions.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DxPopupComponent, DxTagBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { from } from 'rxjs';
import { mergeMap, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-ajout-articles-manu-popup',
  templateUrl: './ajout-articles-manu-popup.component.html',
  styleUrls: ['./ajout-articles-manu-popup.component.scss']
})

export class AjoutArticlesManuPopupComponent implements AfterViewInit, OnChanges {

  @Input() public ordre: Ordre;
  @Output() public lignesChanged = new EventEmitter();

  visible: boolean;
  idArticlesDS: DataSource;
  codeChangeProcess: boolean;
  articlesKO = true;
  validBtnText: string;
  nbARticles: number;
  nbArticlesOld: number;
  chosenArticles: [];
  ordreInfo = '';
  titleStart: string;
  titleEnd: string;
  pulseBtnOn: boolean;

  @ViewChild(ArticlesListComponent, {static: false}) catalogue: ArticlesListComponent;
  @ViewChild(DxTagBoxComponent, {static: false}) saisieCode: DxTagBoxComponent;
  @ViewChild(DxPopupComponent, {static: false}) popup: DxPopupComponent;

  constructor(
    private articlesService: ArticlesService,
    private functionsService: FunctionsService,
    private currentCompanyService: CurrentCompanyService,
    private localizeService: LocalizationService
  ) { }

  ngAfterViewInit() {
    this.catalogue.dataGrid.selection = { mode : 'multiple', allowSelectAll: false };
    this.catalogue.valideSB.value = this.catalogue.trueFalse[1];
  }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.titleStart = this.localizeService.localize('ajout-articles');
    if (!this.ordre) return;
    this.titleEnd = 'n° ' + this.ordre.campagne.id + '-' + this.ordre.numero + ' - ' + this.ordre.client.raisonSocial;
  }

  updateChosenArticles() {
    const articleTags: any = this.saisieCode.value ? this.saisieCode.value : [];
    this.chosenArticles = articleTags.concat(this.getGridSelectedArticles());
    this.nbARticles = this.chosenArticles.length;
    this.articlesKO = !this.nbARticles;
    this.validBtnText = this.localizeService.localize('btn-valider-article' + (this.nbARticles > 1 ? 's' : ''))
    .replace('&&', this.nbARticles.toString());
    if (this.nbARticles !== this.nbArticlesOld) {
      this.pulseBtnOn = false;
      setTimeout(() => this.pulseBtnOn = true, 1);
    }
    this.nbArticlesOld = this.nbARticles;
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

  onShowing(e) {
    e.component.content().parentNode.classList.add('ajout-articles-manu-popup');
  }

  alreadySelected() {
    notify('Cet article est déjà sélectionné', 'warning', 3000);
  }

  onValueChanged(e) {
    if (this.codeChangeProcess) return; // To avoid infinite loop
    this.codeChangeProcess = true;
    const tagArray = e.component.option('value');
    if (tagArray?.length) {
      let myValue = tagArray.pop();
      if (myValue.length > 6) {
        notify(myValue + ': format/type incorrects', 'error', 3000);
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

  clearAll() {
    this.codeChangeProcess = true;
    this.saisieCode.value = null;
    this.catalogue.dataGrid.dataSource = [];
    this.catalogue.dataGrid.instance.refresh();
    this.updateChosenArticles();
    this.catalogue.especeSB.value = [];
    this.catalogue.varieteSB.value = [];
    this.catalogue.modesCultureSB.value = [];
    this.catalogue.emballageSB.value = [];
    this.catalogue.origineSB.value = [];
    this.codeChangeProcess = false;
  }

  hidePopup() {
    this.popup.visible = false;
  }

  clearAndHidePopup() {
    this.hidePopup();
    this.clearAll();
    this.lignesChanged.emit();
  }

  insertArticles() {
    const info = this.localizeService.localize('ajout-article' + (this.nbARticles > 1 ? 's' : '')) + '...';
    notify(info, 'info', 3000);
    from(this.chosenArticles)
    .pipe(
      mergeMap( articleID => this.functionsService
        .ofInitArticle(this.ordre.id, articleID, this.currentCompanyService.getCompany().id)
        .valueChanges),
      takeWhile( res => res.loading === true),
    )
    .subscribe({
      error: ({message}: Error) => notify(message),
      complete: () => this.clearAndHidePopup(),
    });

  }

}


