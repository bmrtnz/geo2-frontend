import { Component, HostBinding } from "@angular/core";
import { ScreenService } from "./shared/services";
import { environment } from "../environments/environment";
import dxSelectBox from "devextreme/ui/select_box";
import dxNumberBox from "devextreme/ui/number_box";
import dxTabPanel from "devextreme/ui/tab_panel";
import dxDataGrid from "devextreme/ui/data_grid";
import { FormUtilsService } from "./shared/services/form-utils.service";
// import { Workbook } from "exceljs";
// import { exportDataGrid } from "devextreme/excel_exporter";
// import { Export } from "devextreme/exporter/exceljs/export.js";
// import { saveAs } from "file-saver";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  @HostBinding("class") get getClass() {
    const classes = Object.keys(this.screen.sizes)
      .filter((cl) => this.screen.sizes[cl]);

    if (environment.production) {
      classes.push("production");
    }

    return classes.join(" ");
  }

  constructor(
    public formUtilsService: FormUtilsService,
    private screen: ScreenService
  ) {
    // Close columnchooser on outside click (non standard)
    document.addEventListener("mousedown", (e) => {
      const el = e.target;
      const context = el as HTMLElement;
      const context2 = context.closest(".dx-datagrid-column-chooser");
      if (!context2) {
        document
          .querySelectorAll(
            ".dx-datagrid-column-chooser .dx-closebutton",
          )
          .forEach((btn) => {
            const closeBtn = btn as HTMLElement;
            if (
              this.isVisible(
                closeBtn.closest(".dx-datagrid-column-chooser"),
              )
            )
              closeBtn.click();
          });
      }
    });

    this.defaultDxConfiguration();
  }

  closest(elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }

  isVisible(el) {
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  defaultDxConfiguration() {
    dxSelectBox.defaultOptions({
      options: {
        searchMode: "startswith",
        searchEnabled: true,
        onFocusIn: this.formUtilsService.selectTextOnFocusIn
      }
    });
    dxNumberBox.defaultOptions({
      options: {
        onFocusIn: this.formUtilsService.selectTextOnFocusIn
      }
    });
    dxTabPanel.defaultOptions({ options: { swipeEnabled: false } });
    dxDataGrid.defaultOptions({
      options: {
        scrolling: { useNative: true },
        columnFixing: { enabled: true },
        onExporting: this.onExporting,
        // TODO for better keyboard navigation
        /*keyboardNavigation: {
          enterKeyAction: "moveFocus",
          enterKeyDirection: "column",
          editOnKeyPress: true,
        }*/
      }
    });
  }

  private onExporting(event: {
    cancel: boolean,
    component: dxDataGrid,
    element: HTMLElement,
    fileName: string,
    format: string | "EXCEL",
    selectedRowsOnly: boolean,
  }) {
    // only handle 'excel' export
    if (event.format !== "EXCEL") return;

    // const workbook = new Workbook();
    // const worksheet = workbook.addWorksheet("Data");

    // DANGER ZONE, DO NOT TRY TO REPRODUCT AT HOME
    // Export.export();

    // const dataProvider = (event.component as any).getDataProvider(false);
    // console.log(dataProvider);
    // dataProvider.getRowsCount = function () { return 66; };
    // dataProvider.getRowsCount.apply(dataProvider, arguments);
    // (event.component as any).dataProvider = dataProvider;
    // console.log(dataProvider);
    // dataProvider.ready().done(() => {
    //   const dataRowsCount = dataProvider.getRowsCount();
    //   console.log(dataRowsCount);
    // });

    // exportDataGrid({
    //   component: event.component,
    //   worksheet,
    // })
    //   .then((range) => {
    //     console.log(range);
    //     return workbook.xlsx.writeBuffer();
    //   })
    //   .then((buffer: BlobPart) => {
    //     saveAs(new Blob([buffer], { type: "application/octet-stream" }), `${event.fileName}.xlsx`);
    //   });

    // disables the deprecated built-in export implementation with fewer capabilities
    event.cancel = true;
  }
}
