import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { MaskitoModule } from '@maskito/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GroupInvitesApi } from 'libs/api-client'
import { Alert } from 'src/app/helper/alert'
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service'
import { UserService } from 'src/app/service/user/user.service'
import { SpinnerComponent } from '../../helper/spinner/spinner.component'

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    MaskitoModule,
    RouterLink,
    TranslateModule,
    SpinnerComponent,
  ],
})
export class UsersComponent implements OnInit {
  @Input() idGroup: number = 0
  addNewUserForm: FormGroup
  isReadyNewUser: boolean = true
  isReadyExistingUser: boolean = false
  mode: string = ''

  constructor(
    private fb: FormBuilder,
    private alert: Alert,
    private refreshDataService: RefreshDataService,
    private groupInviteApi: GroupInvitesApi,
    private userService: UserService,
    public translate: TranslateService
  ) {
    this.addNewUserForm = this.fb.group({
      email: ['', [Validators.email]],
    })
  }

  ngOnInit() {}

  onSubmitNew() {
    this.addNewUserForm.markAllAsTouched()
    if (this.addNewUserForm.valid) {
      this.isReadyNewUser = false
      this.groupInviteApi
        .addGroupInvite({
          getGroupInviteRequest: {
            IdGroup: this.idGroup,
            IdAuthor: this.userService.loggedUser.ID_USER,
            Email: this.addNewUserForm.value.email.toLowerCase().trim(),
          },
        })
        .subscribe({
          next: () => {
            this.isReadyNewUser = true
            this.alert.presentToast(
              this.translate.instant('Invited successfully')
            )
            this.addNewUserForm.reset()
            this.refreshDataService.refresh('invite')
          },
          error: (error) => {
            this.alert.handleError(error)
            this.isReadyNewUser = true
          },
        })
    }
  }
}
