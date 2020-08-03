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
import { DxDataGridComponent } from 'devextreme-angular';
import { valueFromAST } from 'graphql';
import { OriginesService } from 'app/shared/services/origines.service';
import { CalibresUnifiesService } from 'app/shared/services/calibres-unifies.service';
import { ModesCultureService } from 'app/shared/services/modes-culture.service';
import { GroupesEmballageService } from 'app/shared/services/groupes-emballage.service';
import { CalibresMarquageService } from 'app/shared/services/calibres-marquage.service';
import { EmballagesService } from 'app/shared/services/emballages.service';
import { environment } from 'environments/environment';
import { EspecesService } from 'app/shared/services/especes.service';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
})

export class StockListComponent implements OnInit {

  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;

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
  especes: DataSource;
  colorations: any[];
  typesVente: any[];
  stickeurs: any[];
  marques: any[];
  emballages: DataSource;
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
  columnChooser = environment.columnChooser;

  constructor(
    private articlesService: ArticlesService,
    private especesService: EspecesService,
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
    public emballagesService: EmballagesService,
    private fb: FormBuilder,

  ) { }

  ngOnInit() {
    this.stockCategories = this.stocksService.getStockCategories();
    this.articles = this.articlesService.getDataSource();
    this.especes = this.especesService.getDataSource();
    this.bureauxAchat = this.bureauxAchatService.getDataSource();
    this.fournisseurs = this.fournisseursService.getDataSource();
    this.clients = this.clientsService.getDataSource();
    this.modesCulture = this.modesCultureService.getDataSource();
  }

  onEspeceChange(event) {
    const dsOptions = {
        search: event.value ? 'espece.id==' + event.value.id : '',
    };
    this.groupesEmballage = this.groupesEmballageService.getDataSource(dsOptions);
    this.calibresMarquage = this.calibresMarquageService.getDataSource(dsOptions);
    this.calibresUnifies = this.calibresUnifiesService.getDataSource(dsOptions);
    this.varietes = this.varietesService.getDataSource(dsOptions);
    this.origines = this.originesService.getDataSource(dsOptions);
    this.emballages = this.emballagesService.getDataSource(dsOptions);

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
    /*const divs = document.getElementsByClassName('dx-texteditor-input')[10];
    divs.focus();
    divs.value = e.value;*/
    setTimeout(() => {
      e.element.querySelector('input').focus();
    }, 20);
  }

}
