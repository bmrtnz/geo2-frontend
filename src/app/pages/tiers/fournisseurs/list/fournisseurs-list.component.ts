import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { FournisseursService } from '../../../../shared/services/fournisseurs.service';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { Fournisseur } from 'app/shared/models';
import { NestedGrid } from 'app/pages/nested/nested.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit, OnDestroy, NestedGrid<Fournisseur> {

  fournisseurs: DataSource;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  contentReadyEvent = new EventEmitter<any>();
  rowDetailsRequested = new EventEmitter<Fournisseur>();
  onRowDetailsSubscription: Subscription;
  detailsNavigationHook: (row) => [any[], NavigationExtras] = (event: Fournisseur) => [
    [ event.id ],
    { relativeTo: this.activatedRoute.parent },
  ]

  constructor(
    public fournisseursService: FournisseursService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.fournisseurs = this.fournisseursService.getDataSource();
    this.onRowDetailsSubscription = this.rowDetailsRequested
    .pipe(map( this.detailsNavigationHook ))
    .subscribe( navigationParams => this.router.navigate(...navigationParams));
  }

  ngOnDestroy() {
    this.onRowDetailsSubscription.unsubscribe();
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }
}
