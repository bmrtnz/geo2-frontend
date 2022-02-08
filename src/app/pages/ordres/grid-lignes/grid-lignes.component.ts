import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { GridConfiguratorService, Grid, GridConfig } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { OrdreLignesService, SummaryOperation } from 'app/shared/services/api/ordres-lignes.service';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { GridColumn, TotalItem } from 'basic';
import { SummaryType, SummaryInput } from 'app/shared/services/api.service';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FournisseursService } from 'app/shared/services';
import { BasesTarifService } from 'app/shared/services/api/bases-tarif.service';
import { TypesPaletteService } from 'app/shared/services/api/types-palette.service';

@Component({
  selector: 'app-grid-lignes',
  templateUrl: './grid-lignes.component.html',
  styleUrls: ['./grid-lignes.component.scss']
})
export class GridLignesComponent implements OnChanges, OnInit {

  public dataSource: DataSource;
  public proprietaireMarchandiseSource: DataSource;
  public fournisseurSource: DataSource;
  public achatUniteSource: DataSource;
  public typePaletteSource: DataSource;
  public paletteInterSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public totalItems: TotalItem[] = [];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
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
    public gridConfiguratorService: GridConfiguratorService,
    public proprietaireMarchandiseService: FournisseursService,
    public fournisseurService: FournisseursService,
    public achatUniteService: BasesTarifService,
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
    this.fournisseurSource.filter(['valide', '=', true]);
    this.proprietaireMarchandiseSource = this.fournisseurSource;
    this.achatUniteSource = this.achatUniteService.getDataSource_v2(['id', 'description']);
    this.typePaletteSource = this.typePaletteService.getDataSource_v2(['id', 'description']);
    this.paletteInterSource = this.typePaletteSource;
    this.datagrid.instance.option('focusedRowIndex', -1);
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
      displayFormat: !index ? 'Total : {0}' : '{0}',
      valueFormat: columns
      ?.find(({ dataField }) => dataField === column)
      ?.format,
    }));

    if (this?.ordre?.id) {
      this.dataSource = this.ordreLignesService
      .getSummarisedDatasource(SummaryOperation.Totaux, fields, summaryInputs);
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
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
    return field;
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      // Descript. article
      if (e.column.dataField === 'article.description') {
        e.cellElement.innerText =  e.data.article.matierePremiere.variete.description + ' ' + e.cellElement.innerText;
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

  onEditorPreparing(e) {
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
    this.datagrid.instance.saveEditData().then(res => console.log(res));
  }

  onValueChanged(event, cell) {
    if (cell.setValue) {
      // cell.setValue(cell.column.dataField === 'proprietaireMarchandise' ? event.value.code : event.value);
      cell.setValue(event.value);
    }
  }

  onCellClick(e) {
  }


}
