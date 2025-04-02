import { lazy } from 'react';

const LogsPage = lazy(
  () => import('./logsPage' /* webpackChunkName: "welcome" */)
);

export default LogsPage;
