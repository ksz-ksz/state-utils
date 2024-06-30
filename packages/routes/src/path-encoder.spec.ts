import { createPathEncoder } from './path-encoder';

describe('path-encoder', () => {
  describe('encode', () => {
    it('should encode', () => {
      const encoder = createPathEncoder();

      const result = encoder.encode(['foo', 'bar', '<>?,/`@#$%^&+']);

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": "foo/bar/%3C%3E%3F%2C%2F%60%40%23%24%25%5E%26%2B",
}
`);
    });
  });

  describe('decode', () => {
    it('should decode', () => {
      const encoder = createPathEncoder();

      const result = encoder.decode(
        'foo/bar/%3C%3E%3F%2C%2F%60%40%23%24%25%5E%26%2B'
      );

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": [
    "foo",
    "bar",
    "<>?,/\`@#$%^&+",
  ],
}
`);
    });
  });
});
