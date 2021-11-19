import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ViewDocument } from 'app/shared/components/view-document-popup/view-document-popup.component';
import Envois from 'app/shared/models/envois.model';
import Ordre from 'app/shared/models/ordre.model';
import { EnvoisService } from 'app/shared/services/api/envois.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';
import { envois } from 'assets/configurations/grids.json';
import { ToggledGrid } from '../form/form.component';
import { GridColumn } from 'basic';

@Component({
  selector: 'app-grid-envois',
  templateUrl: './grid-envois.component.html',
  styleUrls: ['./grid-envois.component.scss']
})
export class GridEnvoisComponent implements OnInit, ToggledGrid {

  @Output() public ordreSelected = new EventEmitter<Envois>();
  @Input() public filter: [];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, {static: true}) dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];

  public documentVisible = false;
  public currentDocument: ViewDocument;

  constructor(
    private envoisService: EnvoisService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.detailedFields = envois.columns;
  }

  ngOnInit() {}

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.envoisService.getDataSource();
      this.dataSource.filter([
        ['ordre.id', '=', this.ordre.id],
      ]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  reload() {
    this.dataSource.reload();
  }

  onRowDblClick(event) {
    const envoi: Envois = event.data;

    // console.log(envoi)

    if (!envoi.document || (envoi.document && !envoi.document.isPresent)) {
      notify('Désolé, document non accessible', 'error');
      return;
    }

    this.currentDocument = {
      title: `${envoi.flux.description.ucFirst()} ${envoi.typeTiers.description}`,
      document: envoi.document
    };
    this.documentVisible = true;

    this.ordreSelected.emit(event.data.ordre);
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }
}
