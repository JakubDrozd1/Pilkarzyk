import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AppComponent } from './app.component'
import { ActivatedRoute } from '@angular/router'

describe('AppComponent', () => {
  let component: AppComponent
  let fixture: ComponentFixture<AppComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: 'title', useValue: 'pilkarzyk app is running!' },
        { provide: ActivatedRoute, useValue: {} },
      ],
    })
    fixture = TestBed.createComponent(AppComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
