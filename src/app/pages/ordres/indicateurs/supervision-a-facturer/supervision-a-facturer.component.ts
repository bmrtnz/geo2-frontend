import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DateManagementService } from 'app/shared/services/date-management.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { EntrepotsService, ClientsService } from 'app/shared/services';
import DataSource from 'devextreme/data/data_source';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DxSelectBoxComponent, DxDataGridComponent } from 'devextreme-angular';
import Ordre from 'app/shared/models/ordre.model';
import { TabContext } from '../../root/root.component';
import { Grid, GridConfiguratorService, GridConfig } from 'app/shared/services/grid-configurator.service';
import { environment } from 'environments/environment';
import { GridColumn } from 'basic';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrdresBafService } from 'app/shared/services/api/ordres-baf.service';

enum InputField {
  secteurCode = 'secteur',
  clientCode = 'client',
  entrepotCode = 'entrepot',
  codeCommercial = 'commercial',
  codeAssistante = 'assistante',
  dateMin = 'dateDebut',
  dateMax = 'dateFin',
  societeCode = 'societe'
}

type Inputs<T = any> = {[key in keyof typeof InputField]: T};

@Component({
  selector: 'app-supervision-a-facturer',
  templateUrl: './supervision-a-facturer.component.html',
  styleUrls: ['./supervision-a-facturer.component.scss']
})
export class SupervisionAFacturerComponent implements OnInit {

  readonly INDICATOR_NAME = 'SupervisionAFacturer';

  public ordresDataSource: DataSource;
  public secteurs: DataSource;
  public clients: DataSource;
  public entrepots: DataSource;
  public commerciaux: DataSource;
  public assistantes: DataSource;

  public periodes: string[];
  public columnChooser = environment.columnChooser;
  private gridConfig: Promise<GridConfig>;
  public columns: Observable<GridColumn[]>;
  toRefresh: boolean;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild('periodeSB', { static: false }) periodeSB: DxSelectBoxComponent;

  public formGroup = new FormGroup({
    secteurCode: new FormControl(),
    clientCode: new FormControl(),
    entrepotCode: new FormControl(),
    codeCommercial: new FormControl(),
    codeAssistante: new FormControl(),
    dateMin: new FormControl(this.dateManagementService.startOfDay()),
    dateMax: new FormControl(this.dateManagementService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private secteursService: SecteursService,
    private personnesService: PersonnesService,
    private entrepotsService: EntrepotsService,
    private clientsService: ClientsService,
    private dateManagementService: DateManagementService,
    private currentCompanyService: CurrentCompanyService,
    public ordresBafService: OrdresBafService,
    private tabContext: TabContext,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdresAFacturer);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));

    this.secteurs = this.secteursService.getDataSource();
    this.secteurs.filter([
      ['valide', '=', true],
      'and',
      ['societes', 'contains', this.currentCompanyService.getCompany().id]
    ]);
    this.clients = this.clientsService.getDataSource_v2(['id', 'raisonSocial']);
    this.entrepots = this.entrepotsService.getDataSource_v2(['id', 'raisonSocial']);
    this.commerciaux = this.personnesService.getDataSource_v2(['id', 'nomUtilisateur']);
    this.assistantes = this.personnesService.getDataSource_v2(['id', 'nomUtilisateur']);
    this.periodes = this.dateManagementService.periods();
  }

  async ngOnInit() {
    this.toRefresh = true;
    const fields = this.columns
    .pipe(map( columns => columns.map( column => column.dataField )));

    this.ordresDataSource = this.ordresBafService
    .getDataSource_v2(await fields.toPromise());
  }

  enableFilters() {
    // this.toRefresh = false;

    const values: Inputs = {
      ...this.formGroup.value,
    };

    this.ordresBafService.setPersisantVariables({
      dateMin: values.dateMin,
      dateMax: values.dateMax,
      societeCode: this.currentCompanyService.getCompany().id,
      entrepotCode: values.entrepotCode,
      codeCommercial: values.codeCommercial,
      codeAssistante: values.codeAssistante
    } as Inputs);

    this.datagrid.dataSource = this.ordresDataSource;

  }

  onFieldValueChange(e?) {
    this.toRefresh = true;
  }

  manualDate(e) {

    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    this.onFieldValueChange();

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

    this.onFieldValueChange();

    const datePeriod = this.dateManagementService.getDates(e);

    this.formGroup.patchValue({
      from: datePeriod.dateDebut,
      to: datePeriod.dateFin
    });

  }

  onRowDblClick({data}: {data: Ordre}) {
    this.tabContext.openOrdre(data.numero);
  }

}

export default SupervisionAFacturerComponent;
