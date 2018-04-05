/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LessorDataComponent } from './lessor-data.component';

describe('LessorDataComponent', () => {
  let component: LessorDataComponent;
  let fixture: ComponentFixture<LessorDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LessorDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LessorDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
