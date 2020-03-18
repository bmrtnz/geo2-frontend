import {Component, OnInit} from '@angular/core';
import {LieuxPassageAQuaiService} from '../../../../shared/services/lieux-passage-a-quai.service';
import {LieuPassageAQuai} from '../../../../shared/models/lieu-passage-a-quai.model';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';

@Component({
  selector: 'app-lieux-passage-a-quai-list',
  templateUrl: './lieux-passage-a-quai-list.component.html',
  styleUrls: ['./lieux-passage-a-quai-list.component.scss']
})
export class LieuxPassageAQuaiListComponent implements OnInit {

  dataSource: any;
  lieuxpassageaquai: [LieuPassageAQuai];

  constructor(
    private lieuxpassageaquaiService: LieuxPassageAQuaiService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.lieuxpassageaquaiService.get().then(c => {
      console.log(c);
      this.dataSource = {
        store: new ArrayStore({
          key: 'id',
          data: c
        })
      };
    });
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/lieux-passage-a-quai/${e.data.id}`]);
  }

}
