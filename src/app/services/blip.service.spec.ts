import { TestBed } from '@angular/core/testing';

import { BlipService } from './blip.service';

describe('BlipService', () => {
  let service: BlipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
