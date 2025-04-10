import { MC_API_PROXY_TARGETS } from "@commercetools-frontend/constants";
import { actions } from '@commercetools-frontend/sdk';

export const fetchCurrentResourceData = async (dispatch: any, resourceType: string) => {
    try {
        const result = await dispatch(
            actions.get({
                mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
                service: resourceType,
                options: {},
            })
        );

        return result.results;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}