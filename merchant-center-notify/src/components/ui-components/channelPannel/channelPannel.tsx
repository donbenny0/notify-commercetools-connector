import { useEffect, useState } from 'react';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import bellIcon from '../../../assets/icons/bell-24.png';
import settingsIcon from '../../../assets/icons/settings_icon.svg';
import addIcon from '../../../assets/icons/add-circle.svg';
import closeIcon from '../../../assets/icons/close-circle.svg';
import logIcon from '../../../assets/icons/logs.svg';
import { FiBell, FiSettings, FiPlus, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import TabBar from '../tabBar/TabBar';
import styles from './channelPannel.module.css';
import SubscriptionList from '../subscriptionList/SubscriptionList';
import { fetchCustomObjectQueryRepository } from '../../../repository/customObject.repository';
import { toggleChannelStatusHook } from '../../hooks/channel/updateChannel.hooks';
import Loader from '../loader';
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
    const [messageData, setMessageData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [addSubscription, setAddSubscription] = useState(false);
    const dispatch = useAsyncDispatch();

    const tabs = [
        { id: 'subscriptions', label: 'Subscriptions', icon: bellIcon },
        { id: 'logs', label: 'Logs', icon: logIcon },
        { id: 'settings', label: 'Settings', icon: settingsIcon },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetchCustomObjectQueryRepository(
                    dispatch,
                    'notify-subscriptions',
                    'notify-subscriptions-key',
                    'expand=value.references.channelReference'
                );

                if (response?.value?.channels?.[channel]) {
                    setIsLoading(false);
                    setSubscriptions(response.value.channels[channel]);
                    const isEnabled = response.value.references?.obj?.value[channel]?.configurations?.isEnabled;
                    const messageBody = response.value.references?.obj?.value[channel]?.configurations?.messageBody;

                    setIsChannelActive(isEnabled);
                    setMessageData(messageBody);
                } else {
                    setIsLoading(false);
                    setSubscriptions([]);
                    setIsChannelActive(false);
                }
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, channel]);

    const handleToggle = async (newState: boolean) => {
        setIsChannelActive(newState);
        await toggleChannelStatusHook(dispatch, channel, { isEnabled: newState });
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader />
            </div>
        );
    }

    return (
        <div className={styles.panelContainer}>
            <div className={styles.panelHeader}>
                <div className={styles.headerContent}>
                    <h2 className={styles.channelTitle}>
                        {channel.charAt(0).toUpperCase() + channel.slice(1)} Channel
                    </h2>
                    <p className={styles.channelDescription}>
                        Configure subscriptions, message templates, and channel settings
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        className={`${styles.actionButton} ${addSubscription ? styles.cancelButton : styles.addButton}`}
                        onClick={() => setAddSubscription(!addSubscription)}
                    >
                        {addSubscription ? (
                            <>
                                <img src={closeIcon} alt="" />
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <img src={addIcon} alt="" />
                                <span>Add Subscription</span>
                            </>
                        )}
                    </button>

                    <button
                        className={`${styles.toggleButton} ${isChannelActive ? styles.active : ''}`}
                        onClick={() => handleToggle(!isChannelActive)}

                        aria-pressed={isChannelActive}
                    >
                        {isChannelActive ? (
                            <div className={styles.toggleButtonRight}>
                                <div className={styles.toggleHandleRight}></div>
                            </div>
                        ) : (
                            <div className={styles.toggleButtonLeft}>
                                <div className={styles.toggleHandleLeft}></div>
                            </div>
                        )}
                        <span>{isChannelActive ? 'Active' : 'Inactive'}</span>
                    </button>
                </div>
            </div>

            <div className={styles.panelContent}>
                {addSubscription ? (
                    <div className={styles.subscriptionForm}>
                        <TriggerSearchForm channel={channel} />
                    </div>
                ) : (
                    <>
                        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                        <div className={styles.tabContent}>
                            {activeTab === 'subscriptions' && (
                                <SubscriptionList
                                    subscriptionList={subscriptions}
                                    channel={channel}
                                    messageData={messageData}
                                />
                            )}
                            {activeTab === 'logs' && <Logs channel={channel} />}
                            {activeTab === 'settings' && <ChannelSettings channel={channel} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChannelPannel;