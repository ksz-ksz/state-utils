import { createPathEncoderFactory } from './create-path-encoder-factory';
import { params } from './params';

describe('create-path-encoder-factory', () => {
  describe('decode', () => {
    it('should decode', () => {
      const encoderFactory = createPathEncoderFactory({
        path: 'hello/:foo',
        params: {
          foo: params.string(),
        },
      });
      const encoder = encoderFactory();

      const result = encoder.decode({
        segments: [
          {
            type: 'path',
            name: 'hello',
          },
          {
            type: 'path-param',
            value: 'fooVal',
          },
        ],
      });

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
      const parentEncoderFactory = createPathEncoderFactory({
        path: 'hello/:foo',
        params: {
          foo: params.string(),
        },
      });
      const encoderFactory = createPathEncoderFactory({
        path: 'hi/:bar',
        params: {
          bar: params.string(),
        },
      });
      const parentEncoder = parentEncoderFactory();
      const encoder = encoderFactory(parentEncoder);

      const result = encoder.decode({
        segments: [
          {
            type: 'path',
            name: 'hello',
          },
          {
            type: 'path-param',
            value: 'fooVal',
          },
          {
            type: 'path',
            name: 'hi',
          },
          {
            type: 'path-param',
            value: 'barVar',
          },
        ],
      });

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
    "bar": "barVar",
    "foo": "fooVal",
  },
}
`);
    });
  });

  describe('encode', () => {
    it('should encode', () => {
      const encoderFactory = createPathEncoderFactory({
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
  "value": {
    "segments": [
      {
        "name": "hello",
        "type": "path",
      },
      {
        "type": "path-param",
        "value": "fooVal",
      },
    ],
  },
}
`);
    });
  });

  it('should encode with parent', () => {
    const parentEncoderFactory = createPathEncoderFactory({
      path: 'hello/:foo',
      params: {
        foo: params.string(),
      },
    });
    const encoderFactory = createPathEncoderFactory({
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
  "value": {
    "segments": [
      {
        "name": "hello",
        "type": "path",
      },
      {
        "type": "path-param",
        "value": "fooVal",
      },
      {
        "name": "hi",
        "type": "path",
      },
      {
        "type": "path-param",
        "value": "barVal",
      },
    ],
  },
}
`);
  });
});
