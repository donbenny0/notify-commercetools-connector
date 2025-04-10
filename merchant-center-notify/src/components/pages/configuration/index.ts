import { lazy } from 'react';

const ConfigurationPage = lazy(
    () => import('./configurationPage' /* webpackChunkName: "editMessages" */)
);

export default ConfigurationPage;