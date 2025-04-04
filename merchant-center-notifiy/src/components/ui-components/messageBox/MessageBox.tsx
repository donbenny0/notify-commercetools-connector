import { useState, useRef, useEffect } from 'react';
import styles from './MessageBox.module.css';
import { flattenObject } from '../../../utils/messageTemplate.utils';

interface MessageBoxProps {
    selectedTemplateData: any;
    messageBody: string;
    onMessageChange: (value: string) => void;
}

const MessageBox = ({ selectedTemplateData, messageBody, onMessageChange }: MessageBoxProps) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
    const [currentContext, setCurrentContext] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Flatten the template data for suggestions
    useEffect(() => {
        if (selectedTemplateData && Object.keys(selectedTemplateData).length > 0) {
            const paths = flattenObject(selectedTemplateData);
            setSuggestions(paths);
        }
    }, [selectedTemplateData]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        onMessageChange(value);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastOpen = textBeforeCursor.lastIndexOf('{{');
        const lastClose = textBeforeCursor.lastIndexOf('}}');

        if (lastOpen > lastClose) {
            const currentPlaceholder = textBeforeCursor.substring(lastOpen + 2).trim();
            setCurrentContext(currentPlaceholder);

            const lastDotPos = currentPlaceholder.lastIndexOf('.');
            const searchTerm = lastDotPos >= 0
                ? currentPlaceholder.substring(lastDotPos + 1)
                : currentPlaceholder;

            const contextPath = lastDotPos >= 0
                ? currentPlaceholder.substring(0, lastDotPos)
                : '';

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
                : suggestions.filter(path =>
                    path.toLowerCase().includes(currentPlaceholder.toLowerCase())
                );

            if (matchingSuggestions.length > 0 && textareaRef.current) {
                const textarea = textareaRef.current;
                const lines = textBeforeCursor.split('\n');
                const currentLine = lines[lines.length - 1];

                // Calculate position right after the opening {{
                const top = textarea.offsetTop + (lines.length * 20) + 30;
                const left = textarea.offsetLeft + (lastOpen * 8) + 16;

                setSuggestionPosition({ top, left });
                setSuggestions(matchingSuggestions);
                setShowSuggestions(true);
                setActiveSuggestion(0);
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
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
            const partialPath = textBeforeCursor.substring(lastOpen + 2).trim();
            const lastDotPos = partialPath.lastIndexOf('.');
            const contextPath = lastDotPos >= 0 ? partialPath.substring(0, lastDotPos) : '';

            const fullPath = contextPath ? `${contextPath}.${placeholder}` : placeholder;

            const newText =
                textBeforeCursor.substring(0, lastOpen) +
                `{{${fullPath}}}` +
                textAfterCursor;

            onMessageChange(newText);

            setTimeout(() => {
                if (textareaRef.current) {
                    const newCursorPos = lastOpen + fullPath.length + 4;
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }
            }, 0);
        }

        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                insertPlaceholder(suggestions[activeSuggestion]);
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        }
    };
    return (
        <div className={styles.messageBoxContainer}>
            <label className={styles.label}>Message Template</label>
            <div className={styles.editorContainer}>
                <textarea
                    ref={textareaRef}
                    value={messageBody}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    className={styles.editor}
                    placeholder="Type your message here. Use {{ to insert variables..."
                    rows={8}
                    spellCheck={false}
                />

                {showSuggestions && (
                    <div
                        className={styles.suggestionsMenu}
                        style={{
                            top: `${suggestionPosition.top}px`,
                            left: `${suggestionPosition.left}px`,
                        }}
                    >
                        <div className={styles.suggestionsHeader}>
                            <span>Available Variables</span>
                            {currentContext && (
                                <span className={styles.contextBadge}>{currentContext}</span>
                            )}
                        </div>
                        <ul className={styles.suggestionsList}>
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className={`${styles.suggestionItem} ${index === activeSuggestion ? styles.active : ''}`}
                                    onClick={() => insertPlaceholder(suggestion)}
                                >
                                    <span className={styles.suggestionText}>{suggestion}</span>
                                    {suggestion.includes('[*]') && (
                                        <span className={styles.arrayBadge}>array</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBox;