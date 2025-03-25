import { transformOrder } from "../orders/orders.service";

export const resourceHandler = async (decodedData: Record<string, any>) => {
    if (decodedData.resource.typeId == 'order') {

        return await transformOrder(decodedData);
    }

    return null;
}
