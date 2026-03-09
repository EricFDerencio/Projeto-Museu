import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Librarylist } from './librarylist';

describe('Librarylist', () => {
  let component: Librarylist;
  let fixture: ComponentFixture<Librarylist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Librarylist],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Librarylist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
