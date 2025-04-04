import React, { useEffect, useState } from "react";
import styles from "./subscriptionList.module.css";
import editIcon from "../../../assets/icons/edit_icon.svg";
import disconnectIcon from "../../../assets/icons/disconnect_icon.svg";
import EditSubscription from "../editSubscription/editSubscription";
import { removeSubscriptionHook } from "../../hooks/subscription/removeSubscription.hooks";
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { RemoveSubscriptionRequestInterface } from "../../../interfaces/subscription.interface";

type Subscription = {
    resourceType: string;
    triggers?: { triggerType: string; subscribedAt: string }[];
};

type MessageData = {
    [key: string]: string;
};

type SubscriptionListProps = {
    subscriptionList: { subscriptions: Subscription[] };
    channel: string;
    messageData: MessageData;
};

const SubscriptionList = ({ subscriptionList, channel, messageData }: SubscriptionListProps) => {
    const dispatch = useAsyncDispatch();

    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [subList, setSubList] = useState<{ subscriptions: Subscription[] }>({ subscriptions: [] });

    useEffect(() => {
        setSubList(subscriptionList);
    }, [subscriptionList]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    const toggleRow = (rowKey: string) => {
        setExpandedRow(expandedRow === rowKey ? null : rowKey);
    };

    const handleUnsubscribe = async (resourceType: string, triggerType: string) => {
        try {
            const subscription: RemoveSubscriptionRequestInterface = {
                channel,
                subscription: {
                    resourceType,
                    triggerType,
                },
            };

            await removeSubscriptionHook(dispatch, subscription);

            setSubList((prev) => ({
                subscriptions: prev.subscriptions
                    .map((sub) => {
                        if (sub.resourceType === resourceType) {
                            const updatedTriggers = sub.triggers?.filter(t => t.triggerType !== triggerType);
                            return { ...sub, triggers: updatedTriggers };
                        }
                        return sub;
                    })
                    .filter(sub => sub.triggers?.length), 
            }));

            setExpandedRow(null); // close any open row
        } catch (error) {
            console.error("Error unsubscribing from trigger:", error);
        }
    };

    if (!subList?.subscriptions?.length) {
        return <p>No subscriptions found for {channel}.</p>;
    }

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Trigger Type</th>
                        <th>Resource Type</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subList.subscriptions.map((subscription) =>
                        subscription.triggers?.length ? (
                            subscription.triggers.map((trigger, index) => {
                                const rowKey = `${subscription.resourceType}-${trigger.triggerType}-${index}`;
                                const messageBody = messageData[trigger.triggerType] || "No message available";

                                return (
                                    <React.Fragment key={rowKey}>
                                        <tr>
                                            <td>{trigger.triggerType}</td>
                                            <td>{subscription.resourceType}</td>
                                            <td>{formatDate(trigger.subscribedAt)}</td>
                                            <td className={styles.actionButtonCollection}>
                                                <button
                                                    className={`${styles.actionButton} ${styles.actionEditButton}`}
                                                    data-tooltip="Edit"
                                                    onClick={() => toggleRow(rowKey)}
                                                >
                                                    <img src={editIcon} alt="Edit" />
                                                </button>
                                                <button
                                                    className={`${styles.actionButton} ${styles.actionDisconnectButton}`}
                                                    data-tooltip="Unsubscribe"
                                                    onClick={() =>
                                                        handleUnsubscribe(subscription.resourceType, trigger.triggerType)
                                                    }
                                                >
                                                    <img src={disconnectIcon} alt="Disconnect" />
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRow === rowKey && (
                                            <tr className={`${styles.expandableRow} ${styles.expanded}`}>
                                                <td colSpan={4}>
                                                    <div className={styles.expandedContent}>
                                                        <EditSubscription
                                                            resourceType={subscription.resourceType}
                                                            messageBody={messageBody}
                                                            channel={channel}
                                                            triggerName={trigger.triggerType}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : null
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SubscriptionList;
