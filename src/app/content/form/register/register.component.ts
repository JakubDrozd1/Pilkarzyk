import { CommonModule } from '@angular/common'
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { MaskitoModule } from '@maskito/angular'
import { MaskitoElementPredicateAsync, MaskitoOptions } from '@maskito/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { compareValidator } from 'src/app/helper/validateConfirmPasswd'
import { AuthService } from 'src/app/service/auth/auth.service'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MaskitoModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
  ],
})
export class RegisterComponent implements OnInit {
  @Output() userRegistered: EventEmitter<any> = new EventEmitter()

  readonly phoneMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  }
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement()
  registrationForm: FormGroup
  isReady: boolean = true

  constructor(
    private fb: FormBuilder,
    private usersApi: UsersApi,
    private authService: AuthService,
    private router: Router,
    private alert: Alert,
    public translate: TranslateService
  ) {
    this.registrationForm = this.fb.group({
      login: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(25),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(25),
        ],
      ],
      confirmPassword: [
        '',
        [Validators.required, compareValidator('password')],
      ],
      firstname: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z]+$'),
          Validators.minLength(3),
          Validators.maxLength(25),
        ],
      ],
      surname: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z]+$'),
          Validators.minLength(3),
          Validators.maxLength(25),
        ],
      ],
      phoneNumber: ['', [Validators.required, Validators.minLength(11)]],
      email: ['', [Validators.required, Validators.email]],
    })
  }

  ngOnInit() {
    if (this.authService.isLoggedIn) {
      this.navigate()
    }
  }

  onSubmit() {
    this.registrationForm.markAllAsTouched()
    if (this.registrationForm.valid) {
      this.isReady = false
      let str: string = this.registrationForm.value.phoneNumber
      let intNumber: number = parseInt(str.replace(/-/g, ''), 10)
      this.usersApi
        .addUser({
          getUserRequest: {
            Login: this.registrationForm.value.login,
            Password: this.registrationForm.value.password,
            Email: this.registrationForm.value.email,
            Firstname: this.registrationForm.value.firstname,
            Surname: this.registrationForm.value.surname,
            PhoneNumber: intNumber,
          },
        })
        .subscribe({
          next: (response) => {
            this.alert.alertOk(
              this.translate.instant('Registered successfully. You can log in.')
            )
            this.isReady = true
            this.registrationForm.reset()
            this.router.navigate(['/login'])
            this.userRegistered.emit(response)
          },
          error: () => {
            this.isReady = true
            this.alert.alertNotOk()
          },
        })
    }
  }
  private navigate() {
    this.router.navigate(['/logged/home'])
  }
}
