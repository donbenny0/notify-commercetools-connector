import { useEffect, useState } from 'react';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';

import TabBar from '../tabBar/TabBar';
import styles from './channelPannel.module.css';
import bellIcon from '../../../assets/icons/bell-24.png';
import settingsIcon from '../../../assets/icons/settings_icon.svg';
import addIcon from '../../../assets/icons/add-circle.svg';
import closeIcon from '../../../assets/icons/close-circle.svg';
import SubscriptionList from '../subscriptionList/SubscriptionList';
import { fetchCustomObjectQueryRepository } from '../../../repository/customObject.repository';
import { toggleChannelStatusHook } from '../../hooks/channel/updateChannel.hooks';
import Loader from '../loader';
import Toggler from '../toggler/Toggler';
import TriggerSearchForm from '../createTrigger/TriggerSearchForm';
import Logs from '../logs/Logs';
import ChannelSettings from '../channelSettings/ChannelSettings';

type ChannelPannelProps = {
    channel: string;
};


const ChannelPannel = ({ channel }: ChannelPannelProps) => {
    const [activeTab, setActiveTab] = useState('subscriptions');
    const [isChannelActive, setIsChannelActive] = useState(false);
    const [subscriptions, setSubscriptions] = useState<any>(null);
    const [messageData, setmessageData] = useState({});
    const [isLoading, setisLoading] = useState(true);
    const [addSubscription, setaddSubscription] = useState(false)
    const dispatch = useAsyncDispatch();



    const tabs = [
        { id: 'subscriptions', label: 'Subscriptions', icon: bellIcon },
        { id: 'logs', label: 'Logs', icon: settingsIcon },
        { id: 'settings', label: 'Settings', icon: settingsIcon },
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
                    const messageBody = response.value.references?.obj?.value[channel]?.configurations?.messageBody;

                    setIsChannelActive(isEnabled);
                    setmessageData(messageBody)
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
                            {addSubscription ? (
                                <button className={styles.cancelSubButton} onClick={() => setaddSubscription(false)}>
                                    <span>Cancel</span>
                                    <img src={closeIcon} alt="" />
                                </button>
                            ) : (
                                <button className={styles.addSubButton} onClick={() => setaddSubscription(true)}>
                                    <span>Add subscription</span>
                                    <img src={addIcon} alt="" />
                                </button>
                            )}                            <Toggler isToggled={isChannelActive} onToggle={handleToggle} />
                        </div>
                    </div>
                    <div className={styles.channelPannelBody}>
                        {addSubscription ? (
                            <div className={styles.addSubBody}>
                                <TriggerSearchForm channel={channel} />
                            </div>
                        ) : (
                            <div>
                                <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                                {activeTab === 'subscriptions' && (
                                    <div className={styles.tabContent}>
                                        <SubscriptionList subscriptionList={subscriptions} channel={channel} messageData={messageData} />
                                    </div>
                                )}
                                {activeTab === 'logs' && (
                                    <div className={styles.tabContent}>
                                        <Logs channel={channel} />
                                    </div>
                                )}
                                {activeTab === 'settings' && (
                                    <div className={styles.tabContent}>
                                        <ChannelSettings channel={channel} />
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default ChannelPannel;
