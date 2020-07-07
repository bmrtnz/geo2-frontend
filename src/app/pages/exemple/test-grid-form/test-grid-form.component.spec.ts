import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestGridFormComponent } from './test-grid-form.component';

describe('TestGridFormComponent', () => {
  let component: TestGridFormComponent;
  let fixture: ComponentFixture<TestGridFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestGridFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestGridFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
