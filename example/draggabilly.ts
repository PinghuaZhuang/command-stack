import CommandStack, { Action } from '../es';
import Draggabilly from 'draggabilly';

enum DragActionType {
  MOVE = 'MOVE',
}

type Points = { x: number; y: number }[];

type DragAction = Action<
  DragActionType,
  {
    points: Points;
  }
>;

window.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector('#box') as HTMLDivElement;
  const undoBtn = document.querySelector(
    'button[data-type="undo-drag"]',
  ) as HTMLButtonElement;
  const redoBtn = document.querySelector(
    'button[data-type="redo-drag"]',
  ) as HTMLButtonElement;
  const dragbox = new Draggabilly(box, {
    containment: '#container',
  });

  let points: Points = [];
  let animatePoints: Points = [];

  const updateBtnStatus = () => {
    undoBtn.disabled = cs.undoDisabled;
    redoBtn.disabled = cs.redoDisabled;
  };

  const cs = new CommandStack<DragAction>({
    [DragActionType.MOVE]({
      redo,
      target: {
        context: { points },
      },
    }) {
      animatePoints = redo ? points.slice() : points.slice().reverse();
      undoBtn.disabled = true;
      redoBtn.disabled = true;
      dragbox.disable();
      animate();
    },
  });
  // @ts-ignore
  window.dragcs = cs;

  dragbox.on('dragStart', () => {
    points = [{ ...dragbox.position }];
  });
  dragbox.on('dragMove', () => {
    points.push({ ...dragbox.position });
  });
  dragbox.on('dragEnd', () => {
    cs.dispatch({
      type: DragActionType.MOVE,
      context: {
        points,
      },
    });
    points = [];
  });

  let requestID: number;

  function moveBox() {
    const point = animatePoints.shift();
    if (point == null) return false;
    Object.assign(box.style, {
      left: `${point.x}px`,
      top: `${point.y}px`,
    });
    return animatePoints.length;
  }

  function animate() {
    if (!moveBox()) {
      dragbox.enable();
      updateBtnStatus();
      return cancelAnimationFrame(requestID);
    }
    moveBox();
    requestID = requestAnimationFrame(animate);
  }

  cs.on(CommandStack.events.STACK_CHANGE, updateBtnStatus);
  undoBtn.onclick = cs.undo.bind(cs);
  redoBtn.onclick = cs.redo.bind(cs);
});
