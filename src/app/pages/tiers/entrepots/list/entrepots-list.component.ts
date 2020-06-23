import { Component, OnInit } from '@angular/core';
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

  constructor(
    public entrepotsService: EntrepotsService,
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
    this.router.navigate([`/tiers/clients/${this.route.snapshot.params.id}/entrepots/${e.data.id}`]);
  }
  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }
}
