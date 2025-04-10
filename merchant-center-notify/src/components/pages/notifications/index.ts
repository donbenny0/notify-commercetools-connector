import { lazy } from 'react';

const Notifications = lazy(
  () => import('./notification' /* webpackChunkName: "welcome" */)
);

export default Notifications;
