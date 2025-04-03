import { useEffect, useState } from 'react';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';

import TabBar from '../tabBar/TabBar';
import styles from './channelPannel.module.css';
import bellIcon from '../../../assets/icons/bell-24.png';
import messageIcon from '../../../assets/icons/messages-26.png';
import addIcon from '../../../assets/icons/add-circle.svg';
import SubscriptionList from '../subscriptionList/SubscriptionList';
import { fetchCustomObjectQueryRepository } from '../../../repository/customObject.repository';
import { toggleChannelStatusHook } from '../../hooks/channel/updateChannel.hooks';
import Loader from '../loader';
import Toggler from '../toggler/Toggler';

type ChannelPannelProps = {
    channel: string;
};

const ChannelPannel = ({ channel }: ChannelPannelProps) => {
    const [activeTab, setActiveTab] = useState('subscription');
    const [isChannelActive, setIsChannelActive] = useState(false);
    const [subscriptions, setSubscriptions] = useState<any>(null);
    const [isLoading, setisLoading] = useState(true);
    const dispatch = useAsyncDispatch();

    const tabs = [
        { id: 'subscription', label: 'Subscriptions', icon: bellIcon },
        { id: 'logs', label: 'Logs', icon: messageIcon },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setisLoading(true);
            try {
                const response = await fetchCustomObjectQueryRepository(
                    dispatch,
                    'notify-subscriptions',
                    'notify-subscriptions-key',
                    'expand=value.references.channelReference'
                );

                if (response?.value?.channels?.[channel]) {
                    setisLoading(false);
                    setSubscriptions(response.value.channels[channel]);
                    const isEnabled = response.value.references?.obj?.value[channel]?.configurations?.isEnabled;
                    setIsChannelActive(isEnabled);
                } else {
                    setisLoading(false);
                    setSubscriptions([]);
                    setIsChannelActive(false);
                }
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
            }
        };

        fetchData();
    }, [dispatch, channel]);

    const handleToggle = async (newState: boolean) => {
        setIsChannelActive(newState);
        await toggleChannelStatusHook(dispatch, channel, { isEnabled: newState });
    };

    return (
        <div className={styles.channelPannel}>
            {isLoading ? (
                <div className={styles.loading}><Loader /></div>
            ) : (
                <div>
                    <div className={styles.channelPannelHeader}>
                        <div>
                                <h3>Configure {channel.charAt(0).toUpperCase() + channel.slice(1)} preferences</h3>
                                <small>Configure the subsciptions, message body & other settings related to {channel.charAt(0).toUpperCase() + channel.slice(1)} channel.</small>
                        </div>
                        <div className={styles.channelPannelHeaderButtons}>
                            <button className={styles.addSubButton}>
                                <span>Add subscription</span>
                                <img src={addIcon} alt="" />
                            </button>
                            <Toggler isToggled={isChannelActive} onToggle={handleToggle} />
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
            )}
        </div>
    );
};

export default ChannelPannel;
