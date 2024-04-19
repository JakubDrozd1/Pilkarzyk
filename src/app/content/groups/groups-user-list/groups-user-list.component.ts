import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { AlertController, IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GetGroupsUsersResponse, GroupsUsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-groups-user-list',
  templateUrl: './groups-user-list.component.html',
  styleUrls: ['./groups-user-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink, TranslateModule],
})
export class GroupsUserListComponent implements OnInit {
  @Input() user!: GetGroupsUsersResponse
  @Input() counter: number = 0
  @Input() isEdit: boolean = false

  temp: File | null = null
  images: string = ''
  isReady: boolean = false
  alertOpened: boolean = false

  constructor(
    private groupsUsersApi: GroupsUsersApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    public translate: TranslateService,
    private alertCtrl: AlertController,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const base64String = this.user.Avatar
    if (base64String != null) {
      convertBase64ToFile(base64String).then((file) => {
        this.temp = file
        const reader = new FileReader()
        reader.onload = () => {
          this.images = reader.result as string
          this.isReady = true
        }
        reader.readAsDataURL(this.temp)
      })
    } else {
      this.isReady = true
    }
    window.addEventListener('popstate', async () => {
      if (this.alertOpened) {
        if (this.alertCtrl.getTop() != null) {
          this.alertCtrl.dismiss(null, 'cancel')
        }
      }
    })
  }

  async deleteUser(user: GetGroupsUsersResponse) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant(
        'Are you sure you want to remove the user from the group?'
      ),
      buttons: [
        {
          text: this.translate.instant('Yes'),
          role: 'submit',
          handler: () => {
            this.isEdit = false
            this.delete(user)
          },
        },
        {
          text: this.translate.instant('No'),
          role: 'cancel',
        },
      ],
      backdropDismiss: false,
    })
    this.router.navigateByUrl(this.router.url + '?alertOpened=true')
    alert.present()
    this.alertOpened = true
    alert.onDidDismiss().then(() => {
      this.cancelAlert()
    })
  }

  cancelAlert() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { alertOpened: null },
      replaceUrl: true,
    })
    this.alertOpened = false
  }

  delete(user: GetGroupsUsersResponse) {
    this.groupsUsersApi
      .deleteUsersFromGroup({
        groupId: user.IdGroup ?? 0,
        requestBody: [user.IdUser ?? 0],
      })
      .subscribe({
        next: () => {
          this.alert.presentToast(
            this.translate.instant(
              'You have successfully removed the user from the group'
            )
          )
          this.refreshDataService.refresh('groups-edit')
          this.isReady = true
        },
        error: (error) => {
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }
}
