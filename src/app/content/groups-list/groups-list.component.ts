import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { GetGroupsUsersResponse, GroupsUsersApi } from 'libs/api-client';
import { UserService } from 'src/app/service/user/user.service';

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class GroupsListComponent implements OnInit {

  groupsUsers: GetGroupsUsersResponse[] = []
  isReady: boolean = false;

  constructor(
    private userService: UserService,
    private groupsUsersApi: GroupsUsersApi,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.getGroups()
  }

  getGroups() {
    this.groupsUsers = []
    this.groupsUsersApi.getAllGroupsFromUserAsync({
      page: 0,
      onPage: -1,
      sortColumn: 'NAME',
      sortMode: 'ASC',
      idUser: this.userService.userDetails?.ID_USER,
    }).subscribe({
      next: (response) => {
        this.groupsUsers = response
        this.isReady = true
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: 'Błąd',
          message: 'Wystąpił błąd',
          buttons: ['Ok'],
        });
        await alert.present();
      }
    })
  }


}
