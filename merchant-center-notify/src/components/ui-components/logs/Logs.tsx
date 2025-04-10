import { useEffect, useState } from 'react';
import styles from './Logs.module.css';
import { fetchAllCustomObjectsRepository } from '../../../repository/customObject.repository';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import React from 'react';

// Type definitions
type ProcessLog = {
    message: string;
    statusCode: number;
    createdAt: string;
};

type ChannelData = {
    isSent: boolean;
    lastProcessedDate: string;
    recipient: string;
    processLogs: ProcessLog[];
};

type MessageData = {
    notificationType: string;
    projectKey: string;
    id: string;
    version: number;
    sequenceNumber: number;
    resource: {
        typeId: string;
        id: string;
    };
    resourceVersion: number;
    type: string;
    shipmentState?: string;
    oldShipmentState?: string;
    createdAt: string;
    lastModifiedAt: string;
    createdBy: {
        isPlatformClient: boolean;
        user?: {
            typeId: string;
            id: string;
        };
    };
    lastModifiedBy: {
        isPlatformClient: boolean;
        user?: {
            typeId: string;
            id: string;
        };
    };
};

type LogItem = {
    id: string;
    version: number;
    versionModifiedAt?: string;
    createdAt: string;
    lastModifiedAt: string;
    container?: string;
    key?: string;
    value: {
        message: string;
        channels: {
            whatsapp?: ChannelData;
            email?: ChannelData;
            sms?: ChannelData;
            [key: string]: ChannelData | undefined;
        };
    };
    decodedMessage?: MessageData;
};

type LogsProps = {
    channel: string; // "whatsapp", "email", or "sms"
};

// Helper function to determine status color
const getStatusColor = (isSent: boolean, lastLog?: ProcessLog) => {
    if (!isSent) return '#dc3545'; // Red for failed
    if (!lastLog) return '#6c757d'; // Gray if no logs

    if (lastLog.statusCode >= 200 && lastLog.statusCode < 300) return '#28a745'; // Green for success
    if (lastLog.statusCode >= 400 && lastLog.statusCode < 500) return '#ffc107'; // Yellow for client errors
    return '#dc3545'; // Red for server errors
};

// Helper function to format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
};

// Helper function to decode base64 message
const decodeBase64Message = (base64String: string): MessageData | null => {
    try {
        const decodedString = atob(base64String);
        return JSON.parse(decodedString) as MessageData;
    } catch (error) {
        console.error('Error decoding message:', error);
        return null;
    }
};

// Process API response to extract logs for a specific channel
const processLogsForChannel = (
    response: any,
    channel: string
): LogItem[] => {
    // Check if response is paginated or direct array
    const results = response.results ? response.results : response;

    return results
        .map((item: any) => ({
            ...item,
            decodedMessage: decodeBase64Message(item.value.message)
        }))
        .filter((item: LogItem) =>
            item.value.channels && item.value.channels[channel] !== undefined
        );
};

const ChannelLogs = ({ channel }: LogsProps) => {
    const dispatch = useAsyncDispatch();
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [logData, setLogData] = useState<LogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetchAllCustomObjectsRepository(dispatch, 'notify-messagelogs');
                const processedData = processLogsForChannel(response, channel);
                console.log(processedData);
                
                setLogData(processedData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load logs. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, channel]);

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const getChannelData = (item: LogItem): ChannelData | undefined => {
        return item.value.channels[channel];
    };

    if (isLoading) {
        return <div className={styles.container}>Loading logs...</div>;
    }

    if (error) {
        return <div className={styles.container}>{error}</div>;
    }

    if (logData.length === 0) {
        return <div className={styles.container}>No logs available for the selected channel.</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{channel.charAt(0).toUpperCase() + channel.slice(1)} Logs</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Trigger Type</th>
                        <th>Resource Type</th>
                        <th>Last updated</th>
                        <th>Status</th>
                        <th>Recipient</th>
                    </tr>
                </thead>
                <tbody>
                    {logData.map((item) => {
                        const channelData = getChannelData(item);
                        if (!channelData) return null;

                        const lastLog = channelData.processLogs?.[channelData.processLogs.length - 1];
                        const decodedMessage = item.decodedMessage;

                        return (
                            <React.Fragment key={item.id}>
                                <tr onClick={() => toggleRow(item.id)} className={styles.clickableRow}>
                                    <td>{decodedMessage?.type || 'N/A'}</td>
                                    <td>{decodedMessage?.resource.typeId || 'N/A'}</td>
                                    <td>{formatDate(channelData.lastProcessedDate)}</td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: getStatusColor(channelData.isSent, lastLog),
                                            marginRight: '8px'
                                        }} />
                                        {lastLog?.message || (channelData.isSent ? 'Sent' : 'Failed')}
                                    </td>
                                    <td>{channelData.recipient}</td>
                                </tr>
                                {expandedRow === item.id && (
                                    <tr className={styles.expandedRow}>
                                        <td colSpan={5}>
                                            <div className={styles.expandedContent}>
                                                <h4>Process Logs</h4>
                                                <div className={styles.logsContainer}>
                                                    {channelData.processLogs.map((log, index) => (
                                                        <div key={`${item.id}-log-${index}`} className={styles.logEntry}>
                                                            <div className={styles.logHeader}>
                                                                <span className={styles.logStatus} style={{
                                                                    backgroundColor: log.statusCode >= 200 && log.statusCode < 300 ? '#28a745' :
                                                                        log.statusCode >= 400 && log.statusCode < 500 ? '#ffc107' : '#dc3545'
                                                                }}>
                                                                    {log.statusCode}
                                                                </span>
                                                                <span className={styles.logTime}>{formatDate(log.createdAt)}</span>
                                                            </div>
                                                            <div className={styles.logMessage}>{log.message}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <h4>Message Details</h4>
                                                <div className={styles.messageDetails}>
                                                    {decodedMessage ? (
                                                        <>
                                                            <div><strong>Notification Type:</strong> {decodedMessage.notificationType}</div>
                                                            <div><strong>Project Key:</strong> {decodedMessage.projectKey}</div>
                                                            <div><strong>Resource ID:</strong> {decodedMessage.resource.id}</div>
                                                            <div><strong>Resource Type:</strong> {decodedMessage.resource.typeId}</div>
                                                            <div><strong>Created At:</strong> {formatDate(decodedMessage.createdAt)}</div>
                                                            {decodedMessage.shipmentState && (
                                                                <div>
                                                                    <strong>Shipment State:</strong> {decodedMessage.shipmentState}
                                                                    {decodedMessage.oldShipmentState && ` (from ${decodedMessage.oldShipmentState})`}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div>Message details unavailable</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// Hook for extracting specific channel logs (can be used outside the component)
export const useChannelLogs = (channel: string) => {
    const dispatch = useAsyncDispatch();
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetchAllCustomObjectsRepository(dispatch, 'notify-messagelogs');
                const processedData = processLogsForChannel(response, channel);
                setLogs(processedData);
            } catch (error) {
                console.error('Error fetching logs:', error);
                setError('Failed to load logs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [dispatch, channel]);

    return { logs, isLoading, error };
};

export default ChannelLogs;