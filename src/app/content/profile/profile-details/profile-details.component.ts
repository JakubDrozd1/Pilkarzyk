import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { USERS, UsersApi } from 'libs/api-client';
import { Alert } from 'src/app/helper/alert';
import { LogoutComponent } from "../../logout/logout.component";
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';
import { Subscription } from 'rxjs';

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
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe(
        index => {
          if (index === 'profile-details') {
            this.getDetails()
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
          this.convertBase64ToFile(base64String).then((file) => {
            this.image = file
            const reader = new FileReader()
            reader.onload = () => {
              this.temp = reader.result as string
            }
            reader.readAsDataURL(this.image)
            this.isReady = true
          })
        }
      },
      error: () => {
        this.alert.alertNotOk()
      }
    })
  }

  convertBase64ToFile(base64String: string): Promise<File> {
    return new Promise((resolve) => {
      const byteCharacters = atob(base64String)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      resolve(file)
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
    console.log(selectedFile)
    if (selectedFile && selectedFile.size <= maxSizeInBytes) {
      this.convertFileToBase64(selectedFile).then((base64String) => {
        this.usersApi.updateColumnUser({
          userId: this.idUser,
          getUpdateUserRequest: {
            Column: ["AVATAR"],
            AVATAR: base64String,
          },
        }).subscribe({
          next: () => {
            this.alert.alertOk("Udało się zmienić avatar")
            this.refreshDataService.refresh('groups-list')
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

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1]
          resolve(base64String)
        } else {
          console.error('Błąd konwersji pliku do base64.')
        }
      }
      reader.readAsDataURL(file)
    })
  }

}
