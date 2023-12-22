import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class RefreshDataService {
  refreshSubject: Subject<string> = new Subject()

  constructor() {}

  public refresh(index: string = '') {
    this.refreshSubject.next(index)
  }
}
