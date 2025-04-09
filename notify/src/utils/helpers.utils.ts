import CustomError from '../errors/custom.error';
import { GeneralError, InvalidPlaceholder } from '../errors/helpers.errors';
import { Base64DecodingError, JsonParsingError, MissingPubSubMessageDataError } from '../errors/pubsub.error';
import { PubSubEncodedMessage } from '../interface/pubsub.interface';
import { PubsubMessageBody } from '../interface/pubsubMessageBody.interface';
import { logger } from './logger.utils';

// Helper function to decode base64 and parse JSON
const decodeAndParseData = (data: string): PubsubMessageBody => {
    try {
        // Decode base64 and parse JSON in a single block
        const decodedData = Buffer.from(data, 'base64').toString().trim();
        const parsedData = JSON.parse(decodedData);

        return parsedData;
    } catch (error) {
        // Check if it's a decoding or parsing error
        if (error instanceof SyntaxError) {
            logger.error('Failed to parse JSON:', { error });
            throw new JsonParsingError();
        } else {
            logger.error('Failed to decode base64 data', { error });
            throw new Base64DecodingError();
        }
    }
};

// Process the event data
export const decodePubSubData = (pubSubMessage: PubSubEncodedMessage): PubsubMessageBody => {
    // Check if the message has data to decode
    if (!pubSubMessage.data) {
        logger.error('Missing data field in the Pub/Sub message');
        throw new MissingPubSubMessageDataError();
    }

    // Decode and parse the data
    return decodeAndParseData(pubSubMessage.data);
};


// generate random key
export const generateRandomKey = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 32;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
};


// Generate custom messageBody
export const parsePlaceholder = (data: object, template: string): string => {
    // Pre-compile the regex once with safeguards against backtracking
    const placeholderRegex = /\{\{([^{}]+?)\}\}/g;

    // Cache for path segments to avoid repeated parsing
    const pathCache = new Map<string, { segments: string[], wildcards: (boolean | number)[] }>();

    const extractValues = (obj: object, pathString: string): any[] => {
        // Check cache first
        let cached = pathCache.get(pathString);
        if (!cached) {
            const segments: string[] = [];
            const wildcards: (boolean | number)[] = [];

            // Parse path segments with minimal operations
            let currentPos = 0;
            while (currentPos < pathString.length) {
                const dotPos = pathString.indexOf('.', currentPos);
                const segmentEnd = dotPos === -1 ? pathString.length : dotPos;
                const segment = pathString.slice(currentPos, segmentEnd);

                const arrayMatch = segment.match(/^([^[]+)(?:\[(\*|\d+)\])?$/);
                if (!arrayMatch) {
                    segments.push(segment);
                    wildcards.push(false);
                } else {
                    segments.push(arrayMatch[1]);
                    if (arrayMatch[2]) {
                        wildcards.push(arrayMatch[2] === '*' ? true : parseInt(arrayMatch[2], 10));
                    } else {
                        wildcards.push(false);
                    }
                }

                currentPos = segmentEnd + 1;
            }

            cached = { segments, wildcards };
            pathCache.set(pathString, cached);
        }

        const { segments, wildcards } = cached;
        let current: any[] = [obj];

        for (let i = 0; i < segments.length && current.length > 0; i++) {
            const segment = segments[i];
            const isWildcard = wildcards[i];

            current = current.flatMap((item) => {
                if (item === null || typeof item !== 'object') return [];

                const value = item[segment];
                if (value === undefined) return [];

                if (isWildcard === true) {
                    return Array.isArray(value) ? value : [];
                }
                if (typeof isWildcard === 'number') {
                    return Array.isArray(value) && value[isWildcard] !== undefined ? [value[isWildcard]] : [];
                }
                return [value];
            });
        }

        return current.filter(val => val !== undefined && val !== null);
    };

    return template.replace(placeholderRegex, (_, path) => {
        const values = extractValues(data, path.trim());
        return values.length > 0 ? String(values[0]) : '';
    });
};



export function jsonToBase64(json: object): string {
    const jsonString = JSON.stringify(json);
    const base64 = Buffer.from(jsonString).toString('base64');
    return base64;
}