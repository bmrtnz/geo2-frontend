import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { ArticlesListComponent } from 'app/pages/articles/list/articles-list.component';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { DxPopupComponent, DxTagBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { from } from 'rxjs';
import { mergeMap, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-article-origine-popup',
  templateUrl: './article-origine-popup.component.html',
  styleUrls: ['./article-origine-popup.component.scss']
})
export class ArticleOriginePopupComponent implements OnChanges, AfterViewInit {

  @Input() public ordreLigneId: string;

  visible: boolean;

  @ViewChild(DxPopupComponent, {static: false}) popup: DxPopupComponent;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngAfterViewInit() {
  }

  ngOnChanges() {
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add('article-origine-popup');
  }

  hidePopup() {
    this.popup.visible = false;
  }

}


