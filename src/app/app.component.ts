import { Component, HostBinding } from "@angular/core";
import dxDataGrid from "devextreme/ui/data_grid";
import dxNumberBox from "devextreme/ui/number_box";
import dxSelectBox from "devextreme/ui/select_box";
import dxLookup from "devextreme/ui/lookup";
import dxTextBox from "devextreme/ui/text_box";
import dxDateBox from "devextreme/ui/date_box";
import dxTabPanel from "devextreme/ui/tab_panel";
import dxPopup from "devextreme/ui/popup";
import { environment } from "../environments/environment";
import { LocalizationService, ScreenService } from "./shared/services";
import { FormUtilsService } from "./shared/services/form-utils.service";
import { DateManagementService } from "./shared/services/date-management.service";
import { GridUtilsService } from "./shared/services/grid-utils.service";
import dxAutocomplete from "devextreme/ui/autocomplete";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  @HostBinding("class") get getClass() {
    const classes = Object.keys(this.screen.sizes).filter(
      (cl) => this.screen.sizes[cl]
    );

    if (environment.production) {
      classes.push("production");
    }

    return classes.join(" ");
  }

  constructor(
    public formUtilsService: FormUtilsService,
    public gridUtilsService: GridUtilsService,
    private localization: LocalizationService,
    public dateManagementService: DateManagementService,
    private screen: ScreenService
  ) {
    // Close columnchooser on outside click (non standard)
    document.addEventListener("mousedown", (e) => {
      // Store as may be useful for some cases
      window.localStorage.setItem("shiftKey", e?.shiftKey.toString());
      window.localStorage.setItem("ctrlKey", e?.ctrlKey.toString());
      const el = e.target;
      const context = el as HTMLElement;
      const context2 = context.closest(".dx-datagrid-column-chooser");
      if (!context2) {
        document
          .querySelectorAll(".dx-datagrid-column-chooser .dx-closebutton")
          .forEach((btn) => {
            const closeBtn = btn as HTMLElement;
            if (this.isVisible(closeBtn.closest(".dx-datagrid-column-chooser")))
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
        onFocusIn: this.formUtilsService.selectTextOnFocusIn,
        onValueChanged: this.formUtilsService.scrollLeftInputText,
      },
    });
    // The below lookup part seems not to work...
    dxLookup.defaultOptions({
      options: {
        searchMode: "startswith",
        searchEnabled: true,
      },
    });
    dxNumberBox.defaultOptions({
      options: {
        onFocusIn: this.formUtilsService.selectTextOnFocusIn,
      },
    });
    dxTextBox.defaultOptions({
      options: {
        onFocusIn: this.formUtilsService.selectTextOnFocusIn,
      },
    });
    dxAutocomplete.defaultOptions({
      options: {
        onFocusIn: this.formUtilsService.selectTextOnFocusIn,
      },
    });
    dxDateBox.defaultOptions({
      options: {
        useMaskBehavior: true,
      },
    });
    dxPopup.defaultOptions({
      options: {
        showCloseButton: true,
      },
    });
    dxTabPanel.defaultOptions({ options: { swipeEnabled: false } });
    dxDataGrid.defaultOptions({
      options: {
        // default is true and it is breaking pagination
        // cache is already handled by the Apollo/GraphQL layer
        cacheEnabled: false,
        scrolling: { useNative: false },
        columnFixing: { enabled: true },
        commonColumnSettings: {
          trueText: this.localization.localize("trueText"),
          falseText: this.localization.localize("falseText"),
        },
        loadPanel: {
          text: this.localization.localize("data-loading-process")
        },
        onExporting: this.gridUtilsService.onExporting, // E.g. add date to fileName
        pager: {
          showPageSizeSelector: true,
          showInfo: true,
          showNavigationButtons: true,
          allowedPageSizes: [10, 20, 50, 100],
          pageSize: 20,
        },
      },
    });
  }
}
