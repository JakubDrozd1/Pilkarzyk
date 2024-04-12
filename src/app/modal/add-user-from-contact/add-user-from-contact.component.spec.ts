import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AddUserFromContactComponent } from './add-user-from-contact.component'

describe('AddUserFromContactComponent', () => {
  let component: AddUserFromContactComponent
  let fixture: ComponentFixture<AddUserFromContactComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddUserFromContactComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(AddUserFromContactComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
