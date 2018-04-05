import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RicohHomepageComponent } from './ricoh-homepage.component';

describe('RicohHomepageComponent', () => {
  let component: RicohHomepageComponent;
  let fixture: ComponentFixture<RicohHomepageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RicohHomepageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RicohHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
