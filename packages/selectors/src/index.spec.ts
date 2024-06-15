import { hello } from './index';

describe('hello', () => {
  it('should return hi', () => {
    expect(hello()).toBe('hi');
  });
});
