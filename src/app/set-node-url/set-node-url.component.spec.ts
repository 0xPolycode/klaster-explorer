import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetNodeUrlComponent } from './set-node-url.component';

describe('SetNodeUrlComponent', () => {
  let component: SetNodeUrlComponent;
  let fixture: ComponentFixture<SetNodeUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SetNodeUrlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetNodeUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
