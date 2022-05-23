import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class GridUtilsService {
  constructor() { }

  // Reset (go to left) datagrid horizontal scroll bar
  public resetGridScrollBar(grid) {
    grid?.instance.getScrollable()?.scrollTo(0);
  }
}
