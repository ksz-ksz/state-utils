import { createPathParamsEncoderFactory } from './create-path-params-encoder-factory';
import { params } from './params';

describe('create-path-params-encoder-factory', () => {
  describe('decode', () => {
    it('should decode', () => {
      const encoderFactory = createPathParamsEncoderFactory({
        path: 'hello/:foo',
        params: {
          foo: params.string(),
        },
      });
      const encoder = encoderFactory();

      const result = encoder.decode(['hello', 'fooVal']);

      expect(result).toMatchInlineSnapshot(`
{
  "consumed": 2,
  "parent": undefined,
  "valid": true,
  "value": {
    "foo": "fooVal",
  },
}
`);
    });

    it('should decode with parent', () => {
      const parentEncoderFactory = createPathParamsEncoderFactory({
        path: 'hello/:foo',
        params: {
          foo: params.string(),
        },
      });
      const encoderFactory = createPathParamsEncoderFactory({
        path: 'hi/:bar',
        params: {
          bar: params.number(),
        },
      });
      const parentEncoder = parentEncoderFactory();
      const encoder = encoderFactory(parentEncoder);

      const result = encoder.decode(['hello', 'fooVal', 'hi', '42']);

      expect(result).toMatchInlineSnapshot(`
{
  "consumed": 4,
  "parent": {
    "consumed": 2,
    "parent": undefined,
    "valid": false,
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

    it('should not decode if path is invalid', () => {
      const encoderFactory = createPathParamsEncoderFactory({
        path: 'hello/:foo',
        params: {
          foo: params.string(),
        },
      });
      const encoder = encoderFactory();

      const result = encoder.decode(['hi', 'fooVal']);

      expect(result).toMatchInlineSnapshot(`
{
  "consumed": -1,
  "parent": undefined,
  "valid": false,
}
`);
    });

    it('should not decode if path-param is invalid', () => {
      const encoderFactory = createPathParamsEncoderFactory({
        path: 'hello/:foo',
        params: {
          foo: params.string({
            pattern: /oops/,
          }),
        },
      });
      const encoder = encoderFactory();

      const result = encoder.decode(['hello', 'fooVal']);

      expect(result).toMatchInlineSnapshot(`
{
  "consumed": -1,
  "parent": undefined,
  "valid": false,
}
`);
    });
  });

  describe('encode', () => {
    it('should encode', () => {
      const encoderFactory = createPathParamsEncoderFactory({
        path: 'hello/:foo',
        params: {
          foo: params.string(),
        },
      });
      const encoder = encoderFactory();

      const result = encoder.encode({
        foo: 'fooVal',
      });

      expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": [
    "hello",
    "fooVal",
  ],
}
`);
    });
  });

  it('should encode with parent', () => {
    const parentEncoderFactory = createPathParamsEncoderFactory({
      path: 'hello/:foo',
      params: {
        foo: params.string(),
      },
    });
    const encoderFactory = createPathParamsEncoderFactory({
      path: 'hi/:bar',
      params: {
        bar: params.string(),
      },
    });
    const parentEncoder = parentEncoderFactory();
    const encoder = encoderFactory(parentEncoder);

    const result = encoder.encode({
      // @ts-expect-error fixme
      foo: 'fooVal',
      bar: 'barVal',
    });

    expect(result).toMatchInlineSnapshot(`
{
  "valid": true,
  "value": [
    "hello",
    "fooVal",
    "hi",
    "barVal",
  ],
}
`);
  });

  it('should not encode if path-param is invalid', () => {
    const encoderFactory = createPathParamsEncoderFactory({
      path: 'hello/:foo',
      params: {
        foo: params.string({
          pattern: /oops/,
        }),
      },
    });
    const encoder = encoderFactory();

    const result = encoder.encode({
      foo: 'fooVal',
    });

    expect(result).toMatchInlineSnapshot(`
{
  "valid": false,
}
`);
  });
});
