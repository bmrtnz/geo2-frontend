import {Component, OnInit} from '@angular/core';
import {TransporteursService} from '../../../../shared/services';
import {Client} from '../../../../shared/models';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';

@Component({
  selector: 'app-transporteurs-list',
  templateUrl: './transporteurs-list.component.html',
  styleUrls: ['./transporteurs-list.component.scss']
})
export class TransporteursListComponent implements OnInit {

  dataSource: any;
  clients: [Client];

  constructor(
    private transporteursService: TransporteursService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.transporteursService.get().then(c => {
      this.dataSource = {
        store: new ArrayStore({
          key: 'id',
          data: c
        })
      };
    });
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/transporteurs/${e.data.id}`]);
  }

}
