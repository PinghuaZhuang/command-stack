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
  /**
   * 当前要操作的 action
   */
  target: T;
  /**
   * 操作结束后的 action
   */
  end?: T;
};

export type CommandStackOption = {
  /**
   * 记录最大长度, 默认不限制
   */
  maxLength?: number;
};

export default class CommandStack<
  T extends Action<string, any>,
> extends EventEmitter {
  static events = {
    STACK_CHANGE: 'stack.change',
  };

  option!: CommandStackOption;
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
    option: CommandStackOption = {},
  ) {
    super();
    this._handlers = { ...handlers };
    this.option = { ...option };
    this.rigister();
  }

  get _stackIdx() {
    return this.$stackIdx;
  }
  set _stackIdx(value) {
    const step = value - this.$stackIdx;
    const current = this._stack[value];
    const prev = this._stack[this.$stackIdx];
    const redo = step > 0;
    this.$event = {
      target: redo ? current : prev,
      end: !redo ? current : prev,
      step,
      redo,
    };
    this.$stackIdx = value;
    this.emit(CommandStack.events.STACK_CHANGE, this.$event);
  }

  get undoDisabled() {
    return this._stackIdx < 0;
  }

  get redoDisabled() {
    return this._stackIdx >= this._stack.length - 1;
  }

  dispatch(action: T) {
    this._stack.splice(this._stackIdx + 1);
    const length = this._stack.push(action);
    this.$event = null;
    if (
      Number.isSafeInteger(this.option.maxLength) &&
      length > (this.option.maxLength as number)
    ) {
      this._stack.shift();
    }
    this._stackIdx = Math.min(this._stack.length - 1, this._stackIdx + 1);
  }

  excute(action: T) {
    this.emit(action.type, this.$event);
    this.$event = null;
  }

  undo() {
    if (this.undoDisabled) return;
    this.excute(this._stack[this._stackIdx--]);
  }

  redo() {
    if (this.redoDisabled) return;
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
