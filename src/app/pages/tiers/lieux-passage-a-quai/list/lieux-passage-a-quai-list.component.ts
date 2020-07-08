import { Component, OnInit, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { LieuxPassageAQuaiService } from '../../../../shared/services/lieux-passage-a-quai.service';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { LieuPassageAQuai } from 'app/shared/models';
import { DxDataGridComponent } from 'devextreme-angular';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { NestedGrid } from 'app/pages/nested/nested.component';
import { ModelFieldOptions } from 'app/shared/models/model';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-lieux-passage-a-quai-list',
  templateUrl: './lieux-passage-a-quai-list.component.html',
  styleUrls: ['./lieux-passage-a-quai-list.component.scss']
})
export class LieuxPassageAQuaiListComponent implements OnInit, OnDestroy, NestedGrid<LieuPassageAQuai> {

  lieuxPassageAQuais: DataSource;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  contentReadyEvent = new EventEmitter<any>();
  rowDetailsRequested = new EventEmitter<LieuPassageAQuai>();
  onRowDetailsSubscription: Subscription;
  detailedFields: ({ name: string } & ModelFieldOptions)[];
  columnChooser = environment.columnChooser;
  detailsNavigationHook: (row) => [any[], NavigationExtras] = (event: LieuPassageAQuai) => [
    [ event.id ],
    { relativeTo: this.activatedRoute.parent },
  ]

  constructor(
    public lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.lieuxPassageAQuais = this.lieuxPassageAQuaiService.getDataSource();
    this.onRowDetailsSubscription = this.rowDetailsRequested
    .pipe(map( this.detailsNavigationHook ))
    .subscribe( navigationParams => this.router.navigate(...navigationParams));
    this.detailedFields = this.lieuxPassageAQuaiService.model.getDetailedFields();
  }

  ngOnDestroy() {
    this.onRowDetailsSubscription.unsubscribe();
  }

  onCreate() {
    this.router.navigate([`/tiers/lieux-passage-a-quai/create`]);
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
