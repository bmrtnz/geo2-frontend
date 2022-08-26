import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import DataGrid from "devextreme/ui/data_grid";
import { LocalizePipe } from "./pipes";
import { EvalDisplayPipe } from "./services/grid-configurator.service";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [LocalizePipe, EvalDisplayPipe],
  exports: [CommonModule, LocalizePipe, EvalDisplayPipe],
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
