import { expect, test } from 'vitest';
import CommandStack, { Action, StackEvent } from '../src';

enum ActionType {
  DELETE = 'delete.shape',
  CREATE = 'create.shape',
  UPDATE = 'update.shape',
}

type Context = {
  data: string;
};

type ShapeAction = Action<ActionType, Context>;

test('CRUD example', () => {
  let msg = '';
  const getMsg = (event: StackEvent<ShapeAction>) => {
    msg = event.current?.context.data ?? '';
  };

  const cs = new CommandStack<ShapeAction>({
    [ActionType.DELETE]: getMsg,
    [ActionType.CREATE]: getMsg,
    [ActionType.UPDATE]: getMsg,
  });

  cs.dispatch({
    type: ActionType.CREATE,
    context: {
      data: 'first step',
    },
  });
  cs.dispatch({
    type: ActionType.UPDATE,
    context: {
      data: 'second step',
    },
  });
  cs.dispatch({
    type: ActionType.DELETE,
    context: {
      data: 'last step',
    },
  });

  expect(cs.nextDisabled).toBe(true);
  expect(cs.prevDisabled).toBe(false);
  expect(cs._stack.length).toBe(3);
  expect(cs._stackIdx).toBe(2);
  expect(msg).toBe('');

  // 上一步
  cs.undo();
  expect(cs.nextDisabled).toBe(false);
  expect(cs.prevDisabled).toBe(false);
  expect(cs._stack.length).toBe(3);
  expect(cs._stackIdx).toBe(1);
  expect(msg).toBe('second step');

  // 回到最初
  cs.undo();
  cs.undo();
  expect(cs.nextDisabled).toBe(false);
  expect(cs.prevDisabled).toBe(true);
  expect(cs._stack.length).toBe(3);
  expect(cs._stackIdx).toBe(-1);
  expect(msg).toBe('');

  // 回撤第一步后执行 delete
  cs.redo();
  cs.dispatch({
    type: ActionType.DELETE,
    context: {
      data: 'insert step',
    },
  });
  expect(cs.nextDisabled).toBe(true);
  expect(cs.prevDisabled).toBe(false);
  expect(cs._stack.length).toBe(2);
  expect(cs._stackIdx).toBe(1);
  expect(msg).toBe('first step');

  cs.clean();
  expect(cs.nextDisabled).toBe(true);
  expect(cs.prevDisabled).toBe(true);
  expect(cs._stack.length).toBe(0);
  expect(cs._stackIdx).toBe(-1);
});
