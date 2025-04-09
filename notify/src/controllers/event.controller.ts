import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { decodePubSubData } from '../utils/helpers.utils';
import CustomError from '../errors/custom.error';
import { PubsubMessageBody } from '../interface/pubsubMessageBody.interface';
import { addNewMessageStateEntry, processDeliveringMessage } from '../services/messageState/messageDispatcher.service';
import { MessageStateResponse } from '../interface/messageState.interface';
import { checkIfCustomObjectExists, getCustomObjectRepository } from '../repository/customObjects/customObjects.repository';
import { logger } from '../utils/logger.utils';
dotenv.config();

export const post = async (request: Request, response: Response): Promise<Response | void> => {
  const pubSubMessage = request.body.message;
  const pubSubDecodedMessage: PubsubMessageBody = decodePubSubData(pubSubMessage);

  try {
    const messageExists = await checkIfCustomObjectExists("notify-messageState", pubSubDecodedMessage.id);
    const channelsAndSubscriptions = await getCustomObjectRepository("notify-subscriptions", "notify-subscriptions-key","value.references.id");

    let allSuccessful: boolean;

    if (messageExists) {
      const currentMessageState: MessageStateResponse = await getCustomObjectRepository("notify-messageState", pubSubDecodedMessage.id);
      allSuccessful = await processDeliveringMessage(currentMessageState, channelsAndSubscriptions, pubSubDecodedMessage);
    } else {
      await addNewMessageStateEntry(pubSubDecodedMessage, channelsAndSubscriptions);
      allSuccessful = false;
    }
    logger.info(`success state : ${allSuccessful}`);

    if (allSuccessful) {
      return response.status(200).send('All messages sent successfully');
    } else {
      return response.status(400).send('Some messages failed to send');
    }
  } catch (error: any) {
    return response.status(error instanceof CustomError ? error.statusCode as number : 500).send(error.message);
  }
};



// export const post = async (request: Request, response: Response): Promise<Response | void> => {
//   const pubSubMessage = request.body.message;
//   const pubSubDecodedMessage: any = decodePubSubData(pubSubMessage);

//   try {
//     // Fetch the order using Commercetools
//     if (!subscribedResources.includes(pubSubDecodedMessage.resource.typeId)) {
      
//       await addNotificationLog('whatsapp', false, pubSubDecodedMessage, `The resource ${pubSubDecodedMessage.resource.typeId} is not subscribed ${JSON.stringify(request.body) }`);
//       return response.status(409).send(`The resource ${pubSubDecodedMessage.resource.typeId} is not subscribed`);
//     }

//     const resourceData: any = await resourceHandler(pubSubDecodedMessage);

//     // Send messages
//     await messageHandler(resourceData);
//     await addNotificationLog('whatsapp', true, pubSubDecodedMessage, JSON.stringify(request.body));
//     return response.status(200).send('Message sent successfully');
//   } catch (error: any) {
//     await addNotificationLog('whatsapp', false, pubSubDecodedMessage, JSON.stringify(request.body));
//     return response.status(error instanceof CustomError ? error.statusCode as number : 500).send(error.message);
//   }
// };
