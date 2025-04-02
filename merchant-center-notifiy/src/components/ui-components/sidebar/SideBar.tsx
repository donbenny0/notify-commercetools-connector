import { useState } from 'react';
import styles from './sidebar.module.css';
import channelIcon from '../../../assets/icons/channel_icon_64.svg';
import dropDown from '../../../assets/icons/dropdown-arrow.svg';

const SideBar = () => {
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
                                <img src={channelIcon} alt="" />
                                <span>Channels</span>
                            </div>
                            <img
                                src={dropDown}
                                className={openSections['channels'] ? styles.rotated : ''}
                                alt=""
                            />
                        </div>
                        <ul
                            className={`${styles.channelList} ${openSections['channels'] ? styles.active : styles.hidden}`}>
                            <li>WhatsApp</li>
                            <li>Email</li>
                            <li>SMS</li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default SideBar;
