import { createApiRoot } from "../../client/create.client";
import { CreateCustomObjectInterface } from "../../interfaces/customObject.interface";

const apiRoot = createApiRoot();

export const updateCustomObjectRepository = async (objectBody: CreateCustomObjectInterface) => {

    const response = await apiRoot.customObjects()
        .post({
            body: {
                container: objectBody.container,
                version: objectBody?.version,
                key: objectBody.key,
                value: objectBody.value
            }
        })
        .execute();
    return response.body;
};

export const getCustomObjectRepository = async (container: string, key: string) => {
    const response = await apiRoot.customObjects()
        .withContainerAndKey({ container, key })
        .get()
        .execute();
    return response.body;
};
