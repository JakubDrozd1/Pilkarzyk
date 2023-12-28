import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { RegisterComponent } from '../register/register.component'
import { GroupsUsersApi, UsersApi } from 'libs/api-client'
import { ActivatedRoute } from '@angular/router'
import { Alert } from 'src/app/helper/alert'

@Component({
  selector: 'app-register-link',
  templateUrl: './register-link.component.html',
  styleUrls: ['./register-link.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RegisterComponent],
})
export class RegisterLinkComponent implements OnInit {
  idGroup: number | undefined

  constructor(
    private usersApi: UsersApi,
    private groupsUsersApi: GroupsUsersApi,
    private route: ActivatedRoute,
    private alert: Alert
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idGroup']) {
        const decodedBytes = new Uint8Array(
          atob(params?.['idGroup'])
            .split('')
            .map((char) => char.charCodeAt(0))
        )
        this.idGroup = new DataView(decodedBytes.buffer).getInt32(0, true)
      }
    })
  }

  onUserRegistered(user: any) {
    this.usersApi
      .getUserByLoginAndPassword({
        login: user.Login ?? '',
        password: user.Password ?? '',
      })
      .subscribe({
        next: (response) => {
          this.groupsUsersApi
            .addUserToGroupAsync({
              iDGROUP: this.idGroup,
              iDUSER: response.ID_USER,
            })
            .subscribe({
              next: () => {},
              error: () => {
                this.alert.alertNotOk(
                  'Nie dodano do grupy. Spróbuj ponownie później'
                )
              },
            })
        },
        error: () => {
          this.alert.alertNotOk('Nie dodano do grupy. Spróbuj ponownie później')
        },
      })
  }
}
