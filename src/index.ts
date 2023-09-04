import { EventEmitter } from 'events';

export interface Action<T extends string, C extends any> {
  type: T;
  context: C;
}

export type Handler<T extends Action<string, any>> = (
  action: T,
) => void | Promise<unknown>;

export type StackEvent<T> = {
  /**
   * 1: 下一步; -1: 上一步
   */
  step: number;
  redo: boolean;
  current?: T;
  prev?: T;
};

export default class CommandStack<
  T extends Action<string, any>,
> extends EventEmitter {
  static events = {
    STACK_CHANGE: 'stack.change',
  };

  private $stackIdx = -1;
  private $event: StackEvent<T> | null = null;
  _stack: T[] = [];
  /**
   * 注册对应的执行事件, 根据 `step > 0` 判断 undo, redo.
   * 例如: 触发了一次 'create.shape'操作, 执行 undo, 则对应的 'delete.shape' 操作. 反之不变.
   */
  _handlers = {} as Record<T['type'], (event: StackEvent<T>) => void>;

  constructor(
    handlers = {} as Record<T['type'], (event: StackEvent<T>) => void>,
  ) {
    super();
    this._handlers = { ...handlers };
    this.rigister();
  }

  get _stackIdx() {
    return this.$stackIdx;
  }
  set _stackIdx(value) {
    const step = value - this.$stackIdx;
    this.$event = {
      current: this._stack[value],
      prev: this._stack[this.$stackIdx],
      step,
      redo: step > 0,
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

  dispatch(action: T) {
    this._stack.splice(this._stackIdx + 1);
    this._stack.push(action);
    this._stackIdx++;
    this.$event = null;
  }

  excute(action: T) {
    this.emit(action.type, this.$event);
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

  rigister(handlers?: typeof this._handlers) {
    const _handlers = (this._handlers = handlers || this._handlers);
    let actionType: T['type'];
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
    let actionType: T['type'];
    for (actionType in _handlers) {
      this.off(actionType, _handlers[actionType]);
    }
    this._handlers = {} as typeof this._handlers;
  }
}
