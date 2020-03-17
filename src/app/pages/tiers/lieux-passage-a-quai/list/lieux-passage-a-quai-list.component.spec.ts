import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LieuxPassageAQuaiListComponent } from './lieux-passage-a-quai-list.component';

describe('LieuxPassageAQuaiListComponent', () => {
  let component: LieuxPassageAQuaiListComponent;
  let fixture: ComponentFixture<LieuxPassageAQuaiListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LieuxPassageAQuaiListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LieuxPassageAQuaiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
