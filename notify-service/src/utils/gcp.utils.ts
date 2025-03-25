import dotenv from 'dotenv';
import { GcpVariables } from '../interface/gcp/gcp.interface';
dotenv.config();

const CONNECT_GCP_TOPIC_NAME_KEY = 'CONNECT_GCP_TOPIC_NAME';
const CONNECT_GCP_PROJECT_ID_KEY = 'CONNECT_GCP_PROJECT_ID';
const CONNECT_SUBSCRIPTION_KEY = 'CONNECT_GCP_SUBSCRIPTION_NAME';

export async function fetchGcpEnvironmentVariables(): Promise<GcpVariables> {
    try {
        const properties = new Map(Object.entries(process.env));

        const topic = properties.get(CONNECT_GCP_TOPIC_NAME_KEY);
        const projectId = properties.get(CONNECT_GCP_PROJECT_ID_KEY);
        const subscription = properties.get(CONNECT_SUBSCRIPTION_KEY);

        if (!topic || !projectId) {
            throw new Error('Required GCP environment variables are missing');
        }

        return {
            topic,
            projectId,
            subscription
        };
    } catch (error) {
        throw new Error(`Failed to fetch GCP environment variables: ${error}`);
    }
}

