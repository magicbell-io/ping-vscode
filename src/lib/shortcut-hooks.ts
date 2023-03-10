import { signalKeys } from '../constants';
import { code } from './code';
import { useRemoteSignal } from './hooks';
import { Messenger } from './messenger';

const messenger = new Messenger(code);

export function useShortcuts(
  activeKeyboardEvent: KeyboardEvent | null,
  selectedNoteIds: Array<string>,
  select: (notes: Array<string>) => void,
  consumeKeyboardEvent: () => void,
) {
  const [notifications] = useRemoteSignal<Array<any>>(signalKeys.NOTIFICATIONS);
  consumeKeyboardEvent();

  if (activeKeyboardEvent === null) {
    return;
  }

  function limMin(idx: number) {
    return Math.max(idx, 0);
  }

  function limMax(idx: number) {
    return Math.min(idx, notifications.length - 1);
  }

  function getNotificationById(id: string): any | null {
    return notifications.find((n) => n.id === id) ?? null;
  }

  function getFirstCurrentlySelectedIdx(): number | null {
    if (selectedNoteIds.length === 0) {
      return null;
    }
    return notifications.findIndex((n) => n.id === selectedNoteIds[0]);
  }

  function getLastCurrentlySelectedIdx(): number | null {
    if (selectedNoteIds.length === 0) {
      return null;
    }
    return notifications.findIndex((n) => n.id === selectedNoteIds.slice(-1).pop());
  }

  const firstSelectedNoteIdx = getFirstCurrentlySelectedIdx();
  const lastSelectedNoteIdx = getLastCurrentlySelectedIdx();

  const metaKeyPressed = (activeKeyboardEvent.metaKey || activeKeyboardEvent.ctrlKey);

  if (activeKeyboardEvent.key === 'a' && metaKeyPressed) {
    if (notifications.length === 0) {
      return;
    }

    select(notifications.map((n) => n.id));
    return;
  }
  if (activeKeyboardEvent.key === 'Escape') {
    select([]);
  }
  if (activeKeyboardEvent.key === 'ArrowDown') {
    if (notifications.length === 0) {
      return;
    }

    // Select the next single note, starting from the first one from the collection, or select the first one.
    if (firstSelectedNoteIdx === null) {
      select([notifications[0].id]);
      return;
    }
    select([notifications[limMax(firstSelectedNoteIdx + 1)].id]);
  }
  if (activeKeyboardEvent.key === 'ArrowUp') {
    if (notifications.length === 0) {
      return;
    }

    // Select the previouis single note, starting from the first one from the current selection, or select the last one.
    if (firstSelectedNoteIdx === null) {
      select([notifications.slice(-1)[0].id]);
      return;
    }
    select([notifications[limMin(firstSelectedNoteIdx - 1)].id]);
  }
  if (activeKeyboardEvent.key === 'Enter') {
    if (selectedNoteIds.length === 0) {
      return;
    }
    const note = getNotificationById(selectedNoteIds[0]);
    messenger.post('open-url', note.action_url);
  }
  if (activeKeyboardEvent.key === 'e' && metaKeyPressed) {
    const archivableIds = [...selectedNoteIds];
    // Try to select the next element already before archiving the old ones.
    let nextId = lastSelectedNoteIdx + 1;
    if (nextId >= notifications.length - 1) {
      // We archived the last element, try select the element right before the selection.
      nextId = firstSelectedNoteIdx - 1;
    }
    if (nextId < 0) {
      // We have no more notifications, clear selection.
      select([]);
    } else {
      select([notifications[nextId].id]);
    }

    for (const nId of archivableIds) {
      messenger.post('archive', nId);
    }
  }
}
