import { Injectable } from "@angular/core";
import { DateManagementService } from "./date-management.service";
import { LocalizationService } from "./localization.service";

@Injectable({
  providedIn: "root",
})
export class GridUtilsService {

  public currentValueTyped: string;
  public focusSB: boolean;

  constructor(
    private localizeService: LocalizationService,
    private dateManagementService: DateManagementService
  ) { }

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

  // Converts a string array to "item1 & item2" or "item1, item2, item3 & item4"
  public friendlyFormatList(items: Array<string>) {
    return items.join(", ").replace(/,(?![\s\S]*,)/, " &");
  }

  // Customizing grid title with period/date
  public customGridPlanningTitle(titlePrefix: string, dateMin: Date = new Date(), dateMax: Date = new Date()) {
    const title = this.localizeService.localize(titlePrefix);
    const duValue = this.localizeService.localize("du");
    const fromDate = this.dateManagementService.formatDate(dateMin, "dd-MM-yyyy");
    const fromValue = `<strong>${fromDate.replace(/^0+/, "")}</strong>`;
    const auValue = this.localizeService.localize("au");
    const toDate = this.dateManagementService.formatDate(dateMax, "dd-MM-yyyy");
    const toValue = `<strong>${toDate.replace(/^0+/, "")}</strong>`;
    const nowDate = this.dateManagementService.formatDate(new Date(), "dd-MM-yyyy");
    let finalTitle = `${title} ${duValue}&nbsp;&nbsp;${fromValue}&nbsp;&nbsp;${auValue}&nbsp;&nbsp;${toValue}`;
    if (fromDate === toDate) {
      if (fromDate === nowDate) {
        finalTitle = `${title}&nbsp;<strong>${this.localizeService.localize("from-today")}</strong>`;
      } else {
        finalTitle = finalTitle.split(auValue)[0];
      }
    }
    return finalTitle;
  }

}
