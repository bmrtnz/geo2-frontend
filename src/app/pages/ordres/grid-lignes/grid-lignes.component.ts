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
import { Fournisseur } from 'app/shared/models/fournisseur.model';
import { FournisseursService, ArticlesService } from 'app/shared/services';
import { BasesTarifService } from 'app/shared/services/api/bases-tarif.service';
import { TypesPaletteService } from 'app/shared/services/api/types-palette.service';
import { ZoomArticlePopupComponent } from '../zoom-article-popup/zoom-article-popup.component';

@Component({
  selector: 'app-grid-lignes',
  templateUrl: './grid-lignes.component.html',
  styleUrls: ['./grid-lignes.component.scss']
})
export class GridLignesComponent implements OnChanges, OnInit {

  @Input() public ordre: Ordre;
  @Output() public articleLigneId: string;

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
  private gridConfig: Promise<GridConfig>;
  public currentfocusedRow: number;
  public gridRowsTotal: number;
  public lastRowFocused: boolean;
  public currNumero: string;
  public switchNumero: string;
  public itemsWithSelectBox: string[];
  public env = environment;

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
      displayFormat: !index ? 'Totaux : {0}' : '{0}',
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
        e.cellElement.innerText =  infoArt.concatDesc;
        e.cellElement.title = infoArt.concatDesc;
        // Bio en vert
        if (infoArt.bio) e.cellElement.classList.add('bio-article');
      }
    }
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      // console.log(e)
      // if (e.column.dataField === 'nombrePalettesCommandees') {
      //   console.log(e.column.data)
      // }
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
    if (!this.switchNumero) this.switchNumero = this.createNumero(parseInt(this.currNumero, 10));
    this.datagrid.instance.cellValue(this.currentfocusedRow + moveDirection, 'numero', this.currNumero);
    this.datagrid.instance.cellValue(this.currentfocusedRow, 'numero', this.switchNumero);
    this.datagrid.instance.saveEditData();
  }

  createNumero(num) {
    return ('0' + (num++).toString()).slice(-2);
  }

  onValueChanged(event, cell) {
    if (cell.setValue) cell.setValue(event.value);
  }

  onCellClick(e) {
  }

  zoomArticle(e) {
    if (e.column?.dataField !== 'article.id') return;
    this.articleLigneId = e.data.article.id;
    this.zoomArticlePopup.visible = true;
  }

  onEditingStart(e) {

    if (!e.column) return;

    this.ordreLignesService.lockFields(e);

  }

}
