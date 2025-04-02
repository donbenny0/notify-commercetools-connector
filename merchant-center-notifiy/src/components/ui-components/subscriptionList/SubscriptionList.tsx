
import styles from "./subscriptionList.module.css";


type SubscriptionListProps = {
    subscriptionList: object;
};



const SubscriptionList = ({ subscriptionList }: SubscriptionListProps) => {

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Trigger Type</th>
                        <th>Type</th>
                        <th>Message</th>
                        <th>Created at</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>OrderStateChanged</td>
                        <td>Order</td>
                        <td>Lorem ipsum dolor sit amet consectetur adipisicing elit.</td>
                        <td>27/08/2025</td>
                        <td>Yes</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default SubscriptionList;
