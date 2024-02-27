import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule, ToggleChangeEventDetail } from '@ionic/angular'
import { IonToggleCustomEvent } from '@ionic/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GetGroupsUsersResponse, GroupsUsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { convertBase64ToFile } from 'src/app/helper/convertBase64ToFile'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-groups-organizer',
  templateUrl: './groups-organizer.component.html',
  styleUrls: ['./groups-organizer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule, SpinnerComponent],
})
export class GroupsOrganizerComponent implements OnInit {
  idGroup: number = 0
  groupsUsers: GetGroupsUsersResponse[] = []
  temp: File | null = null
  images: string[] = []
  isReady: boolean = false

  constructor(
    private groupsUserApi: GroupsUsersApi,
    private alert: Alert,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
        this.getDetails()
      }
    })
  }

  getDetails() {
    if (this.idGroup > 0) {
      this.isReady = false
      this.groupsUserApi
        .getAllGroupsFromUser({
          page: 0,
          onPage: -1,
          idGroup: this.idGroup,
          isAvatar: true,
        })
        .subscribe({
          next: (response) => {
            this.groupsUsers = response
            const promises = response.map((user) => {
              return new Promise<void>((resolve) => {
                const base64String = user.Avatar
                if (base64String != null) {
                  convertBase64ToFile(base64String).then((file) => {
                    this.temp = file
                    const reader = new FileReader()
                    reader.onload = () => {
                      const index = this.groupsUsers.findIndex(
                        (u) => u.IdUser === user.IdUser
                      )
                      this.images[index] = reader.result as string
                      resolve()
                    }
                    reader.readAsDataURL(this.temp)
                  })
                } else {
                  const index = this.groupsUsers.findIndex(
                    (u) => u.IdUser === user.IdUser
                  )
                  this.images[index] = '0'
                  resolve()
                }
              })
            })
            Promise.all(promises).then(() => {
              this.isReady = true
            })
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReady = true
          },
        })
    }
  }

  cancel() {
    this.router.navigate(['/groups', this.idGroup])
  }

  checkedChange(
    $event: IonToggleCustomEvent<ToggleChangeEventDetail<any>>,
    user: GetGroupsUsersResponse
  ) {
    this.groupsUserApi
      .updatePermission({
        idGroup: this.idGroup,
        idUser: user.IdUser ?? 0,
        accountType: Number($event.detail.checked),
      })
      .subscribe({
        next: () => {},
        error: (error) => {
          this.alert.handleError(error)
        },
      })
  }
}
