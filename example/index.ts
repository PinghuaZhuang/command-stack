import CommandStack, { Action } from '../es';

enum InputActionType {
  INSERT = 'INSERT',
  CHANGE = 'CHANGE',
}

type InputAction = Action<InputActionType, {
  value: string;
  oldValue: string;
  selectionStart: number | null;
  insert?: string;
}>;

window.addEventListener('DOMContentLoaded', () => {
  const inp = document.querySelector('#inp') as HTMLInputElement;
  const updateInp = document.querySelector('#updateInp') as HTMLInputElement;
  const undoBtn = document.querySelector(
    'button[data-type="undo"]',
  ) as HTMLButtonElement;
  const redoBtn = document.querySelector(
    'button[data-type="redo"]',
  ) as HTMLButtonElement;
  const InsertBtn = document.querySelector('button[data-type="insert"]') as HTMLButtonElement;
  const updateBtn = document.querySelector('button[data-type="update"]') as HTMLButtonElement;
  const cs = new CommandStack<InputAction>({
    [InputActionType.INSERT]({ redo, target, end }) {
      if (redo) {
        inp.value = target!.context.value;
        console.log('INSERT redo', inp.value, target, end);
        return;
      }
      inp.value = target!.context.oldValue;
      console.log('INSERT undo', inp.value, target, end);
    },
    [InputActionType.CHANGE]({ redo, target, end }) {
      if (redo) {
        inp.value = target!.context.value;
        console.log('CHANGE redo', inp.value, target, end);
        return;
      }
      inp.value = target!.context.oldValue;
      console.log('CHANGE undo', inp.value, target, end);
    },
  });
  // @ts-ignore
  window.cs = cs;

  const updateStatus = () => {
    undoBtn.disabled = cs.undoDisabled;
    redoBtn.disabled = cs.redoDisabled;
  }
  cs.on(CommandStack.events.STACK_CHANGE, updateStatus);

  updateBtn.onclick = (e) => {
    const value = updateInp.value;
    console.log('update:', value);
    const oldValue = inp.value;
    inp.value = value;
    cs.dispatch({
      type: InputActionType.CHANGE,
      context: {
        selectionStart: inp.selectionStart,
        value: inp.value,
        oldValue,
      },
    });
  };

  InsertBtn.onclick = () => {
    if (!updateInp.value) return;
    const insert = `{${updateInp.value}}`;
    const oldValue = inp.value;
    const selectionStart = inp.selectionStart ?? oldValue.length;
    inp.value =
      oldValue.slice(0, selectionStart) +
      insert +
      oldValue.slice(selectionStart);
    cs.dispatch({
      type: InputActionType.INSERT,
      context: {
        selectionStart: inp.selectionStart,
        value: inp.value,
        oldValue,
        insert,
      },
    });
  };

  undoBtn.onclick = () => {
    cs.undo();
    updateStatus();
  };

  redoBtn.onclick = () => {
    cs.redo();
    updateStatus();
  };
});
