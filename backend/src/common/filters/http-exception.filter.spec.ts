import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { GlobalExceptionFilter } from './http-exception.filter';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
const mockRequest = { url: '/api/v1/test', method: 'GET' };

const mockHost = {
  switchToHttp: () => ({
    getResponse: () => ({ status: mockStatus }),
    getRequest: () => mockRequest,
  }),
} as unknown as ArgumentsHost;

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jest.clearAllMocks();
  });

  it('uses 500 and "Internal server error" for non-HTTP exceptions', () => {
    filter.catch(new Error('Unexpected failure'), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        path: '/api/v1/test',
        method: 'GET',
      }),
    );
  });

  it('uses the HttpException status and message', () => {
    filter.catch(new HttpException('Not Found', HttpStatus.NOT_FOUND), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'Not Found' }),
    );
  });

  it('unwraps the message field when HttpException response is an object', () => {
    const exception = new HttpException(
      { message: ['name must not be empty'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['name must not be empty'],
      }),
    );
  });

  it('includes a timestamp in the response', () => {
    filter.catch(new HttpException('Conflict', HttpStatus.CONFLICT), mockHost);

    const call = mockJson.mock.calls[0][0];
    expect(call.timestamp).toBeDefined();
    expect(() => new Date(call.timestamp)).not.toThrow();
  });
});
