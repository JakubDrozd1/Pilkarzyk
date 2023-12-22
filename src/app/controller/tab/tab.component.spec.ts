import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TabComponent } from './tab.component'
import { ActivatedRoute } from '@angular/router'

describe('TabComponent', () => {
  let component: TabComponent
  let fixture: ComponentFixture<TabComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabComponent],
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents()

    fixture = TestBed.createComponent(TabComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
