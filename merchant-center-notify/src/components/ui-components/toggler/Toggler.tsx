import React, { useEffect, useState } from "react";
import styles from "./toggler.module.css";

type TogglerProps = {
    isToggled: boolean;
    onToggle: (state: boolean) => void;
};

const Toggler: React.FC<TogglerProps> = ({ isToggled, onToggle }) => {
    const [checked, setChecked] = useState(isToggled);

    useEffect(() => {
        setChecked(isToggled);
    }, [isToggled]);

    const handleToggle = () => {
        const newState = !checked;
        setChecked(newState);
        onToggle(newState);
    };

    return (
        <div className={styles.toggler}>
            <input
                id="toggler-1"
                name="toggler-1"
                type="checkbox"
                checked={checked}
                onChange={handleToggle}
                className={styles.input}
            />
            <label htmlFor="toggler-1" className={styles.label}>
                {checked ? (
                    <svg className={styles.togglerOn} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                        <polyline className={`${styles.path} ${styles.check}`} points="100.2,40.2 51.5,88.8 29.8,67.5"></polyline>
                    </svg>
                ) : (
                    <svg className={styles.togglerOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                        <line className={`${styles.path} ${styles.line}`} x1="34.4" y1="34.4" x2="95.8" y2="95.8"></line>
                        <line className={`${styles.path} ${styles.line}`} x1="95.8" y1="34.4" x2="34.4" y2="95.8"></line>
                    </svg>
                )}
            </label>
        </div>
    );
};

export default Toggler;
