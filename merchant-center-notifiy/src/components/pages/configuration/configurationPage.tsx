import { useState } from 'react';
import styles from './configuration.module.css';
import SideBar from '../../ui-components/sidebar/SideBar';
import ChannelPannel from '../../ui-components/channelSettings/channelPannel';

const availableChannels = ['whatsapp', 'email', 'sms'];

const ConfigurationPage = () => {
    const [selectedChannel, setSelectedChannel] = useState<string>('whatsapp');

    return (
        <div className={styles.configBody}>
            <SideBar setChannel={setSelectedChannel} availableChannels={availableChannels} />
            <ChannelPannel channel={selectedChannel} />
        </div>
    );
};

export default ConfigurationPage;
