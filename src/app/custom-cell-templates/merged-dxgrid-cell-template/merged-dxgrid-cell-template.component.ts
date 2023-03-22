import { Component, Pipe, PipeTransform, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { DxTextBoxComponent } from "devextreme-angular";
import dxDataGrid from "devextreme/ui/data_grid";

@Component({
  selector: "app-merged-dxgrid-cell-template",
  templateUrl: "./merged-dxgrid-cell-template.component.html",
  styleUrls: ["./merged-dxgrid-cell-template.component.scss"]
})
export class MergedDxgridCellTemplateComponent {
  public onKeyDownFromFirst(event, inputNext: DxTextBoxComponent) {
    if (event.event.originalEvent.key === "Tab") {
      event.event.preventDefault();
      event.event.stopImmediatePropagation();
      inputNext.instance.focus();
    }
  }
  public onKeyDownFromLast(event) {
    if (event.event.originalEvent.key === "Tab") {
      event.event.stopImmediatePropagation();
      return event.event.preventDefault();
    }
  }

  public onValueChanged(
    event,
    cell: {
      columnIndex: number,
      rowIndex: number,
      component: dxDataGrid,
    },
    sibling: "previous" | "next") {
    const columnIndex = cell.columnIndex + (sibling === "previous" ? -1 : 1);
    // restore forfait / taux
    cell.component.cellValue(cell.rowIndex, columnIndex, event.value);
    cell.component.cellValue(cell.rowIndex, cell.columnIndex, "whatever");
  }
}

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
    const value = input.component.cellValue(input.rowIndex, columnIndex);
    return value;
  }
}
