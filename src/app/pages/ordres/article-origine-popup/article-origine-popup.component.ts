import { AfterViewInit, Component, Input, OnChanges, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalizationService } from 'app/shared/services';
import { DxPopupComponent, DxTagBoxComponent, DxListComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { CampagnesService } from 'app/shared/services/api/campagnes.service';
import { PaysService } from 'app/shared/services/api/pays.service';
import { TypesPaletteService } from 'app/shared/services/api/types-palette.service';
import OrdreLigne from 'app/shared/models/ordre-ligne.model';
import { OrdreLignesService } from 'app/shared/services/api/ordres-lignes.service';

@Component({
  selector: 'app-article-origine-popup',
  templateUrl: './article-origine-popup.component.html',
  styleUrls: ['./article-origine-popup.component.scss']
})
export class ArticleOriginePopupComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() public ordreLigne: OrdreLigne;
  @Output() public changeLigne = new EventEmitter();

  departementDataSource: DataSource;
  regionDataSource: DataSource;
  ZoneDataSource: DataSource;
  visible: boolean;
  localSegment: string[];
  segment: any;
  origine: string;
  newOrigine: string;

  @ViewChild(DxPopupComponent, {static: false}) popup: DxPopupComponent;
  @ViewChild(DxListComponent, {static: false}) geolist: DxListComponent;

  constructor(
    private localizeService: LocalizationService,
    public campagnesService: CampagnesService,
    public regionService: PaysService,
    public OrdreLigneService: OrdreLignesService,
    public zoneService: TypesPaletteService

  ) {
    this.localSegment = [
      'departement',
      'region',
      'zone'
    ];
    this.displaySegment = this.displaySegment.bind(this);
   }

  ngOnInit() {
    this.departementDataSource = this.campagnesService.getDataSource_v2(['id', 'description']);
    this.regionDataSource = this.regionService.getDataSource_v2(['id', 'description']);
    this.ZoneDataSource = this.zoneService.getDataSource_v2(['id', 'description']);

    // getDataSource_v2(columns: Array<string>) {
    //   return new DataSource({
    //     sort: [
    //       { selector: this.model.getKeyField() }
    //     ],
    //     pageSize : 10000,

  }

  ngAfterViewInit() {
  }

  ngOnChanges() {
    this.origine = this.ordreLigne?.origineCertification;
  }

  changeSegment(e) {
    switch (e.value) {
      case 'departement': {
        this.geolist.dataSource = this.departementDataSource;
        break;
      }
      case 'region': {
        this.geolist.dataSource = this.regionDataSource;
        break;
      }
      case 'zone': {
        this.geolist.dataSource = this.ZoneDataSource;
        break;
      }
    }
  }

  displaySegment(data) {
      return data ? this.localizeService.localize('articles-liste-origine-' + data) : null;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add('article-origine-popup');
    this.geolist.selectedItemKeys = null;
  }

  onSelectionChanged(e) {
    // Only one item can be selected
    if (this.geolist.selectedItems.length) this.geolist.selectedItemKeys.shift();
    this.newOrigine = e.addedItems[0]?.description;
  }

  hidePopup() {
    this.popup.visible = false;
  }

  onHiding() {
  }

  saveOrigine() {
    const ordreLigne = {id : this.ordreLigne.id, origineCertification: this.newOrigine ? this.newOrigine : ''};
    this.OrdreLigneService.save_v2(['id', 'origineCertification'], {
      ordreLigne,
    })
    .subscribe({
      next: () => {
        notify(this.localizeService.localize('articles-save-origin'), 'success', 3000);
        this.changeLigne.emit(null);
      },
      error: (err) => {
        console.log(err);
        notify('Echec de la sauvegarde', 'error', 3000);
      }
    });
    this.hidePopup();
  }

}


