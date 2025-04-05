import { useState, useEffect } from 'react';
import styles from './TriggerSearchForm.module.css';
import { fetchCustomObjectRepository } from '../../../repository/customObject.repository';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { ChannelSubscriptions } from '../../../interfaces/subscription.interface';
import { addSubscriptionHook } from '../../hooks/subscription/addSubscription.hooks';
import { fetchCurrentResourceData } from '../../../repository/fetchResouces.repository';
import MessageBox from '../messageBox/MessageBox';
import PlaceholderSearch from '../placeholderSearch/PlaceholderSearch';


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
    const [templateData, setTemplateData] = useState<{ id: string }[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedTemplateData, setSelectedTemplateData] = useState<any>({});

    const dispatch = useAsyncDispatch();

    useEffect(() => {
        const fetchTriggers = async () => {
            try {
                const data = await fetchCustomObjectRepository(
                    dispatch,
                    'notify-trigger-list',
                    'notify-trigger-list-key'
                ) as TriggerData;

                if (data?.value) {
                    setTriggerData(data);
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

    useEffect(() => {
        if (!triggerData?.value) return;

        const filterTriggers = () => {
            const allTriggers: TriggerInfo[] = [];
            Object.entries(triggerData.value).forEach(([category, triggers]) => {
                if (Array.isArray(triggers)) {
                    triggers.forEach(trigger => {
                        if (!searchTerm || trigger.toLowerCase().includes(searchTerm.toLowerCase())) {
                            allTriggers.push({
                                category,
                                trigger
                            });
                        }
                    });
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
                    }
                ]
            };

            await addSubscriptionHook(dispatch, channel, messageUpdatedBody);
            setSelectedTrigger(null);
            setMessageBody('');
            setSearchTerm('');
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTriggerSelect = async (triggerInfo: TriggerInfo) => {
        try {
            const response = await fetchCurrentResourceData(dispatch, triggerInfo.category);
            setTemplateData(response);
            setSelectedTrigger(triggerInfo);
            setSearchTerm(triggerInfo.trigger);
            setShowDropdown(false);
        } catch (error) {
            console.error('Failed to fetch template data:', error);
        }
    };

    const handleTemplateSelect = (templateId: string) => {
        const selectedData = templateData.find((item) => item.id === templateId);
        setSelectedTemplate(templateId);
        setSelectedTemplateData(selectedData || {});
    };

    const handleInputBlur = () => {
        setTimeout(() => setShowDropdown(false), 200);
    };

    const handlePlaceholderSelect = (placeholder: string) => {
        console.log('Selected placeholder:', placeholder);
        // Do something with the selected placeholder
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.formGroup}>
                <div className={styles.searchContainer}>
                    <label htmlFor="triggerSearch" className={styles.label}>
                        Search Trigger
                    </label>
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
                                    <div className={styles.searchChild}>
                                        <span>{triggerInfo.trigger}</span>
                                        <small>
                                            <strong>{triggerInfo.category}</strong>
                                        </small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {selectedTrigger && (
                    <div className={styles.templateSearchContainer}>
                        <br />
                        <label htmlFor="templateSelection" className={styles.label}>
                            Choose {selectedTrigger.category} template
                        </label>
                        <select
                            id="templateSelection"
                            value={selectedTemplate}
                            onChange={(e) => handleTemplateSelect(e.target.value)}
                            className={styles.searchInput}
                        >
                            <option value="">Select a template...</option>
                            {templateData.map((res) => (
                                <option key={res.id} value={res.id} className={styles.dropdownItem}>
                                    {selectedTrigger.category}-{res.id}
                                </option>
                            ))}
                        </select>


                    </div>

                )}


                {selectedTemplate && (
                    <div>
                        <br />
                        <label htmlFor="templateSelection" className={styles.label}>
                            Delivery address
                            <br />
                            <small>Choose the appropriate delivery address field. </small>
                        </label>
                        <PlaceholderSearch
                            templateData={selectedTemplateData}
                            onSelect={handlePlaceholderSelect}
                            placeholder="Search for variables to insert..."
                        />
                        <br />
                        <MessageBox
                            selectedTemplateData={selectedTemplateData}
                            messageBody={messageBody}
                            onMessageChange={setMessageBody}
                        />
                    </div>
                )}
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
        </div>
    );
};

export default TriggerSearchForm;