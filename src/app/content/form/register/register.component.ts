import { CommonModule } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { MaskitoModule } from '@maskito/angular';
import { MaskitoElementPredicateAsync, MaskitoOptions } from '@maskito/core';
import { UsersApi } from 'libs/api-client';
import { compareValidator } from 'src/app/controller/auth/validateConfirmPasswd';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MaskitoModule, ReactiveFormsModule, FormsModule]
})
export class RegisterComponent implements OnInit {

  readonly phoneMask: MaskitoOptions =
    {
      mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/,],
    };
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();
  registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersApi: UsersApi,
    private alertController: AlertController
  ) {
    this.registrationForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(25)]],
      confirmPassword: ['', [Validators.required, compareValidator('password')]],
      firstname: ['', [Validators.required, Validators.pattern("^[a-zA-Z]+$"), Validators.minLength(3), Validators.maxLength(25)]],
      surname: ['', [Validators.required, Validators.pattern("^[a-zA-Z]+$"), Validators.minLength(3), Validators.maxLength(25)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(11)]],
      email: ['', [Validators.required, Validators.email]],
    });

  }

  ngOnInit() { }

  onSubmit() {
    this.registrationForm.markAllAsTouched()
    if (this.registrationForm.valid) {
      let str: string = this.registrationForm.value.phoneNumber;
      let intNumber: number = parseInt(str.replace(/-/g, ''), 10);
      this.usersApi.addUser(
        {
          getUserRequest: {
            Login: this.registrationForm.value.login,
            Password: this.registrationForm.value.password,
            Email: this.registrationForm.value.email,
            Firstname: this.registrationForm.value.firstname,
            Surname: this.registrationForm.value.surname,
            PhoneNumber: intNumber,
          }
        }
      )
        .subscribe({
          next: async () => {
            const alert = await this.alertController.create({
              header: 'OK',
              message: "Zarejestronano pomyślnie",
              buttons: ['Ok'],
            });
            await alert.present();
          },
          error: async () => {
            const alert = await this.alertController.create({
              header: 'Błąd',
              message: "Wystąpił problem",
              buttons: ['Ok'],
            });
            await alert.present();
          }
        })
    }
  }

}
