import { createQueryEncoder } from './query-encoder';

describe('query-encoder', () => {
  describe('encode', () => {
    it('should encode', () => {
      const encoder = createQueryEncoder();

      const result = encoder.encode({
        foo: 'fooVal',
        bar: '<>?,/`@#$%^&+',
      });

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": "?foo=fooVal&bar=%3C%3E%3F%2C%2F%60%40%23%24%25%5E%26%2B",
}
`);
    });

    it('should encode empty object', () => {
      const encoder = createQueryEncoder();

      const result = encoder.encode({});

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": "",
}
`);
    });
  });

  describe('decode', () => {
    it('should decode', () => {
      const encoder = createQueryEncoder();

      const result = encoder.decode(
        '?foo=fooVal&bar=%3C%3E%3F%2C%2F%60%40%23%24%25%5E%26%2B'
      );

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": {
    "bar": "<>?,/\`@#$%^&+",
    "foo": "fooVal",
  },
}
`);
    });

    it('should decode empty string', () => {
      const encoder = createQueryEncoder();

      const result = encoder.decode('');

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": {},
}
`);
    });

    it('should decode ?', () => {
      const encoder = createQueryEncoder();

      const result = encoder.decode('?');

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": {},
}
`);
    });

    it('should decode param without value', () => {
      const encoder = createQueryEncoder();

      const result = encoder.decode('?');

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": {},
}
`);
    });

    it('should decode empty param', () => {
      const encoder = createQueryEncoder();

      const result = encoder.decode('?foo&&bar');

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": {
    "bar": "",
    "foo": "",
  },
}
`);
    });
  });
});
