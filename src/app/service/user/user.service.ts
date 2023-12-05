import { Injectable } from '@angular/core';
import { USERS } from 'libs/api-client';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public userDetails: USERS | undefined

  constructor() { }

  public setUser(user: USERS) {
    this.userDetails = user;
  }
}
