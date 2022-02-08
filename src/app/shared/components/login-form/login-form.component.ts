import { AfterViewInit, Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocietesService } from 'app/shared/services/api/societes.service';
import { UtilisateursService } from 'app/shared/services/api/utilisateurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DxLoadIndicatorModule } from 'devextreme-angular';
import { DxButtonComponent, DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxSelectBoxComponent, DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidationGroupModule } from 'devextreme-angular/ui/validation-group';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services';
import { SharedModule } from '../../shared.module';



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
  public version = require('../../../../../package.json').version;

  autoSubmit = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    public currentCompanyService: CurrentCompanyService,
    private societesService: SocietesService,
    private router: Router,
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
    if (this.form.invalid || this.submitButton.instance.option('disabled') === true) return;

    const lastUserName = this.authService.lastUsername;
    const userName = this.form.get('nomUtilisateur').value;

    this.authService.logIn(
      userName,
      this.form.get('password').value,
    ).subscribe({
      next: res => {
        this.form.patchValue({password: ''});
        this.authService.showWelcome();
        // Different user? Back home to avoid non consistent data
        if (userName !== lastUserName) this.router.navigate([`/**`]);
      },
      error: err => this.authService.loginError(),
    });
  }

  findAssociatedCompanies(e) {

    if (!this.form.get('nomUtilisateur')?.value?.length || !this.form.get('password')?.value?.length) return;

    // const textBoxComponent: DxTextBoxComponent = event.component;
    this.utilisateursService.getOne(
      this.form.get('nomUtilisateur').value,
      this.form.get('password').value,
      ['perimetre'],
    )
    .pipe(
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
    if (!this.form.get('nomUtilisateur')?.value?.length || !this.form.get('password')?.value?.length) return;
    if (e.event.key === 'Enter') {
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
