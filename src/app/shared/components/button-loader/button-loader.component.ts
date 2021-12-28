import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnChanges, Output } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { DxButtonModule, DxLoadIndicatorModule, DxTemplateModule } from 'devextreme-angular';

@Component({
  selector: 'app-button-loader',
  templateUrl: './button-loader.component.html',
  styleUrls: ['./button-loader.component.scss']
})
export class ButtonLoaderComponent<T> implements OnChanges {

  @Input() text: string;
  @Input() type: 'back' | 'danger' | 'default' | 'normal' | 'success';
  @Input() stylingMode: 'text' | 'outlined' | 'contained';
  @Input() resolver: Promise<T>;
  @Output() resolved = new EventEmitter<T>();
  @Output() rejected = new EventEmitter<Error>();
  @Output() deferedOnClick = new EventEmitter();

  public loading = false;

  constructor() { }

  ngOnChanges(properties) {
    if (properties.currentValue) this.resolve();
  }

  onClick(event) {
    this.deferedOnClick.emit(event);
  }

  async resolve() {
    if (!this.resolver)
      return this.rejected.emit( Error('Component doesn\'t have a resolver'));
    try {
      this.loading = true;
      this.resolved.emit(await this.resolver);
    } catch (e) {
      this.rejected.emit(e);
    } finally {
      this.loading = false;
    }
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
  declarations: [
    ButtonLoaderComponent,
  ],
  exports: [ButtonLoaderComponent]
})
export class ButtonLoaderModule {
}
