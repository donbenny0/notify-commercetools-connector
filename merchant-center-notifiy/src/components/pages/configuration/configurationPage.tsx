import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import SpacingsInline from '@commercetools-uikit/spacings-inline';
import { useState } from 'react';
import { fetchAllChannelsHook } from '../../hooks/channel/fetchChannel.hooks';
import styles from './configuration.module.css';
import ToggleTable from '../../ui-components/channel-list/ToggleTable';
import whatsappIcon from '../../../assets/icons/whatsapp-48.png';
import emailIcon from '../../../assets/icons/email-48.png';
import bellIcon from '../../../assets/icons/bell-24.png'
import channelIcon from '../../../assets/icons/channel-50.png'
import messageIcon from '../../../assets/icons/messages-26.png'
import smsIcon from '../../../assets/icons/sms-48.png';
import { toggleChannelStatusHook } from '../../hooks/channel/updateChannel.hooks';
import Loader from '../../ui-components/loader';
import TabBar from '../../ui-components/tabBar/TabBar';
import SubscriptionList from '../../ui-components/subscriptionList/SubscriptionList';

type TLogsPageProps = {
    linkToNotifications: string;
};

const ConfigurationPage = ({ linkToNotifications }: TLogsPageProps) => {
    const dispatch = useAsyncDispatch();
    const [channels, setChannels] = useState<Record<string, any>>({});
    const [features, setFeatures] = useState<{ id: string; icon: string; channelName: string; enabled: boolean }[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('subscription');

    const channelIcons: Record<string, string> = {
        whatsapp: whatsappIcon,
        email: emailIcon,
        sms: smsIcon,
    };

    const fetchChannels = async () => {
        if (activeTab !== 'channels') {
            setLoading(true);
            try {
                const responseChannels = await fetchAllChannelsHook(dispatch);
                setChannels(responseChannels.value);

                // Transform the response data into the features structure
                const dynamicFeatures = Object.entries(responseChannels.value).map(([key, data]: [string, any]) => ({
                    id: key,
                    icon: channelIcons[key] || '',
                    channelName: key.charAt(0).toUpperCase() + key.slice(1),
                    enabled: data.configurations?.isEnabled || false,
                }));

                setFeatures(dynamicFeatures);
            } catch (error) {
                console.error('Failed to fetch channels', error);
            }
            setLoading(false);
        }


    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (tabId === 'channels') {
            fetchChannels();
        }
    };

    const tabs = [
        { id: 'channels', label: 'Channels', icon: channelIcon },
        { id: 'logs', label: 'Logs', icon: messageIcon },
    ];

    const handleFeatureToggle = async (id: string, enabled: boolean) => {
        setFeatures(features.map(f =>
            f.id === id ? { ...f, enabled } : f
        ));
        try {
            await toggleChannelStatusHook(dispatch, id, { isEnabled: enabled });
        } catch (error) {
            // Revert UI state if backend update fails
            setFeatures(features.map(f =>
                f.id === id ? { ...f, enabled: !enabled } : f
            ));
            console.error('Failed to update channel status:', error);
        }
    };

    return (
        <div>
            <SpacingsInline scale="m">
                <div>
                    <h1>Communication Preferences</h1>
                    <p>Configure your communication subscription here.</p>
                </div>
            </SpacingsInline>
            <br />
            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Channel Tab */}
            {activeTab === 'channels' && (
                <div className={styles.tabContent}>
                    {loading ? (
                        <div className={styles.loaderBody}>
                            <Loader />
                        </div>
                    ) : (
                        <ToggleTable items={features} onToggle={handleFeatureToggle} />
                    )}
                </div>
            )}
            {/* Subscription Tab */}
            {activeTab === 'logs' && (
                <div className={styles.tabContent}>
                    <SubscriptionList />
                </div>
            )}
        </div>
    );
};

export default ConfigurationPage;
