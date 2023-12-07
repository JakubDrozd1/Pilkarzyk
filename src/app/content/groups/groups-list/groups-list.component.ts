import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { GetGroupsUsersResponse, GroupsUsersApi } from 'libs/api-client';

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink]
})
export class GroupsListComponent implements OnInit {

  groupsUsers: GetGroupsUsersResponse[] = []
  isReady: boolean = false
  idUser: number = 0

  constructor(
    private groupsUsersApi: GroupsUsersApi,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.idUser = Number(localStorage.getItem('user_id'))
    this.getGroups()
  }

  getGroups() {
    this.groupsUsers = []
    this.groupsUsersApi.getAllGroupsFromUserAsync({
      page: 0,
      onPage: -1,
      sortColumn: 'NAME',
      sortMode: 'ASC',
      idUser: this.idUser
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
        })
        await alert.present()
      }
    })
  }


}
