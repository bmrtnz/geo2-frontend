import { Component, OnInit, ViewChild } from '@angular/core';
import { EntrepotsService } from '../../../../shared/services/entrepots.service';
import { Router, ActivatedRoute } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-entrepots-list',
  templateUrl: './entrepots-list.component.html',
  styleUrls: ['./entrepots-list.component.scss']
})
export class EntrepotsListComponent implements OnInit {

  entrepots: DataSource;
  // @ViewChild(DxDataGridComponent, {static: true}) dataGrid: DxDataGridComponent;

  constructor(
    private entrepotsService: EntrepotsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams
    .subscribe(({ search }) => {
      this.entrepots = this.entrepotsService.getDataSource({
        search: decodeURIComponent(search),
      });
    });
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/entrepots/${e.data.id}`]);
  }

}
