import { Component, OnInit, EventEmitter } from '@angular/core';
import { EntrepotsService } from '../../../../shared/services/entrepots.service';
import { Router, ActivatedRoute } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { ModelFieldOptions } from 'app/shared/models/model';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-entrepots-list',
  templateUrl: './entrepots-list.component.html',
  styleUrls: ['./entrepots-list.component.scss']
})
export class EntrepotsListComponent implements OnInit {

  entrepots: DataSource;
  clientID: string;
  detailedFields: ({ name: string } & ModelFieldOptions)[];
  columnChooser = environment.columnChooser;
  contentReadyEvent = new EventEmitter<any>();

  constructor(
    public entrepotsService: EntrepotsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.clientID = this.route.snapshot.paramMap.get('client');
    this.entrepots = this.entrepotsService.getDataSource({
      search: `client.id=="${ this.clientID }"`,
    });
    this.detailedFields = this.entrepotsService.model.getDetailedFields();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/entrepots/${e.data.id}`]);
  }
  onCreate() {
    this.router.navigate([`/tiers/entrepots/create/${this.clientID}`]);
  }
  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }

  loadDataGridState() {
    const data = window.localStorage.getItem('entrepotStorage');
    if (data !== null) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  saveDataGridState(data) {
    window.localStorage.setItem('entrepotStorage', JSON.stringify(data));
  }

}
