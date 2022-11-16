import { Component, HostBinding } from "@angular/core";
import dxDataGrid from "devextreme/ui/data_grid";
import dxNumberBox from "devextreme/ui/number_box";
import dxSelectBox from "devextreme/ui/select_box";
import dxLookup from "devextreme/ui/lookup";
import dxTextBox from "devextreme/ui/text_box";
import dxDateBox from "devextreme/ui/date_box";
import dxTabPanel from "devextreme/ui/tab_panel";
import { environment } from "../environments/environment";
import { LocalizationService, ScreenService } from "./shared/services";
import { FormUtilsService } from "./shared/services/form-utils.service";

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
    private localization: LocalizationService,
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
    // The below lookup part seems not to work...
    dxLookup.defaultOptions({
      options: {
        searchMode: "startswith",
        searchEnabled: true
      }
    });
    dxNumberBox.defaultOptions({
      options: {
        onFocusIn: this.formUtilsService.selectTextOnFocusIn
      }
    });
    dxTextBox.defaultOptions({
      options: {
        onFocusIn: this.formUtilsService.selectTextOnFocusIn
      }
    });
    dxDateBox.defaultOptions({
      options: {
        useMaskBehavior: true,
      }
    });
    dxTabPanel.defaultOptions({ options: { swipeEnabled: false } });
    dxDataGrid.defaultOptions({
      options: {
        scrolling: { useNative: true },
        columnFixing: { enabled: true },
        commonColumnSettings: {
          trueText: this.localization.localize("trueText"),
          falseText: this.localization.localize("falseText")
        },
        pager: {
          showPageSizeSelector: true,
          showInfo: true,
          showNavigationButtons: true,
          allowedPageSizes: [10, 20, 50, 100],
          pageSize: 20,
        },
        // TODO for better keyboard navigation
        /*keyboardNavigation: {
          enterKeyAction: "moveFocus",
          enterKeyDirection: "column",
          editOnKeyPress: true,
        }*/
      }
    });
  }
}
