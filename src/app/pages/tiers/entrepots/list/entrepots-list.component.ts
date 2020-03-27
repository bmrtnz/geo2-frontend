import {Component, OnInit} from '@angular/core';
import {EntrepotsService} from '../../../../shared/services/entrepots.service';
import {Entrepot} from '../../../../shared/models';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';

@Component({
  selector: 'app-entrepots-list',
  templateUrl: './entrepots-list.component.html',
  styleUrls: ['./entrepots-list.component.scss']
})
export class EntrepotsListComponent implements OnInit {

  dataSource: any;
  entrepots: [Entrepot];

  constructor(
    private entrepotsService: EntrepotsService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.entrepotsService.get().then(c => {
      this.dataSource = {
        store: new ArrayStore({
          key: 'id',
          data: c
        })
      };
    });
  }

  onRowDblClick(e) {
    // console.log(`/entrepots/${e.data.id}`)
    this.router.navigate([`/tiers/entrepots/${e.data.id}`]);
  }

}
