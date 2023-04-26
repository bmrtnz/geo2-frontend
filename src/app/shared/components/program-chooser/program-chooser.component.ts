import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";

import { DxListModule } from "devextreme-angular/ui/list";
import { DxContextMenuModule } from "devextreme-angular/ui/context-menu";
import notify from "devextreme/ui/notify";

@Component({
  selector: "app-program-chooser",
  templateUrl: "./program-chooser.component.html",
  styleUrls: ["./program-chooser.component.scss"],
})
export class ProgramChooserComponent {
  @Input() programs: any;
  @Input() menuMode: string;
  @Output() programChosen = new EventEmitter();

  constructor() {}

  selectProgram(e) {
    if (e.itemData) e = e.itemData;
    this.programChosen.emit(e);
  }
}

@NgModule({
  imports: [DxListModule, DxContextMenuModule, CommonModule],
  declarations: [ProgramChooserComponent],
  exports: [ProgramChooserComponent],
})
export class ProgramChooserModule {}
