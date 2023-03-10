import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from '@vscode/webview-ui-toolkit/react';
import * as React from 'react';

import { signalKeys } from '../constants';
import { useKeyboardEvent, useRemoteSignal } from '../lib/hooks';
import { useShortcuts } from '../lib/shortcut-hooks';
import { Notification } from '../ui/notification';

function getSentDate(notification) {
  if (notification.custom_attributes.source === 'github') {
    return new Date(notification.custom_attributes.source_notification.updated_at);
  }

  return new Date(notification.sent_at * 1000);
}

function getTitle(notification) {
  if (notification.custom_attributes.source === 'github') {
    const repo = notification.custom_attributes.source_notification.repository;
    return `${repo.owner.login}/${repo.name}`;
  }

  return notification.category
    .replace(/([A-Z]+)/g, ' $1')
    .toLowerCase()
    .trim();
}

function getOwnerAvatarUrl(notification) {
  if (notification.custom_attributes.source === 'github') {
    return notification.custom_attributes.source_notification.repository.owner.avatar_url;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function List(_: any) {
  const [activeKeyboardEvent, resetKeyboardEvent] = useKeyboardEvent();
  const [active, setActive] = useRemoteSignal(signalKeys.ACTIVE_NOTIFICATION);
  const [selectedNoteIds, updateSelectedIds] = React.useState<Array<string>>([]);
  const [notifications] = useRemoteSignal<Array<any>>(signalKeys.NOTIFICATIONS);

  const [notificationRefs, setElRefs] = React.useState<Map<string, any>>(new Map());

  React.useEffect(() => {
    setElRefs((elRefs) => {
      return notifications?.reduce((acc, value) => {
        acc[value.id] = elRefs[value.id] ?? React.createRef();
        return acc;
      }, new Map()) ?? new Map();
    });
  }, [notifications]);


  const getNoteById = (id: string) => notifications!.find((n) => n.id === id);

  const select = (ids: Array<string>) => {
    if (ids.length === 0) {
      setActive(null);
      updateSelectedIds([]);
      return;
    }

    const newIds = ids.filter((id) => !selectedNoteIds.includes(id));
    if (newIds.length === 0) {
      return;
    }

    // Always show the first note of the selection.
    setActive(getNoteById(ids[0]));
    // Add the whole range to the selection.
    updateSelectedIds(ids);

    notificationRefs[ids[0]]?.current?.scrollIntoView({
      behavior: 'auto',
      block: 'start',
    });
  };

  useShortcuts(activeKeyboardEvent, selectedNoteIds, select, resetKeyboardEvent);
  return (
    <div>
      <VSCodeDataGrid>
        {notifications?.map((notification, idx) => {
          return <VSCodeDataGridRow key={notification.id}>
              <VSCodeDataGridCell gridColumn="1">
                <div ref={notificationRefs[notification.id]}><Notification
                  noteRef={null}
                  id={notification.id}
                  actionUrl={notification.action_url}
                  avatarUrl={getOwnerAvatarUrl(notification)}
                  active={active?.id === notification.id || selectedNoteIds.includes(notification.id)}
                  title={getTitle(notification)}
                  sent_at={getSentDate(notification)}
                  content={notification.title}
                  onClick={() => select([notifications[idx].id])}
                  category={notification.category}
                /></div>
              </VSCodeDataGridCell>
            </VSCodeDataGridRow>;
        })}
      </VSCodeDataGrid>
    </div>
  );
}
