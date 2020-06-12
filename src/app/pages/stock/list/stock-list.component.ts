import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';
import { StockCategory, StockService } from '../../../shared/services/stock.service';
import { ArticlesService } from '../../../shared/services/articles.service';
import { BureauxAchatService } from '../../../shared/services/bureaux-achat.service';
import { FournisseursService } from '../../../shared/services/fournisseurs.service';
import { ClientsService } from '../../../shared/services/clients.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
})

export class StockListComponent implements OnInit, AfterViewInit {

  @ViewChild(DxDataGridComponent, {static: true}) grid: DxDataGridComponent;
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
  varietes: any[];
  fournisseurs: DataSource;
  clients: DataSource;
  typesVarietal: any[];
  modesCulture: any[];
  origines: any[];
  calibresUnifie: any[];
  calibresMarquage: any[];
  groupesEmballage: any[];
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
  stockItems: any;
  itemCount: number;

  constructor(
    private articlesService: ArticlesService,
    private bureauxAchatService: BureauxAchatService,
    private fournisseursService: FournisseursService,
    public clientsService: ClientsService,
    public stocksService: StockService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngAfterViewInit() {
    console.log(this.grid);
  }

  ngOnInit() {
    this.stockCategories = this.stocksService.getStockCategories();
    this.articlesService.getVarietes().then(v => {
      this.varietes = v;
    });
    this.bureauxAchat = this.bureauxAchatService.getDataSource();
    this.fournisseurs = this.fournisseursService.getDataSource();
    this.clients = this.clientsService.getDataSource();
    this.articlesService.getOrigine().then(o => {
      this.origines = o;
    });
    this.articlesService.getCalibreUnifie().then(cu => {
      this.calibresUnifie = cu;
    });
    this.articlesService.getCalibreMarquage().then(cm => {
      this.calibresUnifie = cm;
    });
    this.articlesService.getGroupeEmballage().then(ge => {
      this.groupesEmballage = ge;
    });

    this.articlesService.get().then(c => {
      this.stockItems = {
        store: new ArrayStore({
          key: 'id',
          data: c
        })
      };
    });

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

}
