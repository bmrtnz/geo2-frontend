import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import LitigeLigne from 'app/shared/models/litige-ligne.model';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { LitigesLignesService } from 'app/shared/services/api/litiges-lignes.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-litiges',
  templateUrl: './litiges.component.html',
  styleUrls: ['./litiges.component.scss']
})
export class LitigesComponent implements OnInit {

  readonly INDICATOR_NAME = 'Litiges';
  typeLitiges: any;
  clotAdmin = false;
  initialFilterLengh: number;

  @Output() public ordreSelected = new EventEmitter<Ordre>();

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model>[]>;

  constructor(
    private litigesLignesService: LitigesLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private router: Router,
  ) {
    this.dataSource = this.litigesLignesService.getDataSource();
    this.detailedFields = this.litigesLignesService.model.getDetailedFields();
    this.typeLitiges = ['clôture commercial', 'clôture commercial (détail)', 'clôture administratif'];
  }

  ngOnInit() {
    this.enableFilters();
  }

  enableFilters() {
    const filters = this.ordresIndicatorsService.getIndicatorByName(this.INDICATOR_NAME).filter;
    this.initialFilterLengh = filters.length;

    this.dataSource.filter(filters);
    this.dataSource.reload();
  }

  onRowDblClick({data: litigeLigne}: {data: LitigeLigne}) {
    this.router.navigate(['pages/ordres', 'details'], {
      queryParams: {pushordres: litigeLigne.litige.ordreOrigine.id},
    });
  }

  onTypeLitigeChange(e) {
    this.clotAdmin = (e === this.typeLitiges[2]);
  }

  onClotAdmin() {
  }

}

export default LitigesComponent;
