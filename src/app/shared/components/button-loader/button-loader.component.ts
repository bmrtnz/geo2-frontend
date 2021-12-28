import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { DxButtonModule, DxLoadIndicatorModule, DxTemplateModule } from 'devextreme-angular';

@Component({
  selector: 'app-button-loader',
  templateUrl: './button-loader.component.html',
  styleUrls: ['./button-loader.component.scss']
})
export class ButtonLoaderComponent<T> {

  @Input() text: string;
  @Input() type: 'back' | 'danger' | 'default' | 'normal' | 'success';
  @Input() stylingMode: 'text' | 'outlined' | 'contained';
  @Input() resolver: Promise<T>;
  @Output() resolve = new EventEmitter<T>();
  @Output() reject = new EventEmitter<Error>();

  public loading = false;

  constructor() { }

  async onClick() {
    if (!this.resolver) return Error('Component doesn\'t have a resolver');
    this.loading = true;
    try {
      this.resolve.emit(await this.resolver);
    } catch (e) {
      this.reject.emit(e);
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
