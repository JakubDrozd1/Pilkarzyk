import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { GetGroupsUsersResponse, MeetingsApi } from 'libs/api-client';
import * as moment from 'moment';
import { Alert } from 'src/app/helper/alert';
import { RefreshDataService } from 'src/app/service/refresh/refresh-data.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class MeetingComponent implements OnInit {

  meetingForm: FormGroup
  displayDate: any
  idGroup: number = 0
  groupsUsers: GetGroupsUsersResponse[] = []

  constructor
    (
      private fb: FormBuilder,
      private modalCtrl: ModalController,
      private meetingsApi: MeetingsApi,
      private navParams: NavParams,
      private refreshDataService: RefreshDataService,
      private alert: Alert
    ) {
    this.meetingForm = this.fb.group({
      dateMeeting: ['', Validators.required],
      place: ['', Validators.required],
      quantity: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit() {

    this.displayDate = moment().format()
    this.idGroup = this.navParams.get('idGroup');
    this.groupsUsers = this.navParams.get('groupsUsers');
    this.meetingForm.get('dateMeeting')?.setValue(moment().format())

  }

  onSubmit() {
    this.meetingForm.markAllAsTouched()
    if (this.meetingForm.valid) {
      for (let user of this.groupsUsers) {
        this.meetingsApi.addMeeting(
          {
            getMeetingRequest: {
              DateMeeting: this.meetingForm.value.dateMeeting,
              Place: this.meetingForm.value.place,
              Quantity: this.meetingForm.value.quantity,
              Description: this.meetingForm.value.description,
              IdUser: user.IdUser,
              IdGroup: this.idGroup,
            }
          }
        ).subscribe({
          next: () => {
            this.alert.alertOk()
            this.meetingForm.reset()
            this.refreshDataService.refresh('groups-content')
            this.cancel()
          },
          error: () => {
            this.alert.alertNotOk()
            this.cancel()
          }
        })
      }
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

}
