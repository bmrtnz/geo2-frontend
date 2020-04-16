import {Component, OnInit, OnDestroy} from '@angular/core';
import {LieuxPassageAQuaiService} from '../../../../shared/services/lieux-passage-a-quai.service';
import {LieuPassageAQuai} from '../../../../shared/models/lieu-passage-a-quai.model';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-lieux-passage-a-quai-list',
  templateUrl: './lieux-passage-a-quai-list.component.html',
  styleUrls: ['./lieux-passage-a-quai-list.component.scss']
})
export class LieuxPassageAQuaiListComponent implements OnInit, OnDestroy {

  dataSource: any;
  lieuxpassageaquai: [LieuPassageAQuai];
  private querySubscription: Subscription;

  constructor(
    private lieuxpassageaquaiService: LieuxPassageAQuaiService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.querySubscription = this.lieuxpassageaquaiService.getAll()
    .pipe(map(res => new ArrayStore({
      key: this.lieuxpassageaquaiService.keyField,
      data: res.data.allLieuPassageAQuai.edges.map( ({node}) => node ),
    })))
    .subscribe(store => this.dataSource = {store});
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/lieux-passage-a-quai/${e.data.id}`]);
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}
