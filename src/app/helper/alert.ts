import { Injectable } from '@angular/core'
import { AlertController, ToastButton, ToastController } from '@ionic/angular'
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
    'Invitation alredy send',
  ]
  button: ToastButton = {
    icon: 'close-circle-outline',
    side: 'end',
    role: 'cancel',
    text: ' ',
  }

  constructor(
    private alertController: AlertController,
    public translate: TranslateService,
    private toastController: ToastController
  ) {}

  public async alertNotOk(message?: string) {
    const alert = await this.alertController.create({
      header: this.translate.instant('Error'),
      message: message ?? this.translate.instant('An error occured'),
      buttons: ['Ok'],
    })
    await alert.present()
  }

  async handleError(error: any) {
    if (typeof error.error === 'string') {
      if (this.errorMessages.includes(String(error.error))) {
        this.errorMessage = this.translate.instant(String(error.error))
      } else {
        this.errorMessage =
          this.translate.instant('An unexpected error occured') +
          ' : ' +
          String(error.error)
      }
    } else if (typeof error.error === 'object') {
      if (this.errorMessages.includes(String(error.error.message))) {
        this.errorMessage = this.translate.instant(String(error.error.message))
      } else {
        if (error.error.message) {
          this.errorMessage =
            this.translate.instant('An unexpected error occured') +
            ': ' +
            String(error.error.message)
        } else {
          this.errorMessage = this.translate.instant('Connections error')
        }
      }
    }
    const alert = await this.alertController.create({
      header: this.translate.instant('Error'),
      message: this.errorMessage,
      buttons: ['Ok'],
    })
    await alert.present()
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      cssClass: 'toast',
      buttons: [this.button],
      animated: true,
    })
    await toast.present()
  }
}
