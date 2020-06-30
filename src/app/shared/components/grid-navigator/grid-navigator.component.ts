import { Component, OnInit, NgModule, ElementRef, Input } from '@angular/core';
import { DxButtonModule, DxDataGridComponent } from 'devextreme-angular';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-grid-navigator',
  templateUrl: './grid-navigator.component.html',
  styleUrls: ['./grid-navigator.component.scss']
})
export class GridNavigatorComponent implements OnInit {

  backBtnDisabled = false;
  @Input() dataGrid: DxDataGridComponent;

  constructor(
    public location: Location,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public element: ElementRef,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // console.log(event.url);
        this.backBtnDisabled = !/^\/nested\/.*/.test(event.url);
      }
    });
  }

  ngOnInit() {
  }

  scrollIn() {
    this.element.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  public hasNext() {
    if (!this.dataGrid) {
      return false;
    }

    if (
      this.dataGrid.focusedRowIndex + 1 >= this.dataGrid.instance.totalCount()
      &&
      this.dataGrid.instance.pageIndex() + 1 >= this.dataGrid.instance.pageCount()
    ) {
      return false;
    }

    return true;
  }

  public async selectNext() {
    let nextIndex = this.dataGrid.focusedRowIndex + 1;

    if (nextIndex >= this.dataGrid.instance.pageSize()) {
      await this.dataGrid.instance.pageIndex(this.dataGrid.instance.pageIndex() + 1);
      nextIndex = 0;
    }

    this.dataGrid.focusedRowIndex = nextIndex;
    this.dataGrid.instance.selectRowsByIndexes([nextIndex]);
    this.navToDetail(this.dataGrid.instance.getSelectedRowsData()[0].id);

  }

  public hasPrevious() {
    if (!this.dataGrid) {
      return false;
    }

    return !(
      this.dataGrid.focusedRowIndex === 0
      &&
      this.dataGrid.instance.pageIndex() === 0
    );
  }

  public async selectPrevious() {
    let previousIndex = this.dataGrid.focusedRowIndex - 1;

    if (previousIndex < 0) {
      await this.dataGrid.instance.pageIndex(this.dataGrid.instance.pageIndex() - 1);
      previousIndex = this.dataGrid.instance.pageSize() - 1;
    }

    this.dataGrid.focusedRowIndex = previousIndex;
    this.dataGrid.instance.selectRowsByIndexes([previousIndex]);
    this.navToDetail(this.dataGrid.instance.getSelectedRowsData()[0].id);
  }

  navToDetail(id: string) {
    this.router.navigate(
      [{ outlets: { details: [id] }}],
      { relativeTo: this.activatedRoute },
    );
  }

  // TODO Create directive backButton
  backClick() {
    this.location.back();
  }

}

@NgModule({
  imports: [
    DxButtonModule,
  ],
  declarations: [GridNavigatorComponent],
  exports: [GridNavigatorComponent]
})
export class GridNavigatorModule {
}
