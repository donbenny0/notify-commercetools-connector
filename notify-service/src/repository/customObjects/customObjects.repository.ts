import { createApiRoot } from "../../client/create.client";
import GlobalError from "../../errors/global.error";
import { CreateCustomObjectInterface } from "../../interfaces/customObject.interface";

const apiRoot = createApiRoot();

export const updateCustomObjectRepository = async (objectBody: CreateCustomObjectInterface) => {

    try {
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
    } catch (error: any) {
        throw new GlobalError(error.statusCode || 500, error.message || `Failed to create ${objectBody.container}`);
    }

};

export const getCustomObjectRepository = async (container: string, key: string) => {
    try {
        const response = await apiRoot.customObjects()
            .withContainerAndKey({ container, key })
            .get()
            .execute();
        return response.body;
    } catch (error: any) {
        throw new GlobalError(error.statusCode || 500, error.message || `Failed to fetch ${container}`);
    }

};
