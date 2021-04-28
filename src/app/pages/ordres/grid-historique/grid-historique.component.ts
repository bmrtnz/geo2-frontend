import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { MruOrdresService } from 'app/shared/services/api/mru-ordres.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import {AuthService} from 'app/shared/services/auth.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DxDataGridComponent } from 'devextreme-angular';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';

@Component({
  selector: 'app-grid-historique',
  templateUrl: './grid-historique.component.html',
  styleUrls: ['./grid-historique.component.scss']
})
export class GridHistoriqueComponent implements OnInit {

  @Output() public ordreSelected = new EventEmitter<Ordre>();
  @Input() public filter: [];
  @ViewChild(DxDataGridComponent, {static :true}) dataGrid : DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;

  constructor(
    private ordresService: MruOrdresService,
    public currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    // this.dataSource = ordresService.getDataSourceGrouped(); // Groupé
    this.dataSource = ordresService.getDataSource(); // Normal
    this.detailedFields = this.ordresService.model.getDetailedFields(2)
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('ordres-' + field.path.replaceAll('.', '-').replace('.description', ''))).length);
      }),
    );
  }

  ngOnInit() {
    this.enableFilters();
  }

  sortGrid() {
    this.dataGrid.instance.columnOption("dateModification", {​​​​​​​​ sortOrder: "desc"}​​​​​​​​);
  }

  enableFilters() {
    let filters = [
      // A voir si à prendre en compte
      // ['utilisateur.nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur],
      // 'and',
      ['societe.id', '=', this.currentCompanyService.getCompany().id],
    ];
    this.dataSource.filter(filters);
    this.dataSource.reload();
  }

  reload() {
    this.dataSource.reload();
  }

}
