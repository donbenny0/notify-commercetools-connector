import {
    mapResourceAccessToAppliedPermissions,
    screen,
    type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { entryPointUriPath, PERMISSIONS } from '../../../constants';
import ApplicationRoutes from '../../../routes';
import { renderApplicationWithRedux } from '../../../test-utils';

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route = options.route || `/my-project/${entryPointUriPath}`;
  const { history } = renderApplicationWithRedux(<ApplicationRoutes />, {
    route,
    project: {
      allAppliedPermissions: mapResourceAccessToAppliedPermissions([
        PERMISSIONS.View,
      ]),
    },
    ...options,
  });
  return { history };
};

it('should render welcome page', async () => {
  renderApp();
  await screen.findByText('Develop applications for the Merchant Center');
});
