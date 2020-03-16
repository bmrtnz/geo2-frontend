import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransporteurDetailsComponent } from './transporteur-details.component';

describe('TransporteurDetailsComponent', () => {
  let component: TransporteurDetailsComponent;
  let fixture: ComponentFixture<TransporteurDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransporteurDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransporteurDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
