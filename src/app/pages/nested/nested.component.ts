import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GridNavigatorComponent } from 'app/shared/components/grid-navigator/grid-navigator.component';
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-nested',
  templateUrl: './nested.component.html',
  styleUrls: ['./nested.component.scss']
})
export class NestedComponent implements OnInit {

  @ViewChild(GridNavigatorComponent, { static: true }) gridNav: GridNavigatorComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {}

  onActivate(event) {
    this.gridNav.dataGrid = event.dataGrid;
    event.detailsNavigationHook = row => {
      this.gridNav.scrollIn();
      // (this.gridNav.dataGrid as DxDataGridComponent)
      // .instance.selectRows([row.id], false);
      return [
        [{ outlets: { details: [row.id] }}],
        { relativeTo: this.activatedRoute },
      ];
    };
  }

}
