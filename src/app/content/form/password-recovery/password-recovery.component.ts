import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Alert } from 'src/app/helper/alert'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { ResetPasswordsApi } from 'libs/api-client'

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    SpinnerComponent,
  ],
})
export class PasswordRecoveryComponent implements OnInit {
  recoveryForm: FormGroup
  isReady: boolean = true

  constructor(
    public translate: TranslateService,
    private fb: FormBuilder,
    private alert: Alert,
    private resetPasswordApi: ResetPasswordsApi
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  ngOnInit() {}

  onSubmit() {
    this.recoveryForm.markAllAsTouched()
    if (this.recoveryForm.valid) {
      this.isReady = false
      this.resetPasswordApi
        .sendRecoveryPasswordEmail({
          email: this.recoveryForm.value.email.trim(),
        })
        .subscribe({
          next: () => {
            this.alert.presentToast(
              this.translate.instant('Password reset')
            )
            this.isReady = true
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReady = true
          },
        })
    }
  }
}
