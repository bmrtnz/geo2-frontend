import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class GridUtilsService {

  public currentValueTyped: boolean;

  constructor() { }

  // Reset (go to left) datagrid horizontal scroll bar
  public resetGridScrollBar(grid) {
    grid?.instance.getScrollable()?.scrollTo(0);
  }

  // KEEP THIS HACK!!!
  // Devextreme triggers a keydown event that leads the typed value to be truncated (first digit)
  // => We record user typed value and reinject it after keydown has altered field value
  public secureTypedValueWithEditGrid(elem) {
    if (elem.event.originalEvent.type === "input") {
      this.currentValueTyped = elem.event.currentTarget.value;
    } else {
      elem.event.currentTarget.value = this.currentValueTyped;
    }
  }

}
