import styles from './toggleTable.module.css';

type ToggleItem = {
    id: string;
    icon: string;
    channelName: string;
    enabled: boolean;
};

type ToggleTableProps = {
    items: ToggleItem[];
    onToggle: (id: string, enabled: boolean) => void;
};

const ToggleTable = ({ items, onToggle }: ToggleTableProps) => {
    const handleToggle = (id: string, currentValue: boolean) => {
        onToggle(id, !currentValue);
    };
    // <div className={styles.featureCell}>
    //     <img className={styles.channelIcon} src={item.icon} alt="channel Icons" />
    // </div>

    return (
        <table className={styles.toggleTable}>
            <tbody>
                {items.map((item) => (
                    <tr key={item.id} className={styles.toggleRow}>
                        <td >
                            <div className={styles.featureCell}>
                                <img className={styles.channelIcon} src={item.icon} alt="channel Icons" />
                                <span>{item.channelName}</span>
                            </div>
                        </td>
                        <td  className={styles.toggleCell}>
                            <label className={styles.toggleSwitch}>
                                <input
                                    type="checkbox"
                                    checked={item.enabled}
                                    onChange={() => handleToggle(item.id, item.enabled)}
                                />
                                <span className={styles.toggleSlider} />
                            </label>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ToggleTable;