import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import * as moment from 'moment'

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  private currentTimeSubject: BehaviorSubject<string> = new BehaviorSubject('')
  currentTime$: Observable<string> = this.currentTimeSubject.asObservable()

  constructor() {}

  updateCurrentTime() {
    let lang = localStorage.getItem('lang')
    console.log(lang)
    const currentTime = moment()
      .locale(lang ?? 'en')
      .format('DD MMMM YYYY HH:mm:ss')
    this.currentTimeSubject.next(currentTime)
  }
}
