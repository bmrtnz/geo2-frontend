import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DateManagementService } from 'app/shared/services/date-management.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { EntrepotsService, ClientsService } from 'app/shared/services';
import DataSource from 'devextreme/data/data_source';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
import Ordre from 'app/shared/models/ordre.model';
import { TabContext } from '../../root/root.component';
import { Grid, GridConfiguratorService, GridConfig } from 'app/shared/services/grid-configurator.service';
import { FunctionsService } from 'app/shared/services/api/functions.service';
import { environment } from 'environments/environment';
import { GridColumn } from 'basic';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

enum InputField {
  secteur = 'secteur',
  client = 'client',
  entrepot = 'entrepot',
  commercial = 'commercial',
  assistante = 'assistante',
  from = 'dateDebut',
  to = 'dateFin',
}

type Inputs<T = any> = {[key in keyof typeof InputField]: T};

@Component({
  selector: 'app-supervision-a-facturer',
  templateUrl: './supervision-a-facturer.component.html',
  styleUrls: ['./supervision-a-facturer.component.scss']
})
export class SupervisionAFacturerComponent implements OnInit {

  readonly INDICATOR_NAME = 'SupervisionAFacturer';

  public secteurs: DataSource;
  public clients: DataSource;
  public entrepots: DataSource;
  public commerciaux: DataSource;
  public assistantes: DataSource;

  public periodes: string[];
  public columnChooser = environment.columnChooser;
  private gridConfig: Promise<GridConfig>;
  public columns: Observable<GridColumn[]>;

  @ViewChild('periodeSB', { static: false }) periodeSB: DxSelectBoxComponent;

  public formGroup = new FormGroup({
    client: new FormControl(),
    secteur: new FormControl(),
    entrepot: new FormControl(),
    commercial: new FormControl(),
    assistante: new FormControl(),
    from: new FormControl(this.dateManagementService.startOfDay()),
    to: new FormControl(this.dateManagementService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private functionsService: FunctionsService,
    private secteursService: SecteursService,
    private personnesService: PersonnesService,
    private entrepotsService: EntrepotsService,
    private clientsService: ClientsService,
    private dateManagementService: DateManagementService,
    private currentCompanyService: CurrentCompanyService,
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

  ngOnInit() {
  }

  enableFilters() {
    const values: Inputs = this.formGroup.value;
    this.functionsService.visualiserOrdreBAF();
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

  onRowDblClick({data}: {data: Ordre}) {
    this.tabContext.openOrdre(data.numero);
  }

}

export default SupervisionAFacturerComponent;
