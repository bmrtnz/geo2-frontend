import { Component, OnInit } from '@angular/core';
import { LieuxPassageAQuaiService } from '../../../../shared/services/lieux-passage-a-quai.service';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { ModelFieldOptions } from 'app/shared/models/model';

@Component({
  selector: 'app-lieux-passage-a-quai-list',
  templateUrl: './lieux-passage-a-quai-list.component.html',
  styleUrls: ['./lieux-passage-a-quai-list.component.scss']
})
export class LieuxPassageAQuaiListComponent implements OnInit {

  lieuxPassageAQuais: DataSource;
  detailedFields: ({ name: string } & ModelFieldOptions)[];

  constructor(
    public lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.lieuxPassageAQuais = this.lieuxPassageAQuaiService.getDataSource();
    this.detailedFields = this.lieuxPassageAQuaiService.model.getDetailedFields();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/lieux-passage-a-quai/${e.data.id}`]);
  }
  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }
}
