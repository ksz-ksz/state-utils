import { createFragmentEncoder } from './fragment-encoder';

describe('fragment-encoder', () => {
  describe('encode', () => {
    it('should encode', () => {
      const encoder = createFragmentEncoder();

      const result = encoder.encode('foobar<>?,/`@#$%^&+');

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": "#foobar%3C%3E%3F%2C%2F%60%40%23%24%25%5E%26%2B",
}
`);
    });
  });

  describe('decode', () => {
    it('should decode', () => {
      const encoder = createFragmentEncoder();

      const result = encoder.decode(
        '#foobar%3C%3E%3F%2C%2F%60%40%23%24%25%5E%26%2B'
      );

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": "foobar<>?,/\`@#$%^&+",
}
`);
    });
  });
});
