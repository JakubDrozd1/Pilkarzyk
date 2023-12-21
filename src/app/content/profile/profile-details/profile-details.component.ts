import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { USERS, UsersApi } from 'libs/api-client';
import { Alert } from 'src/app/helper/alert';
import { LogoutComponent } from "../../logout/logout.component";
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';
import { Subscription } from 'rxjs';
import { ProfileComponent } from '../../form/profile/profile.component';
import { ProfilePasswordComponent } from '../../form/profile-password/profile-password.component';
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile';
import { convertFileToBase64 } from 'src/app/helper/convertFileToBase64';
import { NotificationService } from 'src/app/service/notification/notification.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, LogoutComponent]
})
export class ProfileDetailsComponent implements OnInit {

  idUser: number = 0
  user: USERS | undefined
  selectedFile: File | null = null
  image: File | null = null
  isReady: boolean = false
  temp: string = ''
  private subscription: Subscription = new Subscription()

  constructor(
    private usersApi: UsersApi,
    private alert: Alert,
    private modalCtrl: ModalController,
    private refreshDataService: RefreshDataService,
    public notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe(
        index => {
          if (index === 'profile-details') {
            this.reload()
          }
        }
      )
    )
    this.idUser = Number(localStorage.getItem('user_id'))
    this.getDetails()
  }

  getDetails() {
    this.usersApi.getUserById({
      userId: this.idUser
    }).subscribe({
      next: (response) => {
        this.user = response
        const base64String = response.AVATAR
        if (base64String != null) {
          convertBase64ToFile(base64String).then((file) => {
            this.image = file
            const reader = new FileReader()
            reader.onload = () => {
              this.temp = reader.result as string
            }
            reader.readAsDataURL(this.image)
            this.isReady = true
          })
        } else {
          this.isReady = true
        }
      },
      error: () => {
        this.alert.alertNotOk()
        this.isReady = true
      }
    })
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel')
  }

  openFileInput() {
    document.getElementById('fileInput')?.click()
  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0]
    const maxSizeInBytes = 5 * 1024 * 1024
    if (selectedFile && selectedFile.size <= maxSizeInBytes) {
      convertFileToBase64(selectedFile).then((base64String) => {
        this.usersApi.updateColumnUser({
          userId: this.idUser,
          getUpdateUserRequest: {
            Column: ["AVATAR"],
            AVATAR: base64String,
          },
        }).subscribe({
          next: () => {
            this.alert.alertOk("Udało się zmienić avatar")
            this.refreshDataService.refresh('profile-details')
          },
          error: () => {
            this.alert.alertNotOk()
          },
        })
      })
    } else {
      this.alert.alertNotOk("Plik jest za duży (maks 5MB)")
    }
  }

  openModalEditMail() {
    this.openModalEdit("mail", this.user?.EMAIL)
  }

  openModalEditPhoneNumber() {
    this.openModalEdit("phone", String(this.user?.PHONE_NUMBER))
  }

  openModalAddLogin() {
    this.openModalEdit("login", this.user?.LOGIN)
  }

  openModalEditName() {
    this.openModalEdit("name", this.user?.FIRSTNAME + " " + this.user?.SURNAME)
  }

  async openModalEdit(mode: string, data: string | null | undefined) {
    const modal = await this.modalCtrl.create({
      component: ProfileComponent,
      componentProps: {
        inputEdit: mode,
        data: data
      }
    })
    modal.present()
    await modal.onWillDismiss()
  }

  async openModalEditPassword() {
    const modal = await this.modalCtrl.create({
      component: ProfilePasswordComponent,
    })
    modal.present()
    await modal.onWillDismiss()
  }

  reload() {
    this.temp = ''
    this.idUser = Number(localStorage.getItem('user_id'))
    this.getDetails()
  }
}
