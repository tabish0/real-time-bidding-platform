import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

const mockContext = {} as ExecutionContext;

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('wraps the response in the standard envelope', (done) => {
    const payload = { id: '1', name: 'Test' };
    const mockCallHandler = { handle: () => of(payload) };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual(payload);
      expect(result.timestamp).toBeDefined();
      done();
    });
  });

  it('sets success to true for every response', (done) => {
    const mockCallHandler = { handle: () => of(null) };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result.success).toBe(true);
      done();
    });
  });

  it('timestamp is a valid ISO string', (done) => {
    const mockCallHandler = { handle: () => of({}) };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
      done();
    });
  });
});
