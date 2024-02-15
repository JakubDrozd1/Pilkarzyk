import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { GroupsUserAddComponent } from './groups-user-add.component'

describe('GroupsUserAddComponent', () => {
  let component: GroupsUserAddComponent
  let fixture: ComponentFixture<GroupsUserAddComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GroupsUserAddComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(GroupsUserAddComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
