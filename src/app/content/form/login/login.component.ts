import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { UsersApi } from 'libs/api-client';
import { AuthService } from 'src/app/service/auth/auth.service';
import { UserService } from 'src/app/service/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersApi: UsersApi,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService,
    public userService: UserService
  ) {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });

  }

  ngOnInit() { }

  onSubmit() {
    this.loginForm.markAllAsTouched()
    if (this.loginForm.valid) {
      this.usersApi.getUserByLoginAndPassword({
        login: this.loginForm.value.login,
        password: this.loginForm.value.password,
      }).subscribe({
        next: (response) => {
          this.userService.setUser(response)
          this.authService.login()
          this.router.navigate(['/logged/home'])
        },
        error: async (error) => {
          let errorMessage = '';

          if (String(error.error).includes('User is null')) {
            errorMessage = 'Dany użytkownik nie istnieje.';
          } else if (String(error.error).includes('Password is not correct')) {
            errorMessage = 'Podane hasło jest niepoprawne. ';
          }
          const alert = await this.alertController.create({
            header: 'Błąd',
            message: errorMessage,
            buttons: ['Ok'],
          });
          await alert.present();
        }
      })
    }
  }
}
