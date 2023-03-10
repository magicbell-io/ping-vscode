import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';

import { signalKeys } from '../constants';
import { code } from './code';
import { Messenger } from './messenger';

const messenger = new Messenger(code);

export function useRemoteSignal<T = any>(key: keyof typeof signalKeys): [T | null, (value: T) => void] {
  const [state, setState] = React.useState(null);

  useEffect(() => {
    const dispose = messenger.on(`${key}::set`, (data) => setState(data));
    // initial sync by requesting data
    messenger.post(`${key}::get`).then((data) => setState(data));
    return () => dispose();
  }, [key, setState]);

  const sendSignal = useCallback(
    (data: any) => {
      setState(data);
      void messenger.post(`${key}::set`, data);
    },
    [key],
  );

  return [state, sendSignal];
}

export function useMessenger() {
  return messenger;
}

export function useToast() {
  return (message: string, ...action: string[]) => {
    return messenger.post('toast', { message, action });
  };
}

export function useWebView() {
  return useMemo(
    () => ({
      viewType: document.body.dataset.viewType,
      data: window['__INITIAL_DATA__'],
    }),
    [],
  );
}

type EventListener = (ev: KeyboardEvent) => any;

let debounceKeys = false;

export function useKeyboardEvent(): [KeyboardEvent, () => void] {
  const [activeKeyboardEvent, setKeyboardEvent] = React.useState<KeyboardEvent>(null);

  useEffect(() => {
    if (!window || !window.addEventListener) {
      return;
    }

    const handleKeyDown: EventListener = (event) => {
      event.preventDefault();
      if (debounceKeys) {
        return;
      }

      event.stopPropagation();

      setKeyboardEvent(event);
    };
    const handleKeyUp: EventListener = () => {
      // Clear all active keys on any key up.
      setKeyboardEvent(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeyboardEvent]);

  const resetKeyboardEvent = useCallback(() => {
    if (debounceKeys) {
      return;
    }

    setKeyboardEvent(null);
    debounceKeys = true;
    setTimeout(() => debounceKeys = false, 200);
  }, []);

  return [activeKeyboardEvent, resetKeyboardEvent];
}
