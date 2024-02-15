import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { USERS, UsersApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { UserService } from 'src/app/service/user/user.service'
import { Router, RouterLink } from '@angular/router'
import { SpinnerComponent } from '../../../helper/spinner/spinner.component'
import { Subscription } from 'rxjs'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterLink,
    SpinnerComponent,
  ],
})
export class ProfileEditComponent implements OnInit {
  user: USERS | undefined
  isReady: boolean = false
  private subscription: Subscription = new Subscription()

  constructor(
    private usersApi: UsersApi,
    private alert: Alert,
    private userService: UserService,
    public translate: TranslateService,
    private router: Router,
    private refreshDataService: RefreshDataService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe((index) => {
        if (index === 'profile-edit') {
          this.getDetails()
        }
      })
    )
    this.getDetails()
  }

  getDetails() {
    this.isReady = false
    this.usersApi
      .getUserById({
        userId: Number(this.userService.loggedUser.ID_USER),
      })
      .subscribe({
        next: (response) => {
          this.user = response
          this.isReady = true
        },
        error: () => {
          this.alert.alertNotOk()
          this.isReady = true
        },
      })
  }

  cancel() {
    this.router.navigate(['/profile'])
  }
}
