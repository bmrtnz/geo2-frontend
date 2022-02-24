import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

  public static readonly START_DEV_YEAR: number = 2020;
  public version = require( '../../../package.json').version;
  public copyrightYear = '';

  constructor() {
    const year = new Date().getFullYear();
    if (year !== PagesComponent.START_DEV_YEAR) {
      this.copyrightYear = '-' + year;
    }
  }

  ngOnInit() {
  }

}
