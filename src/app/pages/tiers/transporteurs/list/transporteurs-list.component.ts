import { Component, OnInit } from '@angular/core';
import { TransporteursService } from '../../../../shared/services';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-transporteurs-list',
  templateUrl: './transporteurs-list.component.html',
  styleUrls: ['./transporteurs-list.component.scss']
})
export class TransporteursListComponent implements OnInit {

  transporteurs: DataSource;

  constructor(
    private transporteursService: TransporteursService,
    private router: Router
  ) { }

  ngOnInit() {
    this.transporteurs = this.transporteursService.getDataSource();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/transporteurs/${e.data.id}`]);
  }

}
