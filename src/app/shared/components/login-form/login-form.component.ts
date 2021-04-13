import {Component, NgModule, OnInit} from '@angular/core';

import {AuthService} from '../../services';
import {DxButtonModule} from 'devextreme-angular/ui/button';
import {DxCheckBoxModule} from 'devextreme-angular/ui/check-box';
import {DxTextBoxModule} from 'devextreme-angular/ui/text-box';
import {DxValidatorModule} from 'devextreme-angular/ui/validator';
import {DxValidationGroupModule} from 'devextreme-angular/ui/validation-group';
import {SharedModule} from '../../shared.module';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    public currentCompanyService: CurrentCompanyService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      nomUtilisateur: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.form.reset({
      nomUtilisateur: this.authService.lastUsername,
    });
    this.currentCompanyService.setCompany(null);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.authService.logIn(
      this.form.get('nomUtilisateur').value,
      this.form.get('password').value,
    ).subscribe(() => this.form.patchValue({password: ''}));
  }
}
@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxTextBoxModule,
    DxValidatorModule,
    DxValidationGroupModule
  ],
  declarations: [ LoginFormComponent ],
  exports: [ LoginFormComponent ]
})
export class LoginFormModule { }
