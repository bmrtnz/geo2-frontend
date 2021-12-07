import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import Ordre from 'app/shared/models/ordre.model';
import { AuthService, LocalizationService, TransporteursService, ClientsService, FournisseursService } from 'app/shared/services';
import { Operation, OrdresService } from 'app/shared/services/api/ordres.service';
import { FormUtilsService } from 'app/shared/services/form-utils.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { GridColumn } from 'basic';
import { DxDataGridComponent, DxSelectBoxComponent, DxFormComponent, DxSwitchComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TabContext } from '../../root/root.component';
import { DateManagementService } from 'app/shared/services/date-management.service';
import { Role } from 'app/shared/models';
import { PersonnesService } from 'app/shared/services/api/personnes.service';

enum InputField {
  client = 'client',
  fournisseur = 'logistiques.fournisseur',
  commercial = 'client.commercial',
  dateMaxMouvements = 'logistiques.dateDepartPrevueFournisseur',
}

enum validField {
  client = 'client.valide',
  entrepot = 'entrepot.valide',
  fournisseur = 'logistiques.fournisseur.valide',
}

type Inputs<T = any> = {[key in keyof typeof InputField]: T};

@Component({
  selector: 'app-supervision-comptes-palox',
  templateUrl: './supervision-comptes-palox.component.html',
  styleUrls: ['./supervision-comptes-palox.component.scss']
})
export class SupervisionComptesPaloxComponent implements OnInit {
  readonly INDICATOR_NAME = 'SupervisionComptesPalox';

  private indicator = this.ordresIndicatorsService
  .getIndicatorByName(this.INDICATOR_NAME);
  private gridConfig: Promise<GridConfig>;
  public validRequiredEntity: {};

  @ViewChildren(DxDataGridComponent) paloxGrids: QueryList<DxDataGridComponent>;

  @ViewChild('switchType', { static: false }) switchType: DxSwitchComponent;
  @ViewChild('switchEntity', { static: false }) switchEntity: DxSwitchComponent;

  public columnChooser = environment.columnChooser;
  public switchOptions = [];
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public commercial: DataSource;
  public client: DataSource;
  public fournisseur: DataSource;
  public formGroup = new FormGroup({
    client: new FormControl(),
    fournisseur: new FormControl(),
    commercial: new FormControl(),
    dateMaxMouvements: new FormControl(this.dateManagementService.startOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public ordresService: OrdresService,
    public clientsService: ClientsService,
    public fournisseursService : FournisseursService,
    public personnesService: PersonnesService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private tabContext: TabContext,
    private formUtils: FormUtilsService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.PlanningTransporteurs);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    this.validRequiredEntity = {client: true, entrepot: true, fournisseur: true};
    this.client = this.clientsService.getDataSource_v2(['id', 'code', 'raisonSocial']);
    this.fournisseur = this.fournisseursService.getDataSource_v2(['id', 'code', 'raisonSocial']);
    this.commercial = this.personnesService.getDataSource_v2(['id', 'nomUtilisateur']);
    this.commercial.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.COMMERCIAL],
      'and',
      ['nomUtilisateur', '<>', 'null']
    ]);
    this.switchOptions = ['mouv', 'recap', 'Clients', 'Fournisseurs'];
  }

  async ngOnInit() {
    const fields = this.columns
    .pipe(map( columns => columns.map( column => column.dataField )));

    this.ordresDataSource = this.ordresService
    // .getDataSource_v2(await fields.toPromise(), Operation.PlanningTransporteurs);
    .getDataSource_v2(await fields.toPromise());
    this.formGroup.valueChanges.subscribe(_ => this.enableFilters());
  }

  enableFilters() {
      const values: Inputs = this.formGroup.value;
      const extraFilters = this.buildFormFilter(values);
      this.ordresDataSource.filter([
        ...this.indicator.cloneFilter(),
        ...extraFilters.filter(v => v != null).length
          ? ['and', ...extraFilters]
          : [],
      ]);
  }

  afterViewInit() {
    this.paloxGrids.forEach((element) => {
      element.dataSource = this.ordresDataSource;
    });
  }

  onRowDblClick({data}: {data: Ordre}) {
    this.tabContext.openOrdre(data.numero);
  }

  displayCodeBefore(data) {
    return data ?
    ((data.code ? data.code : data.id) + ' ' + (data.nomUtilisateur ? data.nomUtilisateur :
     (data.raisonSocial ? data.raisonSocial : data.description)))
     : null;
  }

  switchChange(e) {
    const grid = (this.switchType.value ? 1 : 0) + 2 * (this.switchEntity.value ? 1 : 0);
    this.paloxGrids.forEach((element, index) => {
      element.visible = (index === grid);
    });
  }

  private buildFormFilter(values: Inputs): any[] {
    const filter = [];

    if (values.client)
      filter.push([InputField.client, '=', values.client]);

    if (values.fournisseur)
      filter.push([InputField.fournisseur, '=', values.fournisseur]);

    if (values.commercial)
      filter.push([InputField.commercial, '=', values.commercial]);

    if (values.dateMaxMouvements)
      filter.push([InputField.dateMaxMouvements, '<=', values.dateMaxMouvements]);

    return filter.length
       ? filter.reduce((crt, acm) => [crt, 'and', acm])
       : null;

  }
}

export default SupervisionComptesPaloxComponent;
