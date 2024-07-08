import { Observable, Subscriber, Subscription } from 'rxjs';
import { Action } from './action';

interface CommandSubscriber<TValue, TReturn> {
  next(value: Action<TValue>): Observable<TReturn>;
}

export class ActionSource<TPayload, TReturnPayload> extends Observable<
  Action<TPayload, TReturnPayload>
> {
  private readonly subscribers: Subscriber<Action<TPayload, never>>[] = [];
  private readonly commandSubscribers: CommandSubscriber<
    TPayload,
    TReturnPayload
  >[] = [];
  private currentSubscribers: Subscriber<Action<TPayload>>[] | undefined =
    undefined;
  private currentCommandSubscribers:
    | CommandSubscriber<TPayload, TReturnPayload>[]
    | undefined = undefined;

  constructor(
    private readonly namespace: string,
    private readonly name: string
  ) {
    super((subscriber) => {
      this.subscribers.push(subscriber);
      this.currentSubscribers = undefined;

      return () => {
        const indexOfSubscriber = this.subscribers.indexOf(subscriber);
        this.subscribers.splice(indexOfSubscriber, 1);
        this.currentSubscribers = undefined;
      };
    });
  }

  subscribeCommand(
    subscriber: CommandSubscriber<TPayload, TReturnPayload>
  ): Subscription {
    this.commandSubscribers.push(subscriber);
    this.currentCommandSubscribers = undefined;

    return new Subscription(() => {
      const indexOfSubscriber = this.commandSubscribers.indexOf(subscriber);
      this.commandSubscribers.splice(indexOfSubscriber, 1);
      this.currentCommandSubscribers = undefined;
    });
  }

  dispatch(
    action: Action<TPayload, TReturnPayload>
  ): Observable<TReturnPayload>[] {
    if (action.name !== this.name || action.namespace !== this.namespace) {
      return [];
    }

    if (this.currentSubscribers === undefined) {
      this.currentSubscribers = Array.from(this.subscribers);
    }
    for (const subscriber of this.currentSubscribers) {
      subscriber.next(action);
    }

    if (this.currentCommandSubscribers === undefined) {
      this.currentCommandSubscribers = Array.from(this.commandSubscribers);
    }

    const returns: Observable<TReturnPayload>[] = [];
    for (const subscriber of this.currentCommandSubscribers) {
      returns.push(subscriber.next(action));
    }

    return returns;
  }
}
