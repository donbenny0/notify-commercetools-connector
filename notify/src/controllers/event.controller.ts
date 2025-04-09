import { Request, Response } from 'express';
import { decodePubSubData } from '../utils/helpers.utils';
import {
  addNewMessageStateEntry,
  processDeliveringMessage
} from '../services/messageState/messageDispatcher.service';
import {
  checkIfCustomObjectExists,
  getCustomObjectRepository
} from '../repository/customObjects/customObjects.repository';
import { logger } from '../utils/logger.utils';
import GlobalError from '../errors/global.error';
import { PubsubMessageBody } from '../interface/pubsub.interface';

export const post = async (request: Request, response: Response): Promise<Response> => {
  try {
    const { message: pubSubMessage } = request.body;
    const pubSubDecodedMessage: PubsubMessageBody = decodePubSubData(pubSubMessage);
    // Retun if received message is an subscription type
    if (pubSubDecodedMessage.notificationType !== "Message" || !pubSubDecodedMessage) return response.status(200).send();

    const [messageExists, channelsAndSubscriptions] = await Promise.all([
      checkIfCustomObjectExists("notify-messageState", pubSubDecodedMessage.id),
      getCustomObjectRepository("notify-subscriptions", "notify-subscriptions-key", "value.references.id")
    ]);

    let allSuccessful: boolean;

    if (messageExists) {
      const currentMessageState = await getCustomObjectRepository(
        "notify-messageState",
        pubSubDecodedMessage.id
      );
      allSuccessful = await processDeliveringMessage(
        currentMessageState,
        channelsAndSubscriptions,
        pubSubDecodedMessage
      );
    } else {
      await addNewMessageStateEntry(pubSubDecodedMessage, channelsAndSubscriptions);
      allSuccessful = false;
    }

    logger.info(`Processing completed with status: ${allSuccessful}`);
    return response.status(allSuccessful ? 200 : 400).send();

  } catch (error: unknown) {
    const statusCode = error instanceof GlobalError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    logger.error(`Error processing message: ${message}`);
    return response.status(statusCode as number).send(message);
  }
};