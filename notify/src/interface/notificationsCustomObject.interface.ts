export interface NotificationLog {
    channel: string;
    status: 'sent' | 'failed';
    logs: Logs;
    resourceType: string;
    recipient: string;
}


interface Logs {
    message?: any;
    statusCode?: number | string;
}