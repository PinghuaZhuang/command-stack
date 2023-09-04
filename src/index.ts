import { EventEmitter } from 'events';

export interface Action<T extends string> {
  type: T;
}

type Handler<T extends string> = (action: Action<T>) => void | Promise<unknown>;

type MergeAction<T extends string> = (
  actions: Action<T>[],
  cur: Action<T>,
  curIndex: number,
  otherActions: Action<T>[],
) => Action<T>[];

export default class CommandStack<T extends string> extends EventEmitter {
  static events = {
    STACK_CHANGE: 'stack.change',
  };

  $stackIdx = -1;
  $event: {
    /**
     * 1: 下一步; -1: 上一步
     */
    direction: 1 | -1;
    current: Action<T>;
    prev: Action<T>;
  } | null = null;
  _stack: Action<T>[] = [];
  _handlers = {} as Record<T, Handler<T>>;
  _tmpActions: Action<T>[] = [];
  // mergeAction?: MergeAction<T>;

  constructor(handlers: Record<T, Handler<T>>) {
    super();
    this._handlers = { ...handlers };
    this.rigister();
  }

  get _stackIdx() {
    return this.$stackIdx;
  }
  set _stackIdx(value) {
    this.$event = {
      current: this._stack[value],
      prev: this._stack[this.$stackIdx],
      direction: value > this.$stackIdx ? 1 : -1,
    };
    this.emit(CommandStack.events.STACK_CHANGE, this.$event);
    this.$stackIdx = value;
  }

  get prevDisabled() {
    return this._stackIdx < 0;
  }

  get nextDisabled() {
    return this._stackIdx >= this._stack.length - 1;
  }

  dispatch(action: Action<T>) {
    this._stack.splice(this._stackIdx + 1);
    this._stack.push(action);
    this._stackIdx++;
    this.$event = null;
  }

  undo() {
    if (this.prevDisabled) return;
    this.excute(this._stack[this._stackIdx--]);
  }

  redo() {
    if (this.nextDisabled) return;
    this.excute(this._stack[++this._stackIdx]);
  }

  excute(action: Action<T>) {
    this.emit(action.type, this.$event);
    this.$event = null;
  }

  rigister(handlers?: Record<T, Handler<T>>) {
    const _handlers = (this._handlers = handlers || this._handlers);
    let actionType: T;
    for (actionType in _handlers) {
      this.on(actionType, _handlers[actionType]);
    }
  }

  clean() {
    this._stackIdx = -1;
    this._stack = [];
    this.$event = null;
  }

  destroy() {
    this.clean();
    const _handlers = this._handlers;
    let actionType: T;
    for (actionType in _handlers) {
      this.off(actionType, _handlers[actionType]);
    }
    this._handlers = {} as typeof this._handlers;
  }
}
