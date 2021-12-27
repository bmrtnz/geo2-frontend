import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NestedMain, NestedPart } from 'app/pages/nested/nested.component';
import { ClientsService, LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { EntrepotsService } from 'app/shared/services/api/entrepots.service';
import { entrepot } from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GridConfiguratorService, Grid, GridConfig } from 'app/shared/services/grid-configurator.service';


@Component({
  selector: 'app-entrepots-list',
  templateUrl: './entrepots-list.component.html',
  styleUrls: ['./entrepots-list.component.scss']
})
export class EntrepotsListComponent implements OnInit, NestedMain, NestedPart {

  entrepots: DataSource;
  clientID: string;
  clientName: string;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, {static: true})
  dataGrid: DxDataGridComponent;
  apiService: ApiService;

  constructor(
    public entrepotsService: EntrepotsService,
    public clientsService: ClientsService,
    public gridService: GridsConfigsService,
    public localizeService: LocalizationService,
    private router: Router,
    private route: ActivatedRoute,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
  ) {
    this.apiService = this.entrepotsService;
  }

  async ngOnInit() {
    // Affichage nom client à côté Entrepôts
    this.clientID = this.route.snapshot.paramMap.get('client');
    if (this.clientID) {
      this.clientsService.getOne(this.clientID).subscribe(res => {
        this.clientName = res.data.client.raisonSocial;
      });
    }

    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.Entrepot);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    const fields = this.columns.pipe(map( columns => columns.map( column => column.dataField )));
    this.entrepots = this.entrepotsService.getDataSource_v2(await fields.toPromise());
    this.enableFilters();
    this.dataGrid.dataSource = this.entrepots;
  }

  enableFilters() {
    if (!this.clientID) return;
    this.entrepots.filter(['client.id', '=', this.clientID]);
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/entrepots/${e.data.id}`]);
  }
  onCreate() {
    this.router.navigate([`/tiers/entrepots/create/${this.clientID}`]);
  }
  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

}
