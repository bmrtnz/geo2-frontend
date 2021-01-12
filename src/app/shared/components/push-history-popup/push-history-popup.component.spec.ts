import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PushHistoryPopupComponent } from './push-history-popup.component';

describe('PromptPopupComponent', () => {
  let component: PushHistoryPopupComponent;
  let fixture: ComponentFixture<PushHistoryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PushHistoryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PushHistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
