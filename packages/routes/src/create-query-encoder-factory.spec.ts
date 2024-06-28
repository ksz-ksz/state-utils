import { createQueryEncoderFactory } from './create-query-encoder-factory';
import { params } from './params';

describe('create-query-encoder-factory', () => {
  describe('decode', () => {
    it('should decode', () => {
      const encoderFactory = createQueryEncoderFactory({
        params: {
          foo: params.string(),
        },
      });
      const encoder = encoderFactory();

      const result = encoder.decode({
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
    it('should decode with parent', () => {
      const parentEncoderFactory = createQueryEncoderFactory({
        params: {
          foo: params.string(),
        },
      });
      const encoderFactory = createQueryEncoderFactory({
        params: {
          bar: params.number(),
        },
      });
      const parentEncoder = parentEncoderFactory();
      const encoder = encoderFactory(parentEncoder);

      const result = encoder.decode({
        foo: 'fooVal',
        bar: '42',
      });

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": {
    "bar": 42,
    "foo": "fooVal",
  },
}
`);
    });
  });
});
