import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Role } from 'app/shared/models';
import MouvementEntrepot from 'app/shared/models/mouvement-entrepot.model';
import MouvementFournisseur from 'app/shared/models/mouvement-fournisseur.model';
import Ordre from 'app/shared/models/ordre.model';
import RecapitulatifEntrepot from 'app/shared/models/recapitulatif-entrepot.model';
import RecapitulatifFournisseur from 'app/shared/models/recapitulatif-fournisseur.model';
import { AuthService, EntrepotsService, FournisseursService, LocalizationService } from 'app/shared/services';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { SupervisionPaloxsService } from 'app/shared/services/api/supervision-paloxs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DateManagementService } from 'app/shared/services/date-management.service';
import { FormUtilsService } from 'app/shared/services/form-utils.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { GridColumn } from 'basic';
import { DxDataGridComponent, DxSwitchComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TabContext } from '../../root/root.component';

enum InputField {
  entrepot = 'entrepot',
  commercial = 'commercial',
  dateMaxMouvements = 'dateMaxMouvements',
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
  private gridConfig: Promise<GridConfig>[];
  public validRequiredEntity: {};

  @ViewChildren(DxDataGridComponent) paloxGrids: QueryList<DxDataGridComponent>;

  @ViewChild('switchType', { static: false }) switchType: DxSwitchComponent;
  @ViewChild('switchEntity', { static: false }) switchEntity: DxSwitchComponent;

  public columnChooser = environment.columnChooser;
  public switchOptions = [];
  public columns: Observable<GridColumn[]>[];
  public ordresDataSource: DataSource;
  public commercial: DataSource;
  public entrepot: DataSource;
  public fournisseur: DataSource;
  public formGroup = new FormGroup({
    entrepot: new FormControl(),
    commercial: new FormControl(),
    dateMaxMouvements: new FormControl(this.dateManagementService.startOfDay()),
  } as Inputs<FormControl>);

  private datasources: Promise<DataSource>[] = [];

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public ordresService: OrdresService,
    public supervisionPaloxsService: SupervisionPaloxsService,
    public entrepotsService: EntrepotsService,
    public fournisseursService : FournisseursService,
    public personnesService: PersonnesService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private tabContext: TabContext,
    private formUtils: FormUtilsService,
    private currentCompanyService: CurrentCompanyService,
  ) {
    this.validRequiredEntity = {client: true, entrepot: true, fournisseur: true};
    this.entrepot = this.entrepotsService.getDataSource_v2(['id', 'code', 'raisonSocial']);
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

  ngOnInit() {
    this.gridConfig = [
      Grid.MouvClientsComptesPalox,
      Grid.RecapClientsComptesPalox,
      Grid.MouvFournisseursComptesPalox,
      Grid.RecapFournisseursComptesPalox,
    ].map( c => this.gridConfiguratorService.fetchDefaultConfig(c));

    this.columns = this.gridConfig.map( g =>
      from(g).pipe(map( config => config.columns ))
    );

    const fields = this.columns.map( c =>
      c.pipe(map( columns => columns.map( column => column.dataField )))
    );

    this.datasources = [
      MouvementEntrepot,
      RecapitulatifEntrepot,
      MouvementFournisseur,
      RecapitulatifFournisseur,
    ].map( async (m, i) =>
      await this.supervisionPaloxsService.getListDataSource(await fields[i].toPromise(), m)
    );

    this.formGroup.valueChanges.subscribe(_ => this.enableFilters());
  }

  enableFilters() {
    const values: Inputs = this.formGroup.value;
    this.supervisionPaloxsService.setPersisantVariables({
      codeSociete: this.currentCompanyService.getCompany().id,
      codeCommercial: values.commercial?.id,
      codeEntrepot: values.entrepot?.id,
      dateMaxMouvements: values.dateMaxMouvements,
    });
    (this.paloxGrids
    .find((_, i) => i === this.getActiveGridIndex())
    ?.dataSource as DataSource)
    ?.reload();
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
    this.paloxGrids.forEach(async (component, index) => {
      const isCurrent = this.getActiveGridIndex();
      component.visible = (index === isCurrent);
      component.dataSource = isCurrent
      ? await (this.datasources[index])
      : null;
    });
    this.enableFilters();
  }

  private getActiveGridIndex() {
    return (this.switchType.value ? 1 : 0) + 2 * (this.switchEntity.value ? 1 : 0);
  }

}

export default SupervisionComptesPaloxComponent;
