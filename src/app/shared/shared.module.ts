import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { LocalizePipe } from "./pipes";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import DataGrid from "devextreme/ui/data_grid";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [LocalizePipe],
  exports: [CommonModule, LocalizePipe],
})
export class SharedModule {
  constructor() {
    // Sorting the column chooser fields in alpha order
    // https://supportcenter.devexpress.com/ticket/details/t343901/
    (DataGrid as any).registerModule("columnChooserSorting", {
      extenders: {
        controllers: {
          columns: {
            getChooserColumns(loadAllColumns) {
              const result = this.callBase(loadAllColumns);
              return result.sort((column1, column2) =>
                column1.caption?.localeCompare(column2.caption),
              );
            },
          },
        },
      },
    });
  }
}
