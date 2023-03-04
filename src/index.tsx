import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { viewTypes } from './constants';
import { useWebView } from './lib/hooks';
import { globalStyles } from './ui/stitches';
import { Detail } from './views/detail';
import { List } from './views/list';
import { ListDetail } from './views/list-detail';

globalStyles();

const views = {
  [viewTypes.LIST]: List,
  [viewTypes.LIST_DETAIL]: ListDetail,
  [viewTypes.DETAIL]: Detail,
};

function NotFound({ viewType }: { viewType: string }) {
  return <div>Unknown view type: {viewType}</div>;
}

function Index() {
  const { viewType, data } = useWebView();

  const View = views[viewType ?? ''] || NotFound;
  return <View viewType={viewType} data={data} />;
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<Index />);