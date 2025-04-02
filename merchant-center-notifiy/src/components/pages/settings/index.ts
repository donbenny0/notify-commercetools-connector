import { lazy } from 'react';

const EditMessages = lazy(
    () => import('./settings' /* webpackChunkName: "editMessages" */)
);

export default EditMessages;