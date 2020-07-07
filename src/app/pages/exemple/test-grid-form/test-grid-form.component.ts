import { Component, OnInit } from '@angular/core';
import {Client} from '../../../shared/models';
import clients from '../../../shared/data/clients';
import {Router} from '@angular/router';

@Component({
  selector: 'app-test-grid-form',
  templateUrl: './test-grid-form.component.html',
  styleUrls: ['./test-grid-form.component.scss']
})
export class TestGridFormComponent implements OnInit {
  clientsDS = clients;

  constructor(
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  onRowDblClick(e: any) {
    this.router.navigate([{ outlets: { gridForm : `/profile` }}]);
  }
}
