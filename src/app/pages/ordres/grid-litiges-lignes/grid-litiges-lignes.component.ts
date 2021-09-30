import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Envois from 'app/shared/models/envois.model';
import { EnvoisService } from 'app/shared/services/api/envois.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import {AuthService} from 'app/shared/services/auth.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import Ordre from 'app/shared/models/ordre.model';
import { LitigesLignesService } from 'app/shared/services/api/litiges-lignes.service';
import LitigeLigne from 'app/shared/models/litige-ligne.model';
import { ToggledGrid } from '../form/form.component';

@Component({
  selector: 'app-grid-litiges-lignes',
  templateUrl: './grid-litiges-lignes.component.html',
  styleUrls: ['./grid-litiges-lignes.component.scss']
})
export class GridLitigesLignesComponent implements OnInit, ToggledGrid {

  @Output() public ordreSelected = new EventEmitter<LitigeLigne>();
  @Input() public filter: [];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, {static :true}) dataGrid : DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;

  constructor(
    private litigesLignesService: LitigesLignesService,
    public currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.detailedFields = this.litigesLignesService.model.getDetailedFields(3)
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('ordreLitigesLignes-' + field.path.replaceAll('.', '-'))).length);
      }),
    );

  }

  ngOnInit() {
    // this.enableFilters();
  }

  sortGrid() {
    // this.dataGrid.instance.columnOption("dateModification", {​​​​​​​​ sortOrder: "desc"}​​​​​​​​);
  }

  enableFilters() {
    if (this.ordre?.id) {
      this.dataSource = this.litigesLignesService.getDataSource();
      this.dataSource.filter([
        ['ordreLigne.ordre.id', '=', this.ordre.id],
      ])
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }

  reload() {
    this.dataSource.reload();
  }

}
