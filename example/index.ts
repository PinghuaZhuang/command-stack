import CommandStack, { Action } from '../src';

enum InputActionType {
  ADD = 'ADD',
  CHANGE = 'CHANGE',
  // UPDATE,
  // DELETE,
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
    [InputActionType.ADD]({ redo, current, prev }) {
      if (redo) {
        inp.value = current!.context.value;
        console.log('ADD redo', inp.value, current, prev);
        return;
      }
      inp.value = prev!.context.oldValue;
      console.log('ADD undo', inp.value, current, prev);
    },
    [InputActionType.CHANGE]({ redo, current, prev }) {
      if (redo) {
        inp.value = current!.context.value;
        console.log('CHANGE redo', inp.value, current, prev);
        return;
      }
      inp.value = prev!.context.oldValue;
      console.log('CHANGE undo', inp.value, current, prev);
    },
  });
  // @ts-ignore
  window.cs = cs;

  const updateStatus = () => {
    console.log('input change', cs.prevDisabled, cs.nextDisabled);
    undoBtn.disabled = cs.prevDisabled;
    redoBtn.disabled = cs.nextDisabled;
  }

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
    updateStatus();
  };

  InsertBtn.onclick = () => {
    const insert = '{AddTxt}';
    const oldValue = inp.value;
    const selectionStart = inp.selectionStart ?? oldValue.length;
    inp.value =
      oldValue.slice(0, selectionStart) +
      insert +
      oldValue.slice(selectionStart);
    cs.dispatch({
      type: InputActionType.ADD,
      context: {
        selectionStart: inp.selectionStart,
        value: inp.value,
        oldValue,
        insert,
      },
    });
    updateStatus();
  };

  undoBtn.onclick = () => {
    cs.undo();
    updateStatus();
  };

  redoBtn.onclick = () => {
    cs.redo();
    updateStatus();
  };

  updateStatus();
});
