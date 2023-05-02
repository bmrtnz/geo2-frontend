import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  Output,
} from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import {
  DxButtonModule,
  DxLoadIndicatorModule,
  DxTemplateModule,
} from "devextreme-angular";
import { Observable } from "rxjs";
import { share } from "rxjs/operators";

@Component({
  selector: "app-button-loader",
  templateUrl: "./button-loader.component.html",
  styleUrls: ["./button-loader.component.scss"],
})
export class ButtonLoaderComponent<T> implements OnChanges {
  @Input() text: string;
  @Input() type: "back" | "danger" | "default" | "normal" | "success";
  @Input() icon: string;
  @Input() stylingMode: "text" | "outlined" | "contained";
  @Input() disabled = false;
  @Input() resolver: Observable<T>;
  @Output() deferedOnClick = new EventEmitter();

  public loading = false;

  constructor() {}

  ngOnChanges(properties) {
    if (
      properties.resolver?.currentValue !== properties.resolver?.previousValue
    )
      this.resolve();
  }

  onClick(event) {
    this.deferedOnClick.emit(event);
  }

  resolve() {
    this.loading = true;
    this.resolver.pipe(share()).subscribe({
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DxButtonModule,
    DxTemplateModule,
    DxLoadIndicatorModule,
  ],
  declarations: [ButtonLoaderComponent],
  exports: [ButtonLoaderComponent],
})
export class ButtonLoaderModule {}
