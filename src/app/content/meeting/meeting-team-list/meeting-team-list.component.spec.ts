import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { MeetingTeamListComponent } from './meeting-team-list.component'

describe('MeetingTeamListComponent', () => {
  let component: MeetingTeamListComponent
  let fixture: ComponentFixture<MeetingTeamListComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingTeamListComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(MeetingTeamListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
