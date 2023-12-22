import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { MessageWaitingContentComponent } from './message-waiting-content.component'

describe('MessageWaitingContentComponent', () => {
  let component: MessageWaitingContentComponent
  let fixture: ComponentFixture<MessageWaitingContentComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MessageWaitingContentComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(MessageWaitingContentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
