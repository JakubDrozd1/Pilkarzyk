import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { IonicModule, RefresherEventDetail } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { GetGroupInviteResponse, GroupInvitesApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { UsersComponent } from '../../../form/users/users.component'
import { IonRefresherCustomEvent } from '@ionic/core'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-groups-user-add',
  templateUrl: './groups-user-add.component.html',
  styleUrls: ['./groups-user-add.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    SpinnerComponent,
    RouterLink,
    UsersComponent,
  ],
})
export class GroupsUserAddComponent implements OnInit {
  idGroup: number = 0
  invites: GetGroupInviteResponse[] = []
  isReady: boolean = true
  private subscription: Subscription = new Subscription()

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private groupInvites: GroupInvitesApi,
    private alert: Alert,
    private refreshDataService: RefreshDataService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'invite') {
          this.reload()
        }
      })
    )
    this.reload()
  }

  reload() {
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
        this.getDetails()
      }
    })
  }

  getDetails() {
    this.invites = []
    this.isReady = false
    this.groupInvites
      .getGroupInviteByIdUser({
        page: 0,
        onPage: -1,
        sortColumn: 'DATE_ADD',
        sortMode: 'DESC',
        idGroup: this.idGroup,
      })
      .subscribe({
        next: (response) => {
          this.invites = response
          this.isReady = true
        },
        error: (error) => {
          this.invites = []
          this.alert.handleError(error)
          this.isReady = true
        },
      })
  }

  cancel() {
    this.router.navigate(['/groups', this.idGroup])
  }

  handleRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      this.getDetails()
      $event.target.complete()
    }, 2000)
  }
}
