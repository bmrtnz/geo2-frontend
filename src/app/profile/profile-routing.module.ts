import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'login',
      },
      {
        path: 'login',
        component: LoginFormComponent,
      },
      {
        path: 'logout',
      },
    ]),
  ]
})
export class ProfileRoutingModule { }
