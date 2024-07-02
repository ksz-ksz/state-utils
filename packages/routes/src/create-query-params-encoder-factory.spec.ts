import { createQuery } from './create-query-params-encoder-factory';
import { params } from './params';

describe('create-query-params-encoder-factory', () => {
  describe('decode', () => {
    it('should decode', () => {
      const encoderFactory = createQuery({
        foo: params.string(),
      });
      const encoder = encoderFactory();

      const result = encoder.decode({
        foo: 'fooVal',
      });

      expect(result).toMatchInlineSnapshot(`
{
  "parent": undefined,
  "valid": true,
  "value": {
    "foo": "fooVal",
  },
}
`);
    });
    it('should decode with parent', () => {
      const parentEncoderFactory = createQuery({
        foo: params.string(),
      });
      const encoderFactory = createQuery({
        bar: params.number(),
      });
      const parentEncoder = parentEncoderFactory();
      const encoder = encoderFactory(parentEncoder);

      const result = encoder.decode({
        foo: 'fooVal',
        bar: '42',
      });

      expect(result).toMatchInlineSnapshot(`
{
  "parent": {
    "parent": undefined,
    "valid": true,
    "value": {
      "foo": "fooVal",
    },
  },
  "valid": true,
  "value": {
    "bar": 42,
    "foo": "fooVal",
  },
}
`);
    });
  });

  describe('encode', () => {
    it('should encode', () => {
      const encoderFactory = createQuery({
        foo: params.string(),
      });
      const encoder = encoderFactory();

      const result = encoder.encode({
        foo: 'fooVal',
      });

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": {
    "foo": "fooVal",
  },
}
`);
    });

    it('should encode with parent', () => {
      const parentEncoderFactory = createQuery({
        foo: params.string(),
      });
      const encoderFactory = createQuery({
        bar: params.number(),
      });
      const parentEncoder = parentEncoderFactory();
      const encoder = encoderFactory(parentEncoder);

      const result = encoder.encode({
        // @ts-expect-error fixme
        foo: 'fooVal',
        bar: 42,
      });

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": {
    "bar": "42",
    "foo": "fooVal",
  },
}
`);
    });
  });
});
