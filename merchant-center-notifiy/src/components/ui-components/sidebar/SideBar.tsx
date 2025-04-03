import { useState, useEffect } from 'react';
import styles from './sidebar.module.css';
import channelIcon from '../../../assets/icons/channel_icon_64.svg';
import dropDown from '../../../assets/icons/dropdown-arrow.svg';

type SideBarProps = {
    setChannel: (channel: string) => void;
    availableChannels: string[]; // Dynamically passing available channels
};

const SideBar = ({ setChannel, availableChannels }: SideBarProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleSection = (section: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
            <nav className={styles.nav}>
                <h3>Settings</h3>
                <hr />
                <ul>
                    <li>
                        <div className={styles.sidebarHeaders} onClick={() => toggleSection('channels')}>
                            <div className={styles.channelNamespace}>
                                <img src={channelIcon} alt="Channel Icon" />
                                <span>Channels</span>
                            </div>
                            <img
                                src={dropDown}
                                className={openSections['channels'] ? styles.rotated : ''}
                                alt="Dropdown Arrow"
                            />
                        </div>
                        <ul className={`${styles.channelList} ${openSections['channels'] ? styles.active : styles.hidden}`}>
                            {availableChannels.map((channel) => (
                                <li key={channel} onClick={() => setChannel(channel)}>
                                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                                </li>
                            ))}
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default SideBar;
