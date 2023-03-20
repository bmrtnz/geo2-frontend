import { Component, Pipe, PipeTransform } from "@angular/core";
import dxDataGrid from "devextreme/ui/data_grid";

@Component({
  selector: "app-merged-dxgrid-cell-template",
  templateUrl: "./merged-dxgrid-cell-template.component.html",
  styleUrls: ["./merged-dxgrid-cell-template.component.scss"]
})
export class MergedDxgridCellTemplateComponent { }

@Pipe({ name: "mergeSiblingColumns" })
export class MergeSiblingColumnsPipe implements PipeTransform {
  transform(input: { cellElement: HTMLElement, columnIndex: number, component: dxDataGrid, element: HTMLElement }) {

    const htmlStructure = Object.entries({
      client: input.cellElement.previousElementSibling,
      responsable: input.cellElement.nextElementSibling
    })
      .map(([, target]) => {
        const containerElm = document.createElement("div");
        containerElm.innerHTML += target.innerHTML;
        return containerElm;
      });

    return htmlStructure
      .reduce((accumulator, current) => accumulator + current.outerHTML, "");
  }
}
