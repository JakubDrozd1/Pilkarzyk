import { Injectable } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConfig } from '../app-config';
import * as signalR from '@microsoft/signalr';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

@Injectable({
    providedIn: 'root',
})

export class NotificationService {
    private hubConnection: HubConnection
    private meetingNotificationSubject = new BehaviorSubject<{ userid: number, meetingid: number }>({ userid: 0, meetingid: 0 })

    constructor() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(AppConfig.settings.apiEndpoint + 'notify', {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .build()

        this.hubConnection
            .start()
            .then(() => console.log('Connection started'))
            .catch((err) => console.log('Error while starting connection: ' + err))

        this.hubConnection.on('SendMessage', (userid: number, meetingid: number) => {
            const notification = { userid, meetingid }
            let options:ScheduleOptions={
                notifications:[{
                    id:111,
                    title:"jd",
                    body:"xpp",
                    largeBody: "get ",
                    summaryText: "masno ni"
                }
                ]
            }
            
            LocalNotifications.schedule(options)
            
            this.meetingNotificationSubject.next(notification)
        })
    }

    getMeetingNotifications(): Observable<{ userid: number, meetingid: number }> {
        return this.meetingNotificationSubject.asObservable()
    }
}
