import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';
import { StockCategory, StockService } from '../../../shared/services/stock.service';
import { ArticlesService } from '../../../shared/services/articles.service';
import { BureauxAchatService } from '../../../shared/services/bureaux-achat.service';
import { FournisseursService } from '../../../shared/services/fournisseurs.service';
import { VarietesService } from '../../../shared/services/varietes.service';
import { ClientsService } from '../../../shared/services/clients.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular';
import { valueFromAST } from 'graphql';
import { OriginesService } from 'app/shared/services/origines.service';
import { CalibresUnifiesService } from 'app/shared/services/calibres-unifies.service';
import { ModesCultureService } from 'app/shared/services/modes-culture.service';
import { GroupesEmballageService } from 'app/shared/services/groupes-emballage.service';
import { CalibresMarquageService } from 'app/shared/services/calibres-marquage.service';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
})

export class StockListComponent implements OnInit {

  produitGrid: DxDataGridComponent;
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

  especes: any[];
  bureauxAchat: DataSource;
  varietes: DataSource;
  fournisseurs: DataSource;
  clients: DataSource;
  typesVarietal: any[];
  modesCulture: DataSource;
  origines: DataSource;
  calibresUnifies: DataSource;
  calibresMarquage: DataSource;
  groupesEmballage: DataSource;
  colorations: any[];
  typesVente: any[];
  stickeurs: any[];
  marques: any[];
  emballages: any[];
  conditionsSpecial: any[];
  alveoles: any[];
  categories: any[];
  sucres: any[];
  penetros: any[];
  cirages: any[];
  rangements: any[];
  etiquettesClient: any[];
  etiquettesUC: any[];
  etiquettesEvenementielle: any[];

  id: string;

  stockCategories: StockCategory[];
  articles: DataSource;
  itemCount: number;

  constructor(
    private articlesService: ArticlesService,
    private bureauxAchatService: BureauxAchatService,
    private fournisseursService: FournisseursService,
    private varietesService: VarietesService,
    private originesService: OriginesService,
    private modesCultureService: ModesCultureService,
    private calibresUnifiesService: CalibresUnifiesService,
    private calibresMarquageService: CalibresMarquageService,
    private groupesEmballageService: GroupesEmballageService,
    public clientsService: ClientsService,
    public stocksService: StockService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.stockCategories = this.stocksService.getStockCategories();

    this.groupesEmballage = this.groupesEmballageService.getDataSource();
    this.calibresMarquage = this.calibresMarquageService.getDataSource();
    this.calibresUnifies = this.calibresUnifiesService.getDataSource();
    this.modesCulture = this.modesCultureService.getDataSource();
    this.varietes = this.varietesService.getDataSource();
    this.origines = this.originesService.getDataSource();
    this.bureauxAchat = this.bureauxAchatService.getDataSource();
    this.fournisseurs = this.fournisseursService.getDataSource();
    this.clients = this.clientsService.getDataSource();
    this.articles = this.articlesService.getDataSource();

  }

  onSelectClick(e) {
    alert('selection');
  }

  onDetailClick(e) {
    alert('détail');
  }

  onViewClick(e) {
    alert('fiche article');
  }

  onClientClick(e) {
    alert('client');
  }

  onQuickSearchChange(e) {
    const divs = document.getElementsByClassName('dx-texteditor-input')[10];
    divs.focus();
    divs.value = e.value;
    setTimeout(() => {
      e.element.querySelector('input').focus();
    }, 20);
  }

}
