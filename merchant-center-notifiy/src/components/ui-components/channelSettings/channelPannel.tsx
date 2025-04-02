import { useEffect, useState } from 'react';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';

import TabBar from '../tabBar/TabBar';
import styles from './channelPannel.module.css';
import bellIcon from '../../../assets/icons/bell-24.png';
import messageIcon from '../../../assets/icons/messages-26.png';
import SubscriptionList from '../subscriptionList/SubscriptionList';
import { fetchCustomObjectQueryRepository } from '../../../repository/customObject.repository';

const ChannelPannel = () => {
    const [activeTab, setActiveTab] = useState('subscription');
    const tabs = [
        { id: 'subscription', label: 'Subscriptions', icon: bellIcon },
        { id: 'logs', label: 'Logs', icon: messageIcon },
    ];

    const dispatch = useAsyncDispatch();
    const [subscriptions, setSubscriptions] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchCustomObjectQueryRepository(
                    dispatch,
                    'notify-subscriptions',
                    'notify-subscriptions-key',
                    'expand=value.references.channelReference'
                );
                setSubscriptions(response);
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
            }
        };

        fetchData();
    }, [dispatch]);

    // Extract isEnabled value safely
    const isEnabled = subscriptions?.value?.references?.obj?.value?.whatsapp?.configurations?.isEnabled ?? false;
    
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    return (
        <div className={styles.channelPannel}>
            <div className={styles.channelPannelHeader}>
                <div>
                    <h3>WhatsApp</h3>
                </div>
                <div className={styles.channelPannelHeaderButtons}>
                    <button>{isEnabled ? 'Enabled' : 'Disabled'}</button>
                    <button>Subscription</button>
                </div>
            </div>
            <br />
            <div className={styles.channelPannelBody}>
                <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
                {activeTab === 'subscription' && (
                    <div className={styles.tabContent}>
                        <SubscriptionList subscriptionList={subscriptions} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChannelPannel;
