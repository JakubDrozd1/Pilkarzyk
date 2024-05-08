import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AddUserFromGroupComponent } from './add-user-from-group.component'

describe('AddUserFromGroupComponent', () => {
  let component: AddUserFromGroupComponent
  let fixture: ComponentFixture<AddUserFromGroupComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddUserFromGroupComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(AddUserFromGroupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
