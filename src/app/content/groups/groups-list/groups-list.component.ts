import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { GetGroupsUsersResponse, GroupsUsersApi } from 'libs/api-client';
import { GroupsComponent } from '../../form/groups/groups.component';
import { Subscription } from 'rxjs';
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';

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
  private subscription: Subscription = new Subscription()

  constructor(
    private groupsUsersApi: GroupsUsersApi,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private refreshDataService: RefreshDataService,
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe(
        index => {
          if (index === 'groups-list') {
            this.getGroups()
          }
        }
      )
    )
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

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: GroupsComponent,
    })
    modal.present()
    await modal.onWillDismiss()
  }

}
