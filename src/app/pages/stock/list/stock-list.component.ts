import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import { StockCategory, StockService } from '../../../shared/services/stock.service';
import { ArticlesService } from '../../../shared/services/articles.service';
import { BureauxAchatService } from '../../../shared/services/bureaux-achat.service';
import { FournisseursService } from '../../../shared/services/fournisseurs.service';
import { VarietesService } from '../../../shared/services/varietes.service';
import { ClientsService } from '../../../shared/services/clients.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent, DxSelectBoxComponent, DxTagBoxComponent } from 'devextreme-angular';
import { valueFromAST } from 'graphql';
import { OriginesService } from 'app/shared/services/origines.service';
import { CalibresUnifiesService } from 'app/shared/services/calibres-unifies.service';
import { ModesCultureService } from 'app/shared/services/modes-culture.service';
import { GroupesEmballageService } from 'app/shared/services/groupes-emballage.service';
import { CalibresMarquageService } from 'app/shared/services/calibres-marquage.service';
import { EmballagesService } from 'app/shared/services/emballages.service';
import { environment } from 'environments/environment';
import { EspecesService } from 'app/shared/services/especes.service';
import { StockArticlesAgeService } from 'app/shared/services/stock-articles-age.service';
import { ModelFieldOptions } from 'app/shared/models/model';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss']
})

export class StockListComponent implements OnInit {

  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;

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
  fournisseurs: DataSource;
  clients: DataSource;

  stockCategories: StockCategory[];
  columnChooser = environment.columnChooser;
  detailedFields: ({ name: string } & ModelFieldOptions)[];

  constructor(
    public stocksService: StockService,
    public stockArticlesAgeService: StockArticlesAgeService,
    public fournisseursService: FournisseursService,
    public clientsService: ClientsService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.stockCategories = this.stocksService.getStockCategories();
    this.stockArticlesAge = this.stockArticlesAgeService.getDataSource();
    this.detailedFields = this.stockArticlesAgeService.model.getDetailedFields(3);

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
    // TODO Filter when fournisseurs.stocks not empty
    this.fournisseurs = this.fournisseursService.getDataSource();
    this.clients = this.clientsService.getDataSource();

  }

  onFieldValueChange(event: {key: string}[], dataField: string) {
    this.dataGrid.instance.columnOption(dataField, 'filterValues', event);
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

  onViewClick(e) {
    console.log('fiche article');
  }

  onClientClick(e) {
    console.log('client');
  }

}
