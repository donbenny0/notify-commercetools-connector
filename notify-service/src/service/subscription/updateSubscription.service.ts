import { CreateCustomObjectInterface } from "../../interfaces/customObject.interface";
import { createCustomObjectRepository } from "../../repository/customObjects/customObjects.repository"

export const updateSubscriptionService = async () => {

    const objectBody: CreateCustomObjectInterface = {
        "container": "notify-subscriptions",
        "key": "notify-subscriptions-key",
        "value": {
            "email": "XXXXXXXXXXXXXX",
            "subscription": "test",
            "date": new Date()
        }
    }
    await createCustomObjectRepository(objectBody);
}


