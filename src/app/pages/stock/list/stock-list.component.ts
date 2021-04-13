import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { StockArticlesAgeService } from 'app/shared/services/api/stock-articles-age.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { ClientsService } from '../../../shared/services/api/clients.service';
import { FournisseursService } from '../../../shared/services/api/fournisseurs.service';
import { StockCategory, StockService } from '../../../shared/services/api/stock.service';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss']
})

export class StockListComponent implements OnInit {

  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;
  now: number;
  linesCount: number;

  stockForm = this.fb.group({
    id: [''],
    bureauAchat: [''],
    fournisseur: [''],
    espece: [''],
    client: [''],
    variete: [''],
    calibreUnifie: [''],
    origine: [''],
    modeCulture: [''],
    emballage: [''],
    calibreMarquage: [''],
    groupeEmballage: ['']
  });

  stockArticlesAge: DataSource;
  especes: DataSource;
  origines: DataSource;
  varietes: DataSource;
  calibresUnifies: DataSource;
  calibresMarquages: DataSource;
  emballages: DataSource;
  matieresPremieres: DataSource;
  categories: DataSource;
  fournisseurs: DataSource;
  clients: DataSource;
  secteurs: DataSource;

  stockCategories: StockCategory[];
  columnChooser = environment.columnChooser;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  tagFilters: { [path: string]: string[] } = {};

  constructor(
    public stocksService: StockService,
    public stockArticlesAgeService: StockArticlesAgeService,
    public fournisseursService: FournisseursService,
    public clientsService: ClientsService,
    public currentCompanyService: CurrentCompanyService,
    public secteursService: SecteursService,
    private fb: FormBuilder,
    private router: Router,
    public gridConfiguratorService: GridConfiguratorService,
  ) { }

  ngOnInit() {
    this.stockCategories = this.stocksService.getStockCategories();
    this.stockArticlesAgeService.customVariables.societe = this.currentCompanyService.getCompany();
    this.stockArticlesAge = this.stockArticlesAgeService.getFetchDatasource();
    this.stockArticlesAge.on('changed', _ => {
      this.linesCount = this.dataGrid.instance.totalCount();
      this.now = Date.now();
    });
    this.detailedFields = this.stockArticlesAgeService.model.getDetailedFields(2);

    this.especes = this.stockArticlesAgeService
      .getFilterDatasource('article.matierePremiere.espece.description');
    this.origines = this.stockArticlesAgeService
      .getFilterDatasource('article.matierePremiere.origine.description');
    this.varietes = this.stockArticlesAgeService
      .getFilterDatasource('article.matierePremiere.variete.description');
    this.calibresUnifies = this.stockArticlesAgeService
      .getFilterDatasource('article.matierePremiere.calibreUnifie.description');
    this.calibresMarquages = this.stockArticlesAgeService
      .getFilterDatasource('article.normalisation.calibreMarquage.description');
    this.emballages = this.stockArticlesAgeService
      .getFilterDatasource('article.emballage.emballage.description');
    this.matieresPremieres = this.stockArticlesAgeService
      .getFilterDatasource('article.matierePremiere.modeCulture.description');
    this.categories = this.stockArticlesAgeService
      .getFilterDatasource('article.cahierDesCharge.categorie.description');

    this.secteurs = this.secteursService.getDataSource();
    this.fournisseurs = this.fournisseursService.getDataSource();
    this.fournisseurs.filter(['valide', '=', true]);
    this.clients = this.clientsService.getDataSource();

  }

  /**
   * Apply filters from tag boxs
   * @param event List of field values
   * @param dataField Field path
   */
  onFieldValueChange(event: string[], dataField: string) {
    this.tagFilters[dataField] = event;
    const filters = Object
      .entries(this.tagFilters)
      .filter(([, values]) => values.length)
      .map(([path, values]) => values
        .map(value => [path, '=', value])
        .map(value => JSON.stringify(value))
        .join(`¤${JSON.stringify(['or'])}¤`)
        .split('¤')
        .map(v => JSON.parse(v))
      )
      .map(value => JSON.stringify(value))
      .join(`¤${JSON.stringify(['and'])}¤`)
      .split('¤')
      .map(v => JSON.parse(v));

    this.stockArticlesAge.filter(filters);
    this.stockArticlesAge.reload();
  }

  onCustomFilterChange(items: any[], selector: string) {
    items.length ?
      this.stockArticlesAgeService.customVariables[selector] = items.map(value => (delete value.__typename, value)) :
      delete this.stockArticlesAgeService.customVariables[selector];
    this.stockArticlesAge.reload();
  }

  onFilterChange(e) {

    const columnVisible = (e.value === null);
    this.dataGrid.instance.columnOption(e.element.id, 'visible', columnVisible);

  }

  onCellPrepared(e) {
    // Fond jaune pour les stocks J21
    if (e.column.dataField === 'j21aX' && e.rowType === 'data') {
      e.cellElement.classList.add('highlight-stockJ21-cell');
    }
  }

  onSelectClick(e) {
    console.log('selection');
  }

  onDetailClick(e) {
    console.log('détail');
  }

  onViewClick() {
    const self = this;
    return (e) => {
      e.event.preventDefault();
      self.router.navigate([`/articles/${e.row.data.article.id}`]);
    };
  }

  onClientClick(e) {
    console.log('client');
  }

}
