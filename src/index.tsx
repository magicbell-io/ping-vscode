import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { viewTypes } from './constants';
import { useWebView } from './lib/hooks';
import { globalStyles } from './ui/stitches';
import { List } from './views/list';

import { Provider, ErrorBoundary } from '@rollbar/react';
const rollbarConfig = {
  accessToken: process.env.ROLLBAR_POST_CLIENT_ITEM_ACCESS_TOKEN,
  environment: process.env.NODE_ENV,
  code_version: process.env.PING_VERSION,
};

globalStyles();

const views = {
  [viewTypes.LIST]: List,
};

function NotFound({ viewType }: { viewType: string }) {
  return <div>Unknown view type: {viewType}</div>;
}

function Index() {
  const { viewType, data } = useWebView();

  const View = views[viewType ?? ''] || NotFound;
  return <View viewType={viewType} data={data} />;
}

const ErrorDisplay = () => (
  <div style={{ padding: '24px'}}>
    <p>We caught an error in Pings UI root zone. You can help make Ping better if you send a message to giorgio@magicbell.io</p>
  </div>
);

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Provider config={rollbarConfig}>
    {/* 
    // @ts-ignore */}
    <ErrorBoundary fallbackUI={ErrorDisplay}>
      <Index />
    </ErrorBoundary>
  </Provider>
);