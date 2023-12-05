import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { GetGroupsUsersResponse, GroupsUsersApi, MEETINGS, MeetingsApi } from 'libs/api-client';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-groups-content',
  templateUrl: './groups-content.component.html',
  styleUrls: ['./groups-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class GroupsContentComponent implements OnInit {

  idGroup: number | undefined;
  groupsUsers: GetGroupsUsersResponse[] = []
  isReady: boolean = false
  meetings: MEETINGS[] = []
  nameGroup: string | undefined | null

  constructor(
    private route: ActivatedRoute,
    private groupsUsersApi: GroupsUsersApi,
    private alertController: AlertController,
    private meetingsApi: MeetingsApi
  ) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params) => {
        if (params?.['idGroup'] > 0) {
          this.idGroup = parseInt(params?.['idGroup'])
          this.getDetails()
        }
      }
    )
  }

  getDetails() {
    this.groupsUsers = []
    forkJoin({
      groupsUsers: this.groupsUsersApi.getAllGroupsFromUserAsync({
        page: 0,
        onPage: -1,
        sortColumn: 'NAME',
        sortMode: 'ASC',
        idGroup: this.idGroup
      }),
      meetings: this.meetingsApi.getAllMeetings({
        page: 0,
        onPage: -1,
        sortColumn: 'NAME',
        sortMode: 'ASC',
        idGroup: this.idGroup
      })
    }).subscribe({
      next: (responses) => {
        this.groupsUsers = responses.groupsUsers;
        this.meetings = responses.meetings
        this.nameGroup = responses.groupsUsers[0].Name
        this.isReady = true;
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: 'Błąd',
          message: 'Wystąpił błąd',
          buttons: ['Ok'],
        });
        this.groupsUsers = []
        this.meetings = []
        this.nameGroup = ""
        this.isReady = true;
        await alert.present();
      }
    });
  }
}
