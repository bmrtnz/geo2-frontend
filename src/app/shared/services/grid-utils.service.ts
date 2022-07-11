import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class GridUtilsService {

  public currentValueTyped: string;
  public focusSB: boolean;

  constructor() { }

  // Reset (go to left) datagrid horizontal scroll bar
  public resetGridScrollBar(grid) {
    grid?.instance.getScrollable()?.scrollTo(0);
  }

  // KEEP THESE 2 HACKS!!!
  // Devextreme triggers a keydown event that leads the typed value to be truncated (first digit)
  // => We record user typed value and reinject it after keydown has altered field value
  //
  // 1 -> for usual number/text fields
  public secureTypedValueWithEditGrid(elem) {
    if (elem.event.originalEvent.type === "input") {
      this.currentValueTyped = elem.event.currentTarget.value;
    } else {
      elem.event.currentTarget.value = this.currentValueTyped;
    }
  }
  // KEEP THESE HACKS!!!
  // 2 -> for selectbox fields
  public secureTypedValueSBWithEditGrid(elem) {
    if (!elem.event) return;
    if (elem.event.originalEvent.type === "input") {
      this.currentValueTyped = elem.event.currentTarget.value;
      if (this.focusSB) {
        this.focusSB = false;
        this.currentValueTyped = this.currentValueTyped.slice(this.currentValueTyped.length - 1);
        elem.event.currentTarget.value = this.currentValueTyped;
      }
    }
    if (elem.event.originalEvent.type === "keydown") {
      elem.event.currentTarget.value = this.currentValueTyped;
      this.currentValueTyped = null;
    }
  }
  // KEEP THIS PART linked to the code above!!!
  public secureFocusSBTypedValueWithEditGrid(elem) {
    if (!elem.event) return;
    this.focusSB = true;
  }

}
