import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LieuxPassageAQuaiDetailsComponent } from './lieux-passage-a-quai-details.component';

describe('LieuxPassageAQuaiDetailsComponent', () => {
  let component: LieuxPassageAQuaiDetailsComponent;
  let fixture: ComponentFixture<LieuxPassageAQuaiDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LieuxPassageAQuaiDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LieuxPassageAQuaiDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
