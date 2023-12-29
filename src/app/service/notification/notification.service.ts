import { Injectable } from '@angular/core'
import { HubConnection } from '@microsoft/signalr'
import { BehaviorSubject, Observable } from 'rxjs'
import { AppConfig } from '../app-config'
import * as signalR from '@microsoft/signalr'
import {
  LocalNotifications,
  ScheduleOptions,
} from '@capacitor/local-notifications'
import { UsersMeetingsApi } from 'libs/api-client'

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private hubConnection: HubConnection
  private meetingNotificationSubject = new BehaviorSubject<{
    userid: number
    meetingid: number
  }>({ userid: 0, meetingid: 0 })

  constructor(private usersMeetingsApi: UsersMeetingsApi) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(AppConfig.settings.apiEndpoint + 'notify', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build()

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err))

    this.hubConnection.on(
      'SendMessage',
      (userid: number, meetingid: number) => {
        const notification = { userid, meetingid }
        this.usersMeetingsApi
          .getUserWithMeeting({
            userId: userid,
            meetingId: meetingid,
          })
          .subscribe({
            next: (response) => {
              if (response.DateMeeting) {
                const dateObject: Date = new Date(response.DateMeeting)
                const formattedDate: string = this.formatDate(dateObject)
                let options: ScheduleOptions = {
                  notifications: [
                    {
                      id: 111,
                      title: 'Nowe zaproszenie do spotkania',
                      body: formattedDate + ' ' + String(response.Description),
                      largeBody:
                        formattedDate + ' ' + String(response.Description),
                      summaryText: 'Kliknij, aby odpowiedzieć',
                    },
                  ],
                }
                LocalNotifications.schedule(options)
                this.meetingNotificationSubject.next(notification)
              }
            },
          })
      }
    )
  }

  getMeetingNotifications(): Observable<{ userid: number; meetingid: number }> {
    return this.meetingNotificationSubject.asObservable()
  }

  handleRemoteNotification() {
    const notification = { userid: 0, meetingid: 0 }
    let options: ScheduleOptions = {
      notifications: [
        {
          id: 111,
          title: 'jd',
          body: 'xpp',
          largeBody: 'get ',
          summaryText: 'masno ni',
        },
      ],
    }

    LocalNotifications.schedule(options)

    this.meetingNotificationSubject.next(notification)
  }
  private formatDate(date: Date): string {
    const day: string = ('0' + date.getDate()).slice(-2)
    const month: string = ('0' + (date.getMonth() + 1)).slice(-2)
    const year: number = date.getFullYear()
    const hours: string = ('0' + date.getHours()).slice(-2)
    const minutes: string = ('0' + date.getMinutes()).slice(-2)

    return `${day}-${month}-${year} ${hours}:${minutes}`
  }
}
