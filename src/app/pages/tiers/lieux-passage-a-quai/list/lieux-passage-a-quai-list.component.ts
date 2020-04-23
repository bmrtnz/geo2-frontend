import { Component, OnInit, OnDestroy } from '@angular/core';
import { LieuxPassageAQuaiService } from '../../../../shared/services/lieux-passage-a-quai.service';
import { LieuPassageAQuai } from '../../../../shared/models/lieu-passage-a-quai.model';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';

@Component({
  selector: 'app-lieux-passage-a-quai-list',
  templateUrl: './lieux-passage-a-quai-list.component.html',
  styleUrls: ['./lieux-passage-a-quai-list.component.scss']
})
export class LieuxPassageAQuaiListComponent implements OnInit, OnDestroy {

  lieuxPassageAQuais: DataSource;
  public lieuxPassageAQuaisSubscription: Subscription;

  constructor(
    private lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    private router: Router
  ) {
    this.lieuxPassageAQuais = new DataSource({
      store: new ArrayStore({
        key: this.lieuxPassageAQuaiService.keyField,
      }),
    });
  }

  ngOnInit() {
    this.lieuxPassageAQuaisSubscription = this.lieuxPassageAQuaiService.getAll()
    .pipe(
      map(res => this.lieuxPassageAQuaiService.asList( res.data.allLieuPassageAQuai )),
    )
    .subscribe( res => {
      res.forEach((lieuPassageAQuai: LieuPassageAQuai) => (this.lieuxPassageAQuais.store() as ArrayStore).insert(lieuPassageAQuai));
      this.lieuxPassageAQuais.reload();
    });
  }

  ngOnDestroy() {
    this.lieuxPassageAQuaisSubscription.unsubscribe();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/lieux-passage-a-quai/${e.data.id}`]);
  }

}
