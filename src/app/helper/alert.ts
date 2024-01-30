import { Injectable } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root',
})
export class Alert {
  errorMessage: string = ''
  errorMessages: string[] = [
    'Group is null',
    'User is null',
    'User is already in this group',
    'Group with this name already exists',
    'Event already exists',
    'Refresh token expired',
    'Meeting is null',
    'User is already in this meeting',
    'Acount with login already exists',
    'Acount with email already exists',
    'Acount with phone number already exists',
    'Password is not correct',
    'Username is null',
    'Account exist with this email',
  ]

  constructor(
    private alertController: AlertController,
    public translate: TranslateService
  ) {}

  public async alertNotOk(message?: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant('Error'),
      message: message ?? this.translate.instant('An error occured'),
      buttons: ['Ok'],
    })
    await alert.present()
  }

  public async alertOk(message?: string) {
    const alert = await this.alertController.create({
      header: 'OK',
      message: message ?? this.translate.instant('Successfully added'),
      buttons: ['Ok'],
    })
    await alert.present()
  }

  async handleError(error: any) {
    if (typeof error.error === 'string') {
      if (this.errorMessages.includes(String(error.error))) {
        this.errorMessage = this.translate.instant(String(error.error))
      } else {
        this.errorMessage = this.translate.instant(
          'An unexpected error occured'
        )
      }
    } else if (typeof error.error === 'object') {
      if (this.errorMessages.includes(String(error.error.message))) {
        this.errorMessage = this.translate.instant(String(error.error.message))
      } else {
        this.errorMessage = this.translate.instant(
          'An unexpected error occured'
        )
      }
    }
    const alert = await this.alertController.create({
      header: this.translate.instant('Error'),
      message: this.errorMessage,
      buttons: ['Ok'],
    })
    await alert.present()
  }
}
