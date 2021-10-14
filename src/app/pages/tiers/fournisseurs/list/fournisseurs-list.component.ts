import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import { FournisseursService } from 'app/shared/services/api/fournisseurs.service';
import {GridColumn} from 'basic';
import { fournisseur } from 'assets/configurations/grids.json';

@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit, NestedMain {

  fournisseurs: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  columnChooser = environment.columnChooser;
  detailedFields: GridColumn[];

  constructor(
    public fournisseursService: FournisseursService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    private router: Router,
    public gridRowStyleService: GridRowStyleService,
  ) {
    this.apiService = this.fournisseursService;
  }

  ngOnInit() {
    this.detailedFields = fournisseur.columns;
    this.fournisseurs = this.fournisseursService.getDataSource(this.detailedFields.map(property => property.dataField));
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/fournisseurs/${event.data.id}`]);
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

  onCreate() {
    this.router.navigate([`/tiers/fournisseurs/create`]);
  }

}
