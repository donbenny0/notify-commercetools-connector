import styles from "./subscriptionList.module.css";

type Subscription = {
    resourceType: string;
    triggers?: { triggerType: string; subscribedAt: string }[];
};

type SubscriptionListProps = {
    subscriptionList: { subscriptions: Subscription[] };
    channel: string;
};

const SubscriptionList = ({ subscriptionList, channel }: SubscriptionListProps) => {
    if (!subscriptionList?.subscriptions?.length) {
        return <p>No subscriptions found for {channel}.</p>;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
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
                            subscription.triggers.map((trigger, index) => (
                                <tr key={`${subscription.resourceType}-${trigger.triggerType}-${index}`}>
                                    <td>{trigger.triggerType}</td>
                                    <td>{subscription.resourceType}</td>
                                    <td>{formatDate(trigger.subscribedAt)}</td>
                                    <td>
                                        <button className={styles.actionButton}>Unsubscribe</button>
                                    </td>
                                </tr>
                            ))
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
