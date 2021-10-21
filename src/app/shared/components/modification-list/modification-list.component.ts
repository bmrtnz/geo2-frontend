import { Component, NgModule, Input } from '@angular/core';
import { DxButtonModule, DxPopupModule, DxTemplateModule, DxTextBoxModule, DxBoxModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { AuthService } from 'app/shared/services';
import { SharedModule } from 'app/shared/shared.module';


@Component({
  selector: 'app-modification-list',
  templateUrl: './modification-list.component.html',
  styleUrls: ['./modification-list.component.scss']
})
export class ModificationListComponent {

  @Input() entite: string;
  @Input() entiteID: string;

  constructor(public authService: AuthService) { }

  clearModifications() {
    alert('Clear');
  }

}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxPopupModule,
    DxTemplateModule,
    DxTextBoxModule,
    DxBoxModule,
    SharedModule
  ],
  declarations: [ModificationListComponent],
  exports: [ModificationListComponent]
})
export class ModificationListModule {
}
