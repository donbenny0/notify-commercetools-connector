import { useState, useEffect, useRef } from 'react';
import styles from './TriggerSearchForm.module.css';
import { fetchCustomObjectRepository } from '../../../repository/customObject.repository';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { ChannelSubscriptions } from '../../../interfaces/subscription.interface';
import { addSubscriptionHook } from '../../hooks/subscription/addSubscription.hooks';
import { fetchCurrentResourceData } from '../../../repository/fetchResouces.repository';

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
    const [placeholderSuggestions, setPlaceholderSuggestions] = useState<string[]>([]);
    const [showPlaceholderDropdown, setShowPlaceholderDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [placeholderContext, setPlaceholderContext] = useState<string>('');

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


    // Enhanced flattenObject to handle arrays properly for backend compatibility
    const flattenObject = (obj: any, prefix = '', inArray = false): string[] => {
        return Object.keys(obj).reduce((acc: string[], key) => {
            const pre = prefix ? `${prefix}.` : '';
            const currentPath = pre + key;

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (Array.isArray(obj[key])) {
                    // Handle arrays with both specific index and wildcard options
                    const arrayPaths = [
                        `${currentPath}[*]`, // Wildcard access
                        ...obj[key].map((_, index) => `${currentPath}[${index}]`) // Specific indices
                    ];

                    // Also include nested properties if array elements are objects
                    const nestedPaths = obj[key].length > 0 && typeof obj[key][0] === 'object'
                        ? flattenObject(obj[key][0], `${currentPath}[0]`, true)
                        : [];

                    return [...acc, ...arrayPaths, ...nestedPaths];
                } else {
                    // Regular object
                    return [...acc, currentPath, ...flattenObject(obj[key], currentPath, inArray)];
                }
            }
            return [...acc, currentPath];
        }, []);
    };

    useEffect(() => {
        if (selectedTemplateData && Object.keys(selectedTemplateData).length > 0) {
            const paths = flattenObject(selectedTemplateData);
            setPlaceholderSuggestions(paths);
        }
    }, [selectedTemplateData]);



    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessageBody(value);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastOpen = textBeforeCursor.lastIndexOf('{{');
        const lastClose = textBeforeCursor.lastIndexOf('}}');

        if (lastOpen > lastClose) {
            const currentPlaceholder = textBeforeCursor.substring(lastOpen + 2).trim();
            setPlaceholderContext(currentPlaceholder);

            // Get the part before the last dot (if any) to provide context-aware suggestions
            const lastDotPos = currentPlaceholder.lastIndexOf('.');
            const searchTerm = lastDotPos >= 0
                ? currentPlaceholder.substring(lastDotPos + 1)
                : currentPlaceholder;

            const contextPath = lastDotPos >= 0
                ? currentPlaceholder.substring(0, lastDotPos)
                : '';

            // Try to navigate to the context path in the data
            let contextData = selectedTemplateData;
            if (contextPath) {
                try {
                    const pathSegments = contextPath.split('.');
                    for (const segment of pathSegments) {
                        const arrayMatch = segment.match(/(.*)\[(\*|\d+)\]/);
                        if (arrayMatch) {
                            const [, key, index] = arrayMatch;
                            contextData = contextData[key];
                            if (Array.isArray(contextData)) {
                                if (index === '*') {
                                    // For wildcard, take first element as example
                                    contextData = contextData[0];
                                } else {
                                    contextData = contextData[parseInt(index, 10)];
                                }
                            }
                        } else {
                            contextData = contextData[segment];
                        }
                        if (!contextData) break;
                    }
                } catch (error) {
                    console.warn('Error navigating to context path:', error);
                    contextData = null;
                }
            }

            const matchingSuggestions = contextData
                ? flattenObject(contextData, contextPath)
                    .filter(path => path.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(path => path.startsWith(contextPath + '.')
                        ? path.substring(contextPath.length + 1)
                        : path)
                : placeholderSuggestions.filter(path =>
                    path.toLowerCase().includes(currentPlaceholder.toLowerCase())
                );

            if (matchingSuggestions.length > 0 && textareaRef.current) {
                const textarea = textareaRef.current;
                const lines = textBeforeCursor.split('\n');
                const currentLine = lines[lines.length - 1];
                const lineHeight = 20;
                const top = textarea.offsetTop + (lines.length * lineHeight) + 25;
                const left = textarea.offsetLeft + (currentLine.length * 8);

                setDropdownPosition({ top, left });
                setPlaceholderSuggestions(matchingSuggestions);
                setShowPlaceholderDropdown(true);
            } else {
                setShowPlaceholderDropdown(false);
            }
        } else {
            setShowPlaceholderDropdown(false);
        }
    };

    const insertPlaceholder = (placeholder: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = messageBody.substring(0, cursorPos);
        const textAfterCursor = messageBody.substring(cursorPos);

        const lastOpen = textBeforeCursor.lastIndexOf('{{');
        const lastClose = textBeforeCursor.lastIndexOf('}}');

        if (lastOpen > lastClose) {
            // Get the context path before the current partial input
            const partialPath = textBeforeCursor.substring(lastOpen + 2).trim();
            const lastDotPos = partialPath.lastIndexOf('.');
            const contextPath = lastDotPos >= 0 ? partialPath.substring(0, lastDotPos) : '';

            const fullPath = contextPath ? `${contextPath}.${placeholder}` : placeholder;

            const newText =
                textBeforeCursor.substring(0, lastOpen) +
                `{{${fullPath}}}` +
                textAfterCursor;

            setMessageBody(newText);

            setTimeout(() => {
                if (textareaRef.current) {
                    const newCursorPos = lastOpen + fullPath.length + 4;
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }
            }, 0);
        } else {
            // Insert new placeholder at cursor
            const newText =
                textBeforeCursor +
                `{{${placeholder}}}` +
                textAfterCursor;

            setMessageBody(newText);

            setTimeout(() => {
                if (textareaRef.current) {
                    const newCursorPos = cursorPos + placeholder.length + 4;
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }
            }, 0);
        }

        setShowPlaceholderDropdown(false);
    };


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
        console.log('selectedTemplateData', selectedData);

    };

    const handleInputBlur = () => {
        setTimeout(() => setShowDropdown(false), 200);
    };



    return (
        <form className={styles.formContainer}>
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
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="messageBody" className={styles.label}>
                    Message Body
                </label>
                <textarea
                    ref={textareaRef}
                    id="messageBody"
                    value={messageBody}
                    onChange={handleTextareaChange}
                    className={styles.textarea}
                    placeholder={`Enter your message here... Use {{ to insert placeholders\nAvailable placeholders: ${placeholderSuggestions.slice(0, 3).join(', ')}${placeholderSuggestions.length > 3 ? '...' : ''}`}
                    rows={5}
                    required
                    onBlur={() => setTimeout(() => setShowPlaceholderDropdown(false), 200)}
                />

                {showPlaceholderDropdown && (
                    <div
                        className={styles.placeholderDropdownContainer}
                        style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                        }}
                    >
                        <div className={styles.placeholderContext}>
                            {placeholderContext ? `Current path: ${placeholderContext}` : 'Root level'}
                        </div>
                        <ul className={styles.placeholderDropdown}>
                            {placeholderSuggestions.map((path, index) => (
                                <li
                                    key={index}
                                    className={styles.dropdownItem}
                                    onClick={() => insertPlaceholder(path)}
                                >
                                    {path}
                                    {path.includes('[*]') && (
                                        <span className={styles.wildcardBadge}>array wildcard</span>
                                    )}
                                    {path.match(/\[\d+\]/) && (
                                        <span className={styles.indexBadge}>array index</span>
                                    )}
                                </li>
                            ))}
                        </ul>
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
        </form>
    );
};

export default TriggerSearchForm;
