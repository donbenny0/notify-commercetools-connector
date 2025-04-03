import { useState } from "react";
import styles from "./subscriptionList.module.css";
import editIcon from "../../../assets/icons/edit_icon.svg";
import disconnectIcon from "../../../assets/icons/disconnect_icon.svg";

type Subscription = {
    resourceType: string;
    triggers?: { triggerType: string; subscribedAt: string }[];
};

type SubscriptionListProps = {
    subscriptionList: { subscriptions: Subscription[] };
    channel: string;
};

const SubscriptionList = ({ subscriptionList, channel }: SubscriptionListProps) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    if (!subscriptionList?.subscriptions?.length) {
        return <p>No subscriptions found for {channel}.</p>;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    const toggleRow = (rowKey: string) => {
        setExpandedRow(expandedRow === rowKey ? null : rowKey);
    };

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
                    {subscriptionList.subscriptions.map((subscription) =>
                        subscription.triggers?.length ? (
                            subscription.triggers.map((trigger, index) => {
                                const rowKey = `${subscription.resourceType}-${trigger.triggerType}-${index}`;
                                return (
                                    <>
                                        <tr key={rowKey}>
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
                                                >
                                                    <img src={disconnectIcon} alt="Disconnect" />
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className={`${styles.expandableRow} ${expandedRow === rowKey ? styles.expanded : ""}`}>
                                            <td colSpan={4}>
                                                {expandedRow === rowKey && (
                                                    <div className={styles.expandedContent}>
                                                        <p><strong>Edit Subscription:</strong> {subscription.resourceType}</p>
                                               
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    </>
                                );
                            })
                        ) : (
                            <tr key={subscription.resourceType}>
                                <td colSpan={3}>No triggers</td>
                                <td>
                                    <button className={styles.actionButton}>Unsubscribe</button>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SubscriptionList;
