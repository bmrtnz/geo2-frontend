import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DateManagementService } from 'app/shared/services/date-management.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { EntrepotsService, ClientsService, AuthService } from 'app/shared/services';
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
import notify from 'devextreme/ui/notify';

enum InputField {
  secteurCode = 'secteur',
  clientCode = 'client',
  entrepotCode = 'entrepot',
  codeCommercial = 'commercial',
  codeAssistante = 'assistante',
  dateMin = 'dateMin',
  dateMax = 'dateMax',
  societeCode = 'societe'
}

enum status {
  OK = '0',
  ALERTE = '1',
  BLOQUÉ = '2'
}

type Inputs<T = any> = {[key in keyof typeof InputField]: T};

@Component({
  selector: 'app-supervision-a-facturer',
  templateUrl: './supervision-a-facturer.component.html',
  styleUrls: ['./supervision-a-facturer.component.scss']
})
export class SupervisionAFacturerComponent implements OnInit, AfterViewInit {

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
  gridHasData: boolean;

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
    public authService: AuthService,
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
    this.clients = this.clientsService.getDataSource_v2(['id', 'code', 'raisonSocial', 'secteur.id']);
    this.entrepots = this.entrepotsService.getDataSource_v2(['id', 'code', 'raisonSocial']);
    this.commerciaux = this.personnesService.getDataSource_v2(['id', 'nomUtilisateur']);
    this.assistantes = this.personnesService.getDataSource_v2(['id', 'nomUtilisateur']);
    this.periodes = this.dateManagementService.periods();
    this.gridHasData = false;
  }

  async ngOnInit() {
    this.toRefresh = true;
    const fields = this.columns
    .pipe(map( columns => columns.map( column => column.dataField )));

    this.ordresDataSource = this.ordresBafService
    .getDataSource_v2(await fields.toPromise());
  }

  ngAfterViewInit() {

    // Only way found to validate and show Warning icon
    this.formGroup.get('secteurCode').setValue('');
    this.formGroup.get('secteurCode').reset();

    if (this.authService.currentUser.secteurCommercial) {
      this.formGroup.get('secteurCode').patchValue({
        id : this.authService.currentUser.secteurCommercial.id,
        description : this.authService.currentUser.secteurCommercial.description
      });
    }
  }

  enableFilters() {

    if (!this.formGroup.get('secteurCode').value) {
      notify('Veuillez spécifier un secteur', 'error');
    } else {
      this.toRefresh = false;

      const values: Inputs = {
        ...this.formGroup.value,
      };

      this.ordresBafService.setPersisantVariables({
        secteurCode: values.secteurCode.id,
        dateMin: this.dateManagementService.formatDate(values.dateMin),
        dateMax: this.dateManagementService.formatDate(values.dateMax),
        clientCode: values.clientCode?.id,
        societeCode: this.currentCompanyService.getCompany().id,
        entrepotCode: values.entrepotCode?.id,
        codeCommercial: values.codeCommercial?.id,
        codeAssistante: values.codeAssistante?.id
      } as Inputs);

      this.datagrid.dataSource = this.ordresDataSource;
    }

  }

  displayIDBefore(data) {
    return data ? data.code + ' ' + data.raisonSocial : null;
  }

  onFieldValueChange(e?) {
    this.toRefresh = true;
  }

  onSecteurChange(e) {
    this.onFieldValueChange();
    this.clients = this.clientsService.getDataSource_v2(['id', 'code', 'raisonSocial', 'secteur.id']);
    if (e.value) this.clients.filter(['secteur.id', '=', e.value.id]);
  }

  onClientChange(e) {
    this.onFieldValueChange();
    this.entrepots = this.entrepotsService.getDataSource_v2(['id', 'code', 'raisonSocial', 'client.id']);
    if (e.value) this.entrepots.filter(['client.id', '=', e.value.id]);
  }

  onGridContentReady(e) {
    this.gridHasData = (this.datagrid.instance.getVisibleRows().length > 0);
  }

  manualDate(e) {

    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    this.onFieldValueChange();

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.formGroup.get('dateMin').value);
    const fin = new Date(this.formGroup.get('dateMax').value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains('dateStart')) {
        this.formGroup.get('dateMax').patchValue(this.dateManagementService.endOfDay(deb));
      } else {
        this.formGroup.get('dateMin').patchValue(this.dateManagementService.startOfDay(fin));
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
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin
    });

  }

  onRowDblClick({data}: {data: Ordre}) {
    this.tabContext.openOrdre(data.numero);
  }

  launch(e) {

  }

  onCellPrepared(event) {

    const field = event.column.dataField;

    if (field?.includes('indicateur')) {

      event.cellElement.style.textAlign = 'center';
      if (event.rowType === 'filter') {
        event.cellElement.style.opacity = 0;
        event.cellElement.style.pointerEvents = 'none';
      }

      if (event.rowType === 'data') {
        if (field !== 'indicateurBAF' && event.value === '0') {
          event.cellElement.innerText = '';
          return;
        }
        event.cellElement.classList.add('BAFstatus-cell');
        event.cellElement.classList.add(this.colorizeCell(event.value));
        event.cellElement.innerText = Object.keys(status)[(Object.values(status) as string[]).indexOf(event.value)];
        if (event.data.description) {
          event.cellElement.setAttribute('title', event.data.description);
        }
      }

    }
  }

  colorizeCell(theValue) {
    let cellClassColor;
    switch (theValue) {
      case status.BLOQUÉ : cellClassColor = 'blocked'; break;
      case status.ALERTE : cellClassColor = 'alert'; break;
    }
    return (cellClassColor ?  cellClassColor : 'OK') + '-color';
  }

}

export default SupervisionAFacturerComponent;
