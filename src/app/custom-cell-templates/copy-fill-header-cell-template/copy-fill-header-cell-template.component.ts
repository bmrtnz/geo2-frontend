import { Component } from "@angular/core";
import dxDataGrid from "devextreme/ui/data_grid";

@Component({
  selector: "app-copy-fill-header-cell-template",
  templateUrl: "./copy-fill-header-cell-template.component.html",
  styleUrls: ["./copy-fill-header-cell-template.component.scss"],
})
export class CopyFillHeaderCellTemplateComponent {
  public onReportClick(
    { event },
    columnData: {
      component: dxDataGrid;
      columnIndex: number;
    }
  ) {
    event.stopImmediatePropagation();
    const value = columnData.component.cellValue(0, columnData.columnIndex);
    columnData.component.getVisibleRows().forEach((_, index) => {
      columnData.component.cellValue(index, columnData.columnIndex, value);
    });
  }
}
