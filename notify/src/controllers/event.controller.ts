import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { decodePubSubData } from '../utils/helpers.utils';
import CustomError from '../errors/custom.error';
import { addNotificationLog } from '../services/customObject/notifications/addNotificationLogs.service';
import { messageHandler } from '../services/messaging/messageHandler.service';
import { resourceHandler } from '../services/messaging/resourceHandler.service';
dotenv.config();
const subscribedResources = ['order'];

export const post = async (request: Request, response: Response): Promise<Response | void> => {
  const pubSubMessage = request.body.message;
  const pubSubDecodedMessage: any = decodePubSubData(pubSubMessage);

  try {
    // Fetch the order using Commercetools
    if (!subscribedResources.includes(pubSubDecodedMessage.resource.typeId)) {
      
      await addNotificationLog('whatsapp', false, pubSubDecodedMessage, `The resource ${pubSubDecodedMessage.resource.typeId} is not subscribed ${JSON.stringify(request.body) }`);
      return response.status(409).send(`The resource ${pubSubDecodedMessage.resource.typeId} is not subscribed`);
    }

    const resourceData: any = await resourceHandler(pubSubDecodedMessage);

    // Send messages
    await messageHandler(resourceData);
    await addNotificationLog('whatsapp', true, pubSubDecodedMessage, JSON.stringify(request.body));
    return response.status(200).send('Message sent successfully');
  } catch (error: any) {
    await addNotificationLog('whatsapp', false, pubSubDecodedMessage, JSON.stringify(request.body));
    return response.status(error instanceof CustomError ? error.statusCode as number : 500).send(error.message);
  }
};
