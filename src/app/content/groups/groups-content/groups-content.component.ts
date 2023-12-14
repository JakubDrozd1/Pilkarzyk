import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { GetGroupsUsersResponse, GetMeetingUsersGroupsResponse, GroupsUsersApi, MeetingsApi } from 'libs/api-client';
import { Subscription, forkJoin } from 'rxjs';
import { MeetingComponent } from "../../form/meeting/meeting.component";
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';
import { MeetingContentComponent } from "../../meeting/meeting-content/meeting-content.component";
import { UsersComponent } from '../../form/users/users.component';
import { Alert } from 'src/app/helper/alert';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-groups-content',
  templateUrl: './groups-content.component.html',
  styleUrls: ['./groups-content.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MeetingComponent, MeetingContentComponent, FormsModule]
})
export class GroupsContentComponent implements OnInit {

  idGroup: number | undefined
  groupsUsers: GetGroupsUsersResponse[] = []
  isReady: boolean = false
  meetings: GetMeetingUsersGroupsResponse[] = []
  nameGroup: string | undefined | null
  add: boolean = false
  private subscription: Subscription = new Subscription()
  selectedSegment: string = 'meetings'

  constructor(
    private route: ActivatedRoute,
    private groupsUsersApi: GroupsUsersApi,
    private meetingsApi: MeetingsApi,
    private modalCtrl: ModalController,
    private refreshDataService: RefreshDataService,
    private alert: Alert
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
    this.subscription.add(
      this.refreshDataService.refreshSubject.subscribe(
        index => {
          if (index === 'groups-content') {
            this.getDetails()
          }
        }
      )
    )
  }

  getDetails() {
    this.groupsUsers = []
    this.meetings = []
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
        sortColumn: 'DATE_MEETING',
        sortMode: 'ASC',
        idGroup: this.idGroup
      })
    }).subscribe({
      next: (responses) => {
        this.groupsUsers = responses.groupsUsers
        this.meetings = responses.meetings
        this.nameGroup = responses.groupsUsers[0].Name
        this.isReady = true
      },
      error: () => {
        this.alert.alertNotOk()
        this.groupsUsers = []
        this.meetings = []
        this.nameGroup = ""
        this.isReady = true
      }
    })
  }

  async openModalAddMeeting() {
    const modal = await this.modalCtrl.create({
      component: MeetingComponent,
      componentProps: {
        idGroup: this.idGroup,
        groupsUsers: this.groupsUsers,
      }
    })
    modal.present()
    await modal.onWillDismiss()
  }

  async openModalAddUser() {
    const modal = await this.modalCtrl.create({
      component: UsersComponent,
      componentProps: {
        idGroup: this.idGroup,
      }
    })
    modal.present()
    await modal.onWillDismiss()
  }

}
