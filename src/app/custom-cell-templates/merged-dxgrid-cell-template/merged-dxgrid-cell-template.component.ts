import { Component, Pipe, PipeTransform, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import dxDataGrid from "devextreme/ui/data_grid";

@Component({
  selector: "app-merged-dxgrid-cell-template",
  templateUrl: "./merged-dxgrid-cell-template.component.html",
  styleUrls: ["./merged-dxgrid-cell-template.component.scss"]
})
export class MergedDxgridCellTemplateComponent { }

@Pipe({ name: "mergeSiblingColumns" })
export class MergeSiblingColumnsPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) { }

  transform(
    input: {
      cellElement: HTMLElement,
      columnIndex: number,
      rowIndex: number,
      component: dxDataGrid,
      element: HTMLElement,
    }) {

    const htmlStructure = Object.entries({
      [input.columnIndex - 1]: input.cellElement.previousElementSibling,
      [input.columnIndex + 1]: input.cellElement.nextElementSibling
    })
      .map(([columnIndex, target]) => {
        const containerElm = document.createElement("div");
        containerElm.innerHTML += target.innerHTML;
        return containerElm;
      })
      .reduce((accumulator, current) => accumulator + current.outerHTML, "");

    return this.domSanitizer.sanitize(SecurityContext.HTML, htmlStructure);
  }
}

@Pipe({ name: "mergeEditSiblingColumns" })
export class MergeEditSiblingColumnsPipe implements PipeTransform {
  transform(
    input: {
      cellElement: HTMLElement,
      columnIndex: number,
      rowIndex: number,
      component: dxDataGrid,
      element: HTMLElement,
    },
    sibling: "previous" | "next") {
    const columnIndex = input.columnIndex + (sibling === "previous" ? -1 : 1);
    return input.component.cellValue(input.rowIndex, columnIndex);
  }
}
