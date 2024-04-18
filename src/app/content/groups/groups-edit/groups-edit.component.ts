import { UserService } from './../../../service/user/user.service'
import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { AlertController, IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  GetGroupsUsersResponse,
  GroupsApi,
  GroupsUsersApi,
} from 'libs/api-client'
import { forkJoin } from 'rxjs'
import { Alert } from 'src/app/helper/alert'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'

@Component({
  selector: 'app-groups-edit',
  templateUrl: './groups-edit.component.html',
  styleUrls: ['./groups-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    SpinnerComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class GroupsEditComponent implements OnInit {
  idGroup: number = 0
  public alertButtons = [
    {
      text: this.translate.instant('Cancel'),
      role: 'cancel',
      handler: () => {},
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        this.leave()
      },
    },
  ]
  editGroupForm!: FormGroup
  groupUser!: GetGroupsUsersResponse

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private groupsApi: GroupsApi,
    private alert: Alert,
    private groupsUsersApi: GroupsUsersApi,
    private userService: UserService,
    private refreshDataService: RefreshDataService
  ) {
    this.editGroupForm = this.fb.group({
      name: ['', Validators.required],
      isModerated: [],
    })
  }
  alertOpened: boolean = false
  isReady: boolean = true
  permission: boolean = false

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
        this.getDetails()
      }
    })

    window.addEventListener('popstate', async () => {
      if (this.alertOpened) {
        if (this.alertCtrl.getTop() != null) {
          this.alertCtrl.dismiss(null, 'cancel')
          this.cancelAlert()
        }
      }
    })
  }

  cancel() {
    this.router.navigate(['/groups', this.idGroup])
  }

  leave() {
    this.groupsUsersApi
      .deleteUsersFromGroup({
        groupId: this.idGroup,
        requestBody: [this.userService.loggedUser.ID_USER ?? 0],
      })
      .subscribe({
        next: () => {
          this.alert.presentToast(
            this.translate.instant('Successfully left the group')
          )
          this.router.navigate(['/groups'])
        },
        error: (error) => {
          this.alert.handleError(error)
        },
      })
  }

  onSubmitEdit() {
    this.isReady = false
    this.groupsApi
      .updateGroup({
        groupId: this.idGroup,
        getGroupRequest: {
          Name: this.editGroupForm.value.name.trim(),
          IsModerated: !this.editGroupForm.value.isModerated,
        },
      })
      .subscribe({
        next: () => {
          this.alert.presentToast(
            this.translate.instant('Changes successfully saved')
          )
          this.getDetails()
          this.refreshDataService.refresh('groups-content')
          this.isReady = true
        },
        error: (error) => {
          this.isReady = true
          this.alert.handleError(error)
        },
      })
  }

  openAlert() {
    this.router.navigateByUrl(this.router.url + '?alertOpened=true')
    this.alertOpened = true
  }

  cancelAlert() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { alertOpened: null },
      replaceUrl: true,
    })
    this.alertOpened = false
  }

  getDetails() {
    this.isReady = false
    forkJoin({
      groupUser: this.groupsUsersApi.getUserWithGroup({
        userId: Number(this.userService.loggedUser.ID_USER),
        groupId: this.idGroup ?? 0,
      }),
      group: this.groupsApi.getGroupById({
        groupId: this.idGroup,
      }),
    }).subscribe({
      next: (responses) => {
        this.editGroupForm.get('name')?.setValue(responses.group.NAME)
        this.editGroupForm
          .get('isModerated')
          ?.setValue(!responses.group.IS_MODERATED)
        this.groupUser = responses.groupUser

        if (this.groupUser != null) {
          if (!this.groupUser.IsModerated) {
            this.permission = true
          } else {
            if (this.groupUser) {
              this.permission = Boolean(this.groupUser.AccountType)
            }
          }
        } else if (this.userService.loggedUser.IS_ADMIN) {
          this.permission = true
        } else {
          this.router.navigate(['/home'])
        }
        this.isReady = true
      },
      error: (error) => {
        this.isReady = true
        this.alert.handleError(error)
      },
    })
  }
}
