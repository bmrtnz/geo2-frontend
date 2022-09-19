import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "app/shared/services";
import { SocietesService } from "app/shared/services/api/societes.service";
import { UtilisateursService } from "app/shared/services/api/utilisateurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { VersionService } from "app/shared/services/version.service";
import { DxButtonComponent } from "devextreme-angular/ui/button";
import { DxSelectBoxComponent } from "devextreme-angular/ui/select-box";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { throwError } from "rxjs";
import { catchError, concatMap } from "rxjs/operators";

@Component({
  selector: "app-login-form",
  templateUrl: "./login-form.component.html",
  styleUrls: ["./login-form.component.scss"],
})
export class LoginFormComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  societe: DataSource;
  companiesLoading = false;
  @ViewChild("submitButton", { static: false })
  submitButton: DxButtonComponent;
  @ViewChild("societeSB", { static: false }) societeSB: DxSelectBoxComponent;

  autoSubmit = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    public currentCompanyService: CurrentCompanyService,
    private societesService: SocietesService,
    private router: Router,
    private route: ActivatedRoute,
    private utilisateursService: UtilisateursService,
    public versionService: VersionService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      nomUtilisateur: ["", Validators.required],
      password: ["", Validators.required],
    });
    this.form.reset({
      nomUtilisateur: this.authService.lastUsername,
    });
  }

  ngAfterViewInit() {
    this.societeSB.value = { id: "SA" };
    setTimeout(() => this.societeSB.instance.focus(), 500);
  }

  onSubmit() {
    if (
      this.form.invalid ||
      this.submitButton.instance.option("disabled") === true
    )
      return;

    const lastUserName = this.authService.lastUsername;
    const userName = this.form.get("nomUtilisateur").value;

    this.route.queryParams.pipe(
      concatMap(params => this.authService
        .logIn(userName, this.form.get("password").value, params.redirect)),
    ).subscribe({
      next: () => {
        this.form.patchValue({ password: "" });
        this.authService.showWelcome();
        // Different user? Back home to avoid non consistent data
        if (userName !== lastUserName)
          this.router.navigate([`/**`]);
      },
      error: () => this.authService.loginError(),
    });
  }

  findAssociatedCompanies() {
    if (
      !this.form.get("nomUtilisateur")?.value?.length ||
      !this.form.get("password")?.value?.length
    )
      return;

    // const textBoxComponent: DxTextBoxComponent = event.component;
    this.utilisateursService
      .getOne(
        this.form.get("nomUtilisateur").value,
        this.form.get("password").value,
        ["perimetre"],
      )
      .pipe(
        catchError((err: any) => {
          notify(
            "Utilisateur/Mot de passe non reconnus",
            "error",
            3000,
          );
          return throwError(err);
        }),
      )
      .subscribe((response) => {
        const perimetre = response.data.utilisateur.perimetre;
        const filter = [];
        const filter2 = [];

        this.societe = this.societesService.getDataSource();
        filter.push(["valide", "=", true]);
        this.societe.filter(filter);

        // Authorized companies -> '*' = all
        if (perimetre !== null) {
          if (perimetre !== "*") {
            perimetre.split(",").forEach((element) => {
              filter2.push(["id", "=", element]);
              filter2.push("or");
            });
            filter2.pop(); // Remove last 'or'
            this.societe.filter([filter2]);
          }
          this.companiesLoading = true; // Show companies' loader
          this.societe.load().then((res) => {
            this.companiesLoading = false;
            this.showHideSubmitSociete(res.length);
            if (!res.length)
              notify("Aucune société disponible", "error", 3000);
          });
        } else {
          notify("Aucun périmètre société associé", "error", 3000);
          this.showHideSubmitSociete(false);
        }
      });
  }

  societeOnChange(e) {
    this.currentCompanyService.setCompany(e.selectedItem);
  }

  showHideSubmitSociete(status) {
    this.submitButton.instance.option("disabled", !status);
    this.societeSB.instance.option("readOnly", !status);
    if (this.autoSubmit) {
      this.autoSubmit = false;
      this.onSubmit();
    }
  }

  onKeyUp(e) {
    if (
      !this.form.get("nomUtilisateur")?.value?.length ||
      !this.form.get("password")?.value?.length
    )
      return;
    if (e.event.key === "Enter") {
      this.autoSubmit = true;
      this.societeSB.instance.focus();
    }
  }
}
