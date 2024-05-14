import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AccountPrivacyComponent } from './account-privacy.component'

describe('AccountPrivacyComponent', () => {
  let component: AccountPrivacyComponent
  let fixture: ComponentFixture<AccountPrivacyComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AccountPrivacyComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(AccountPrivacyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
