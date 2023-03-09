import * as vscode from 'vscode';

import { BaseView } from './base-view';
import { viewTypes } from './constants';
import * as context from './context';
import { commands } from './lib/commands';
import { register } from './lib/webview';

import rollbar from './lib/rollbar';

export function activate(ctx: vscode.ExtensionContext) {
  // record a generic message and send it to Rollbar
  rollbar.log('Activated');
  const listView = register(ListView, ctx);

  ctx.subscriptions.push(listView);

  // Hack to have the badges show up from the point VSCode is launched.
  commands.showList();

  context.init();
}

export function deactivate() {
  // intentionally empty
}

class ListView extends BaseView {
  static title = 'Ping';
  static viewType = viewTypes.LIST;

  unsubNotificationChanges?: () => void;

  resolveWebviewView(view: vscode.WebviewView | vscode.WebviewPanel): void {
    super.resolveWebviewView(view);

    // Update the badge whenever notifications change.
    this.unsubNotificationChanges = context.notifications.subscribe((val: Array<any>) => {
      this.setBadge(val.length);
    });
  }

  dispose() {
    if (this.unsubNotificationChanges) { this.unsubNotificationChanges(); }
    super.dispose();
  }
}
