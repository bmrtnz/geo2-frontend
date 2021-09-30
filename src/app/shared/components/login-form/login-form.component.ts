import {AfterViewInit, Component, NgModule, OnInit, ViewChild} from '@angular/core';

import {AuthService} from '../../services';
import {DxButtonComponent, DxButtonModule} from 'devextreme-angular/ui/button';
import {DxCheckBoxModule} from 'devextreme-angular/ui/check-box';
import {DxLoadIndicatorModule} from 'devextreme-angular';
import {DxTextBoxComponent, DxTextBoxModule} from 'devextreme-angular/ui/text-box';
import {DxValidatorModule} from 'devextreme-angular/ui/validator';
import {DxValidationGroupModule} from 'devextreme-angular/ui/validation-group';
import { DxSelectBoxComponent, DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import {SharedModule} from '../../shared.module';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import DataSource from 'devextreme/data/data_source';
import { SocietesService } from 'app/shared/services/api/societes.service';
import { UtilisateursService } from 'app/shared/services/api/utilisateurs.service';
import { from, throwError } from 'rxjs';
import { catchError, mergeAll, take } from 'rxjs/operators';
import notify from 'devextreme/ui/notify';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  societe: DataSource;
  companiesLoading = false;
  @ViewChild('submitButton', { static: false }) submitButton: DxButtonComponent;
  @ViewChild('societeSB', { static: false }) societeSB: DxSelectBoxComponent;

  autoSubmit = false;
  
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

  ngAfterViewInit() {
    setTimeout( () => this.societeSB.instance.focus(), 500);
  }

  onSubmit()  {
    if (this.form.invalid || this.submitButton.instance.option('disabled') == true) return;
    
    this.authService.logIn(
      this.form.get('nomUtilisateur').value,
      this.form.get('password').value,
    ).subscribe(() => this.form.patchValue({password: ''}));
  }

  findAssociatedCompanies(e) {

    if (!this.form.get('nomUtilisateur').value.length || !this.form.get('password').value.length) return;

    // const textBoxComponent: DxTextBoxComponent = event.component;
    from(this.utilisateursService.getOne(this.form.get('nomUtilisateur').value, this.form.get('password').value))
    .pipe(
      mergeAll(),
      take(1),
      catchError((e: any) => {
         notify('Utilisateur/Mot de passe non reconnus', 'error', 3000);
         return throwError(e);
      })
      ).subscribe(response => {
        const perimetre = response.data.utilisateur.perimetre;
        const filter = [];
        const filter2 = [];

        this.societe = this.societesService.getDataSource();
        filter.push(['valide', '=', true]);
        this.societe.filter(filter);

        // Authorized companies -> '*' = all
        if (perimetre !== null) {
          if (perimetre !== '*') {
            perimetre.split(',').forEach(element => {
              filter2.push(['id', '=', element]);
              filter2.push('or');
            });
            filter2.pop(); // Remove last 'or'
            this.societe.filter([filter2]);
          }
          this.companiesLoading = true; // Show companies' loader
          this.societe.load().then(res => {
            this.companiesLoading = false;
            this.showHideSubmitSociete(res.length);
            if (!res.length) notify('Aucune société disponible', 'error', 3000);
          });
        } else {
          notify('Aucun périmètre société associé', 'error', 3000);
          this.showHideSubmitSociete(false);
        }
    });
  }

  societeOnChange(e) {
    this.currentCompanyService.setCompany(e.selectedItem);
  }

  showHideSubmitSociete(status) {
    this.submitButton.instance.option('disabled', !status);
    this.societeSB.instance.option('readOnly', !status);
    if (this.autoSubmit) {
      this.autoSubmit = false;
      this.onSubmit();
    }
  }

  onKeyUp(e) {
    if (!this.form.get('nomUtilisateur').value.length || !this.form.get('password').value.length) return;
    if (e.event.key == 'Enter') {
      this.autoSubmit = true;
      this.societeSB.instance.focus();
    }
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
    DxLoadIndicatorModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxSelectBoxModule
  ],
  declarations: [ LoginFormComponent ],
  exports: [ LoginFormComponent ]
})
export class LoginFormModule { }
