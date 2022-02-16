import { Component, Input, OnChanges, OnInit, ViewChild, Output } from '@angular/core';
import { GridConfiguratorService, Grid, GridConfig } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { OrdreLignesService, SummaryOperation } from 'app/shared/services/api/ordres-lignes.service';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent, DxPopupComponent } from 'devextreme-angular';
import { GridColumn, TotalItem } from 'basic';
import { SummaryType, SummaryInput } from 'app/shared/services/api.service';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FournisseursService, ArticlesService } from 'app/shared/services';
import { BasesTarifService } from 'app/shared/services/api/bases-tarif.service';
import { TypesPaletteService } from 'app/shared/services/api/types-palette.service';
import { ZoomArticlePopupComponent } from '../zoom-article-popup/zoom-article-popup.component';
import { ZoomFournisseurPopupComponent } from '../zoom-fournisseur-popup/zoom-fournisseur-popup.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-grid-lignes',
  templateUrl: './grid-lignes.component.html',
  styleUrls: ['./grid-lignes.component.scss']
})
export class GridLignesComponent implements OnChanges, OnInit {

  @Input() public ordre: Ordre;
  @Input() public fournisseurLigneCode: string;
  @Output() public articleLigneId: string;
  @Output() public fournisseurLigneId: string;

