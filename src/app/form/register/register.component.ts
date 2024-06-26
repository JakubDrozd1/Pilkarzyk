import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
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
import { AuthService } from 'src/app/service/auth/auth.service'
import { SpinnerComponent } from '../../helper/spinner/spinner.component'
import {
  ComparePasswordValidator,
  customValidator,
} from 'src/app/helper/customValidators'

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
    SpinnerComponent,
  ],
})
export class RegisterComponent implements OnInit {
  @Output() userRegistered: EventEmitter<any> = new EventEmitter()
  @Input() email: string | null | undefined
  readonly phoneMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/],
  }
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement()
  registrationForm: FormGroup
  isReady: boolean = true
  isDisabled: boolean = false

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
          customValidator(),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ\s0-9_-]*$/),
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
        [Validators.required, ComparePasswordValidator('password')],
      ],
      firstname: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ\s]*$/),
          customValidator(),
          Validators.maxLength(50),
        ],
      ],
      surname: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-ZęóąśłżźćńĘÓĄŚŁŻŹĆŃ\s]*$/),
          customValidator(),
          Validators.maxLength(50),
        ],
      ],
      phoneNumber: ['', [Validators.required, Validators.minLength(11)]],
      email: ['', [Validators.required, Validators.email]],
    })
  }

  ngOnInit() {
    if (this.authService.login()) {
      this.navigate()
    }
    if (this.email) {
      this.registrationForm.get('email')?.setValue(this.email)
      this.registrationForm.get('email')?.disable()
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
            Login: this.registrationForm.value.login.trim().toLowerCase(),
            Password: this.registrationForm.value.password,
            Email: this.registrationForm
              .get('email')
              ?.getRawValue()
              .trim()
              .toLowerCase(),
            Firstname: this.registrationForm.value.firstname.trim(),
            Surname: this.registrationForm.value.surname.trim(),
            PhoneNumber: intNumber,
            GroupCounter: 1,
          },
        })
        .subscribe({
          next: () => {
            this.alert.presentToast(
              this.translate.instant('Registered successfully. You can log in.')
            )
            this.isReady = true
            this.router.navigate(['/form/login'])
            this.userRegistered.emit({
              Login: this.registrationForm.value.login.trim().toLowerCase(),
              Password: this.registrationForm.value.password,
            })
            this.registrationForm.reset()
          },
          error: (error) => {
            this.isReady = true
            this.alert.handleError(error)
          },
        })
    }
  }
  private navigate() {
    this.router.navigate(['/home'])
  }
}
