import {Component, NgModule, OnInit} from '@angular/core';

import {AuthService} from '../../services';
import {DxButtonModule} from 'devextreme-angular/ui/button';
import {DxCheckBoxModule} from 'devextreme-angular/ui/check-box';
import {DxTextBoxComponent, DxTextBoxModule} from 'devextreme-angular/ui/text-box';
import {DxValidatorModule} from 'devextreme-angular/ui/validator';
import {DxValidationGroupModule} from 'devextreme-angular/ui/validation-group';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import {SharedModule} from '../../shared.module';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import DataSource from 'devextreme/data/data_source';
import { SocietesService } from 'app/shared/services/api/societes.service';
import { UtilisateursService } from 'app/shared/services/api/utilisateurs.service';
import { from, throwError } from 'rxjs';
import { catchError, mergeAll, take } from 'rxjs/operators';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  form: FormGroup;
  societe: DataSource;
  
  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    public currentCompanyService: CurrentCompanyService,
    private societesService: SocietesService,
    private utilisateursService: UtilisateursService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      nomUtilisateur: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.form.reset({
      nomUtilisateur: this.authService.lastUsername,
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.authService.logIn(
      this.form.get('nomUtilisateur').value,
      this.form.get('password').value,
    ).subscribe(() => this.form.patchValue({password: ''}));
  }

  nomUtilisateurOnFocusOut(event) {
    //const textBoxComponent: DxTextBoxComponent = event.component;
    from(this.utilisateursService.getOne(this.form.get('nomUtilisateur').value, this.form.get('password').value))
    .pipe(
      mergeAll(),
      take(1),
      catchError((e: any) => {
         this.societe = null;
         return throwError(e);
      }) 
      ).subscribe(response=>{

      const perimetre = response.data.utilisateur.perimetre;
      let filter = [];
      let filter2 = [];

      this.societe = this.societesService.getDataSource();
      filter.push(['valide', '=', true]);
      this.societe.filter(filter)
  
      // Authorized companies -> '*' all
      if (perimetre !== '*') {
        perimetre.split(',').forEach(element => {
          filter2.push(['id', '=', element]);
          filter2.push('or');
        });
        filter2.pop(); // Remove last 'or'
        this.societe.filter([filter2])
      }
    })
  }

  societeOnChange(event) {
    this.currentCompanyService.setCompany(event.selectedItem);
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
    DxValidationGroupModule,
    DxSelectBoxModule
  ],
  declarations: [ LoginFormComponent ],
  exports: [ LoginFormComponent ]
})
export class LoginFormModule { }
