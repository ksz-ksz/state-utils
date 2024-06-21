import { createEffect } from './effect';
import { createActionSources, createActionTypes } from '@state-utils/actions';
import { map, merge, Subject, zip } from 'rxjs';

describe('Effect', () => {
  it('should dispatch actions from all initializers', () => {
    const fooSubject = new Subject<string>();
    const barSubject = new Subject<string>();
    const listing: any[] = [];
    const actionTypes = createActionTypes<{
      foo: string;
      bar: string;
      baz: string;
    }>({ namespace: 'test' });
    const actionsSources = createActionSources();
    merge(
      actionsSources.ofType(actionTypes.foo),
      actionsSources.ofType(actionTypes.bar),
      actionsSources.ofType(actionTypes.baz)
    ).subscribe({
      next(action) {
        listing.push('next', action);
      },
      error(error) {
        listing.push('error', error);
      },
      complete() {
        listing.push('complete');
      },
    });

    createEffect(actionsSources, {
      effects: {
        foo: () => fooSubject.pipe(map(actionTypes.foo)),
        bar: () => barSubject.pipe(map(actionTypes.bar)),
        baz: (actionSources) =>
          zip([
            actionSources.ofType(actionTypes.foo),
            actionSources.ofType(actionTypes.bar),
          ]).pipe(
            map(([foo, bar]) => actionTypes.baz(`${foo.payload}${bar.payload}`))
          ),
      },
    });
    fooSubject.next('foo');
    fooSubject.next('bar');

    expect(listing).toMatchInlineSnapshot();
  });

  it('should stop dispatching actions after dispose', () => {});
});
