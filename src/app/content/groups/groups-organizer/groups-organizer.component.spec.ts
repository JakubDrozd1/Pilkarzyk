import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { GroupsOrganizerComponent } from './groups-organizer.component'

describe('GroupsOrganizerComponent', () => {
  let component: GroupsOrganizerComponent
  let fixture: ComponentFixture<GroupsOrganizerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GroupsOrganizerComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(GroupsOrganizerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
