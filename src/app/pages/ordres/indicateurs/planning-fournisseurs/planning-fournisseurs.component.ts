import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Ordre from 'app/shared/models/ordre.model';
import { AuthService, LocalizationService, FournisseursService } from 'app/shared/services';
import { Operation, OrdresService } from 'app/shared/services/api/ordres.service';
import { FormUtilsService } from 'app/shared/services/form-utils.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { GridColumn, ONE_DAY } from 'basic';
import { DxDataGridComponent, DxSelectBoxComponent, DxCheckBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TabContext } from '../../root/root.component';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DateManagementService } from 'app/shared/services/date-management.service';
import { BureauxAchatService } from 'app/shared/services/api/bureaux-achat.service';

enum InputField {
  bureauAchat = 'logistiques.fournisseur.bureauAchat',
  secteurCommercial = 'secteurCommercial',
  fournisseur = 'logistiques.fournisseur',
  from = 'logistiques.dateDepartPrevueFournisseur',
  to = 'logistiques.dateDepartPrevueFournisseur',
}

enum validField {
  client = 'client.valide',
  entrepot = 'entrepot.valide',
  fournisseur = 'logistiques.fournisseur.valide',
}

type Inputs<T = any> = {[key in keyof typeof InputField]: T};

@Component({
  selector: 'app-planning-fournisseurs',
  templateUrl: './planning-fournisseurs.component.html',
  styleUrls: ['./planning-fournisseurs.component.scss']
})
export class PlanningFournisseursComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = 'PlanningFournisseurs';

  private indicator = this.ordresIndicatorsService
  .getIndicatorByName(this.INDICATOR_NAME);
  private gridConfig: Promise<GridConfig>;
  public periodes: any;
  private priceColumns = ['lignes.ventePrixUnitaire', 'lignes.achatPrixUnitaire'];
  public validRequiredEntity: {};

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild('periodeSB', { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild('prices', { static: false }) prices: DxCheckBoxComponent;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public secteurs: DataSource;
  public fournisseurs: DataSource;
  public bureauxAchat: DataSource;

  public formGroup = new FormGroup({
    bureauAchat: new FormControl(),
    secteurCommercial: new FormControl(),
    fournisseur: new FormControl(),
    from: new FormControl(this.dateManagementService.startOfDay()),
    to: new FormControl(this.dateManagementService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public ordresService: OrdresService,
    public secteursService: SecteursService,
    public fournisseursService: FournisseursService,
    public bureauxAchatService: BureauxAchatService,
    public authService: AuthService,
    public dateManagementService: DateManagementService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    public currentCompanyService: CurrentCompanyService,
    private tabContext: TabContext,
    private formUtils: FormUtilsService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.PlanningFournisseurs);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    this.secteurs = secteursService.getDataSource();
    this.fournisseurs = fournisseursService.getDataSource_v2(['id', 'raisonSocial']);
    this.bureauxAchat = bureauxAchatService.getDataSource_v2(['id', 'raisonSocial']);
    this.validRequiredEntity = {client: true, entrepot: true, fournisseur: true};

    this.secteurs.filter([
      ['valide', '=', true],
      'and',
      ['societes', 'contains', this.currentCompanyService.getCompany().id]
    ]);
    this.periodes = this.dateManagementService.periods();
  }

  async ngOnInit() {
    const fields = this.columns
    .pipe(map( columns => columns.map( column => column.dataField )));

    this.ordresDataSource = this.ordresService
    // .getDataSource_v2(await fields.toPromise(), Operation.PlanningFournisseurs);
    .getDataSource_v2(await fields.toPromise());
    this.formGroup.valueChanges.subscribe(_ => this.enableFilters());
    this.formGroup.updateValueAndValidity();
  }

  ngAfterViewInit() {
    this.formGroup.get('secteurCommercial').patchValue({
      id : this.authService.currentUser.secteurCommercial.id,
      description : this.authService.currentUser.secteurCommercial.description
    });
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
    this.datagrid.dataSource = this.ordresDataSource;
  }

  validOrAll(e) {
    this.validRequiredEntity[e.element.dataset.entity] = !this.validRequiredEntity[e.element.dataset.entity];
    const Element = e.element as HTMLElement;
    Element.classList.toggle('lowOpacity');
    this.enableFilters();
  }

  showHidePrices() {
    const prices = this.prices.instance.option('value');
    this.priceColumns.map( field => this.datagrid.instance.columnOption(field, 'visible', prices));
  }

  onRowDblClick({data}: {data: Ordre}) {
    this.tabContext.openOrdre(data.numero);
  }

  private buildFormFilter(values: Inputs): any[] {
    const filter = [];

    // Valid entities
    Object.keys(validField).map(entity => {
      if (this.validRequiredEntity[entity]) {
        filter.push([validField[entity], '=', 'true']);
      }
    });

    if (values.bureauAchat)
      filter.push([InputField.bureauAchat, '=', values.bureauAchat]);

    if (values.secteurCommercial)
      filter.push([InputField.secteurCommercial, '=', values.secteurCommercial]);

    if (values.fournisseur)
      filter.push([InputField.fournisseur, '=', values.fournisseur]);

    if (values.from)
      filter.push([InputField.from, '>=', values.from]);

    if (values.to)
      filter.push([InputField.to, '<=', values.to]);

    return filter.length
       ? filter.reduce((crt, acm) => [crt, 'and', acm])
       : null;
  }

  manualDate(e) {

    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.formGroup.get('from').value);
    const fin = new Date(this.formGroup.get('to').value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains('dateStart')) {
        this.formGroup.get('to').patchValue(this.dateManagementService.endOfDay(deb));
      } else {
        this.formGroup.get('from').patchValue(this.dateManagementService.startOfDay(fin));
      }
    }
    this.periodeSB.value = null;

  }

  setDates(e) {

    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;
    const datePeriod = this.dateManagementService.getDates(e);

    this.formGroup.patchValue({
      from: datePeriod.dateDebut,
      to: datePeriod.dateFin
    });

  }

}

export default PlanningFournisseursComponent;
