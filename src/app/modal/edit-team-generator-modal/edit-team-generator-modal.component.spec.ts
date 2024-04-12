import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { EditTeamGeneratorModalComponent } from './edit-team-generator-modal.component'

describe('EditTeamGeneratorModalComponent', () => {
  let component: EditTeamGeneratorModalComponent
  let fixture: ComponentFixture<EditTeamGeneratorModalComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditTeamGeneratorModalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(EditTeamGeneratorModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
