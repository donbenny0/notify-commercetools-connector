import React, { useState, useEffect } from 'react';
import styles from './TriggerSearchForm.module.css';
import { fetchCustomObjectRepository } from '../../../repository/customObject.repository';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { ChannelSubscriptions } from '../../../interfaces/subscription.interface';
import { addSubscriptionHook } from '../../hooks/subscription/addSubscription.hooks';

interface TriggerCategory {
    [category: string]: string[];
}

interface TriggerData {
    value: TriggerCategory;
}

interface TriggerInfo {
    category: string;
    trigger: string;
}

type TriggerSearchFormProps = {
    channel: string;
};

const TriggerSearchForm = ({ channel }: TriggerSearchFormProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrigger, setSelectedTrigger] = useState<TriggerInfo | null>(null);
    const [messageBody, setMessageBody] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredTriggers, setFilteredTriggers] = useState<TriggerInfo[]>([]);
    const [triggerData, setTriggerData] = useState<TriggerData | null>(null);
    const dispatch = useAsyncDispatch();

    // Fetch trigger data on component mount
    useEffect(() => {
        const fetchTriggers = async () => {
            try {
                const data = await fetchCustomObjectRepository(
                    dispatch,
                    'notify-trigger-list',
                    'notify-trigger-list-key'
                ) as unknown as TriggerData;

                if (data && data.value) {
                    setTriggerData(data);
                    // Initialize with all triggers
                    const allTriggers: TriggerInfo[] = [];
                    Object.entries(data.value).forEach(([category, triggers]) => {
                        if (Array.isArray(triggers)) {
                            triggers.forEach(trigger => {
                                allTriggers.push({
                                    category,
                                    trigger
                                });
                            });
                        }
                    });
                    setFilteredTriggers(allTriggers);
                }
            } catch (error) {
                console.error('Failed to fetch triggers:', error);
            }
        };
        fetchTriggers();
    }, [dispatch]);

    // Filter triggers based on search term
    useEffect(() => {
        if (!triggerData?.value) return;

        const filterTriggers = () => {
            const allTriggers: TriggerInfo[] = [];
            Object.entries(triggerData.value).forEach(([category, triggers]) => {
                if (Array.isArray(triggers)) {
                    if (searchTerm) {
                        triggers.forEach(trigger => {
                            if (trigger.toLowerCase().includes(searchTerm.toLowerCase())) {
                                allTriggers.push({
                                    category,
                                    trigger
                                });
                            }
                        });
                    } else {
                        triggers.forEach(trigger => {
                            allTriggers.push({
                                category,
                                trigger
                            });
                        });
                    }
                }
            });
            setFilteredTriggers(allTriggers);
        };

        filterTriggers();
    }, [searchTerm, triggerData]);

    const handleSubmit = async () => {
        if (!selectedTrigger || !messageBody) return;
        setIsLoading(true);
        try {
            const messageUpdatedBody: ChannelSubscriptions = {
                subscriptions: [
                    {
                        resourceType: selectedTrigger.category,
                        triggers: [
                            {
                                triggerType: selectedTrigger.trigger,
                                subscribedAt: messageBody
                            }
                        ]
                    },
                ]
            };

            // const response = await addSubscriptionHook(dispatch, channel, messageUpdatedBody);
            setSelectedTrigger(null);
            setMessageBody('');
            setSearchTerm('');
            console.log(messageUpdatedBody);
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTriggerSelect = (triggerInfo: TriggerInfo) => {
        setSelectedTrigger(triggerInfo);
        setSearchTerm(triggerInfo.trigger);
        setShowDropdown(false);
    };

    const handleInputBlur = () => {
        setTimeout(() => setShowDropdown(false), 200);
    };

    return (
        <form className={styles.formContainer}>
            <div className={styles.formGroup}>
                <label htmlFor="triggerSearch" className={styles.label}>
                    Search Trigger
                </label>
                <div className={styles.searchContainer}>
                    <input
                        id="triggerSearch"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={handleInputBlur}
                        className={styles.searchInput}
                        placeholder="Type to search triggers..."
                    />
                    {showDropdown && filteredTriggers.length > 0 && (
                        <ul className={styles.dropdown} role="listbox">
                            {filteredTriggers.map((triggerInfo, index) => (
                                <li
                                    key={`${triggerInfo.category}-${triggerInfo.trigger}-${index}`}
                                    className={styles.dropdownItem}
                                    onClick={() => handleTriggerSelect(triggerInfo)}
                                    role="option"
                                    aria-selected={selectedTrigger?.trigger === triggerInfo.trigger}
                                >
                                    <div>
                                        <div className={styles.searchChild}>
                                            <span>{triggerInfo.trigger}</span>
                                            <small>
                                                <strong>{triggerInfo.category}</strong>
                                            </small>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="messageBody" className={styles.label}>
                    Message Body
                </label>
                <textarea
                    id="messageBody"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className={styles.textarea}
                    placeholder="Enter your message here..."
                    rows={5}
                    required
                />
            </div>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className={styles.submitButton}
                disabled={!selectedTrigger || !messageBody || isLoading}
            >
                {isLoading ? (
                    <span className={styles.loadingIndicator}>Saving...</span>
                ) : (
                    'Save'
                )}
            </button>
        </form>
    );
};

export default TriggerSearchForm;