  public testSource: DataSource;
  public dataSource: DataSource;
  public proprietaireMarchandiseSource: DataSource;
  public fournisseurSource: DataSource;
  public achatUniteSource: DataSource;
  public fraisUniteSource: DataSource;
  public venteUniteSource: DataSource;
  public typePaletteSource: DataSource;
  public paletteInterSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public totalItems: TotalItem[] = [];
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(ZoomArticlePopupComponent, {static: false}) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ZoomFournisseurPopupComponent, {static: false}) zoomFournisseurPopup: ZoomFournisseurPopupComponent;
  private gridConfig: Promise<GridConfig>;
  public currentfocusedRow: number;
  public gridRowsTotal: number;
  public lastRowFocused: boolean;
  public currNumero: string;
  public switchNumero: string;
  public itemsWithSelectBox: string[];
  public env = environment;
  public nbInsertedArticles: number;
  public newArticles: number;
  public newNumero: number;

  constructor(
    public ordreLignesService: OrdreLignesService,
    public articlesService: ArticlesService,
    public gridConfiguratorService: GridConfiguratorService,
    public proprietaireMarchandiseService: FournisseursService,
    public fournisseurService: FournisseursService,
    public achatUniteService: BasesTarifService,
    public venteUniteService: BasesTarifService,
    public fraisUniteService: BasesTarifService,
    public typePaletteService: TypesPaletteService,
    public paletteInterService: TypesPaletteService,
    public localizeService: LocalizationService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreLigne);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    this.moveRowUpDown = this.moveRowUpDown.bind(this);
    this.itemsWithSelectBox = [
      'fournisseur',
      'achatUnite',
      'venteUnite',
      'fraisUnite',
      'typePalette',
      'paletteInter',
      'proprietaireMarchandise'
    ];
    this.newArticles = 0;
    this.newNumero = 0;
  }

  async ngOnInit() {

    const fields = this.columns.pipe(map( columns => columns.map( column => {
      return (this.addKeyToField(column.dataField));
    })));
    const gridFields = await fields.toPromise();
    this.dataSource = this.ordreLignesService.getDataSource_v2(gridFields);
    this.fournisseurSource = this.fournisseurService.getDataSource_v2(['id', 'code', 'raisonSocial']);
    this.fournisseurSource.filter([
      ['valide', '=', true],
    ]);
    this.proprietaireMarchandiseSource = this.fournisseurService.getDataSource_v2(['id', 'code', 'raisonSocial']);
    this.proprietaireMarchandiseSource.filter([
      ['valide', '=', true],
      'and',
      ['natureStation', '<>', 'F']
    ]);
    this.achatUniteSource = this.achatUniteService.getDataSource_v2(['id', 'description']);
    this.achatUniteSource.filter([
      ['valide', '=', true],
      'and',
      ['valideLig', '=', true]
    ]);
    this.fraisUniteSource = this.achatUniteSource;
    this.venteUniteSource = this.achatUniteSource;
    this.typePaletteSource = this.typePaletteService.getDataSource_v2(['id', 'description']);
    this.typePaletteSource.filter([
      ['valide', '=', true],
    ]);
    this.paletteInterSource = this.typePaletteSource;
  }

  ngOnChanges() {
    this.enableFilters();
  }

  async enableFilters() {

    if (!this.dataSource) return;

    const summaryInputs: SummaryInput[] = [
      { selector: 'nombrePalettesCommandees', summaryType: SummaryType.SUM },
      { selector: 'nombreColisCommandes', summaryType: SummaryType.SUM }
    ];

    const columns = await this.columns.toPromise();
    const fields = columns.map( column => column.dataField ).map( field => {
      return this.addKeyToField(field);
    });

    this.totalItems = summaryInputs
    .map(({selector: column, summaryType}, index) => ({
      column,
      summaryType,
      displayFormat: !index ? this.localizeService.localize('totaux') + ' : {0}' : '{0}',
      valueFormat: columns
      ?.find(({ dataField }) => dataField === column)
      ?.format,
    }));

    if (this?.ordre?.id) {
      this.dataSource = this.ordreLignesService
      .getSummarisedDatasource(SummaryOperation.Totaux, fields, summaryInputs);
      this.dataSource.filter([
        ['ordre.id', '=', this.ordre.id],
        'and',
        ['valide', '=', true],
        'and',
        ['article.id', 'isnotnull', 'null']
      ]);
      this.datagrid.dataSource = this.dataSource;
      } else {
        this.datagrid.dataSource = null;
    }

  }

  addKeyToField(field) {
    if (field === 'proprietaireMarchandise') field += `.${this.fournisseurService.model.getKeyField()}`;
    if (field === 'fournisseur') field += `.${this.fournisseurService.model.getKeyField()}`;
    if (field === 'achatUnite') field += `.${this.achatUniteService.model.getKeyField()}`;
    if (field === 'typePalette') field += `.${this.typePaletteService.model.getKeyField()}`;
    if (field === 'paletteInter') field += `.${this.paletteInterService.model.getKeyField()}`;
    if (field === 'fraisUnite') field += `.${this.fraisUniteService.model.getKeyField()}`;
    if (field === 'venteUnite') field += `.${this.venteUniteService.model.getKeyField()}`;
    return field;
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.column.dataField === 'article.id') {
        // Descript. article
        const infoArt = this.articlesService.concatArtDescript(e.data.article);
        e.cellElement.innerHTML =  infoArt.concatDesc;
        e.cellElement.title = infoArt.concatDesc.substring(2);
        // Bio en vert
        if (infoArt.bio) e.cellElement.classList.add('bio-article');
      }
    }
  }

  onRowClick({ rowIndex }) {
    this.datagrid.instance.editRow(rowIndex);
  }

  displayCodeBefore(data) {
    return data ?
    ((data.code ? data.code : data.id) + ' - ' + (data.nomUtilisateur ? data.nomUtilisateur :
     (data.raisonSocial ? data.raisonSocial : data.description)))
     : null;
  }

  onFocusedRowChanged(e) {
    this.gridRowsTotal = this.datagrid.instance.getVisibleRows().length;
    this.currentfocusedRow = e.row.rowIndex;
    this.lastRowFocused = (this.currentfocusedRow === (this.gridRowsTotal - 1));
  }

  moveRowUpDown(e) {
    const moveDirection = e.element.classList.contains('up-move-button') ? -1 : 1;
    this.currNumero = this.datagrid.instance.getVisibleRows()[this.currentfocusedRow].data.numero;
    this.switchNumero = this.datagrid.instance.getVisibleRows()[this.currentfocusedRow + moveDirection].data.numero;
    this.datagrid.instance.cellValue(this.currentfocusedRow + moveDirection, 'numero', this.currNumero);
    this.datagrid.instance.cellValue(this.currentfocusedRow, 'numero', this.switchNumero);
    this.datagrid.instance.saveEditData();
  }

  onValueChanged(event, cell) {
    if (cell.setValue) cell.setValue(event.value);
  }

  openFilePopup(e) {

    if (e.column?.dataField === 'article.id') {
      this.articleLigneId = e.data.article.id;
      this.zoomArticlePopup.visible = true;
    }
    if (['fournisseur', 'proprietaireMarchandise'].includes(e.column?.dataField)) {
      const idFour = e.data[e.column.dataField].id;
      if (!idFour) return;
      this.fournisseurLigneId = idFour;
      this.zoomFournisseurPopup.visible = true;
    }
  }

  onEditingStart(e) {
    if (!e.column) return;
    this.ordreLignesService.lockFields(e);
  }

  createStringNumero(num) {
    return ('0' + num.toString()).slice(-2);
  }

  onEditorPrepared(e) {
    // Define new order rows numbers
    if (e.dataField === 'numero' && this.newArticles < this.nbInsertedArticles) {
      if (e.value === null) {
        this.newNumero++;
        const newNumero = this.createStringNumero(this.newNumero);
        e.component.cellValue(e.row.rowIndex, 'numero', newNumero);
        this.newArticles++;
      } else {
        this.newNumero = parseInt(e.value, 10);
      }
    }
  }

  onContentReady() {
    // Grid is loaded with new articles: save order rows numbers
    if (this.newArticles === this.nbInsertedArticles) {
      let info = this.nbInsertedArticles + ' ';
      info += ' ' + this.localizeService.localize('article-ajoutes');
      info = info.split('&&').join(this.nbInsertedArticles > 1 ? 's' : '');
      notify(info, 'success', 3000);
      this.newArticles = 0;
      this.newNumero = 0;
      this.nbInsertedArticles = null;
      this.datagrid.instance.saveEditData();
    }
  }

}
