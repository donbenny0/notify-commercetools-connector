import { useEffect, useState } from 'react';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';

import TabBar from '../tabBar/TabBar';
import styles from './channelPannel.module.css';
import bellIcon from '../../../assets/icons/bell-24.png';
import messageIcon from '../../../assets/icons/messages-26.png';
import SubscriptionList from '../subscriptionList/SubscriptionList';
import { fetchCustomObjectQueryRepository } from '../../../repository/customObject.repository';
import { toggleChannelStatusHook } from '../../hooks/channel/updateChannel.hooks';
import Loader from '../loader';

type ChannelPannelProps = {
    channel: string;
};

const ChannelPannel = ({ channel }: ChannelPannelProps) => {
    const [activeTab, setActiveTab] = useState('subscription');
    const [isChannelActive, setIsChannelActive] = useState(false);
    const [subscriptions, setSubscriptions] = useState<any>(null);
    const [isLoading, setisLoading] = useState(true)
    const dispatch = useAsyncDispatch();

    const tabs = [
        { id: 'subscription', label: 'Subscriptions', icon: bellIcon },
        { id: 'logs', label: 'Logs', icon: messageIcon },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setisLoading(true)
            try {
                const response = await fetchCustomObjectQueryRepository(
                    dispatch,
                    'notify-subscriptions',
                    'notify-subscriptions-key'
                );

                if (response?.value?.channels?.[channel]) {
                    setisLoading(false)
                    setSubscriptions(response.value.channels[channel]);
                    const isEnabled = response.value.references?.obj?.value?.[channel]?.configurations?.isEnabled ?? false;
                    setIsChannelActive(isEnabled);
                } else {
                    setisLoading(false)
                    setSubscriptions([]);
                    setIsChannelActive(false);
                }
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
            }
        };

        fetchData();
    }, [dispatch, channel]);

    const toggleActivateButton = async () => {
        const newStatus = !isChannelActive;
        setIsChannelActive(newStatus);
        await toggleChannelStatusHook(dispatch, channel, { isEnabled: newStatus });
    };

    return (
        <div className={styles.channelPannel}>
            {isLoading ? (
                <div className={styles.loading}><Loader /></div>
            ) : (
                <div>
                    <div className={styles.channelPannelHeader}>
                        <h3>{channel.charAt(0).toUpperCase() + channel.slice(1)}</h3>
                        <div className={styles.channelPannelHeaderButtons}>
                            <button onClick={toggleActivateButton}>
                                {isChannelActive ? 'Disable' : 'Enable'}
                            </button>
                            <button>Subscription</button>
                        </div>
                    </div>
                    <div className={styles.channelPannelBody}>
                        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                        {activeTab === 'subscription' && (
                            <div className={styles.tabContent}>
                                <SubscriptionList subscriptionList={subscriptions} channel={channel} />
                            </div>
                        )}
                    </div>
                </div>
            )}        </div>
    );
};

export default ChannelPannel;
