import { useState, useEffect } from "react";
import componentStyle from './editSubscription.module.css'
import styles from "../createTrigger/TriggerSearchForm.module.css";
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { fetchCurrentResourceData } from "../../../repository/fetchResouces.repository";
import { updateMessageBodyHook } from "../../hooks/channel/updateChannel.hooks";
import MessageBox from "../messageBox/MessageBox";
import PlaceholderSearch from "../placeholderSearch/PlaceholderSearch";

type EditSubscriptionProps = {
    resourceType: string;
    messageBody: string;
    triggerName: string;
    channel: string;
}

const EditSubscription = ({ resourceType, messageBody: initialMessageBody, channel, triggerName }: EditSubscriptionProps) => {
    const [messageBodyValue, setMessageBodyValue] = useState(initialMessageBody);
    const [templateData, setTemplateData] = useState<{ id: string }[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedTemplateData, setSelectedTemplateData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAsyncDispatch();

    // Sync the local state with the prop when it changes
    useEffect(() => {
        setMessageBodyValue(initialMessageBody);
    }, [initialMessageBody]);

    const handleResourceDataFetch = async () => {
        try {
            const response = await fetchCurrentResourceData(dispatch, resourceType);
            setTemplateData(response);
            return response;
        } catch (error) {
            console.error("Error fetching resource data:", error);
            throw error;
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const messageBodyPayload = {
                [triggerName]: messageBodyValue,
            };
            await updateMessageBodyHook(dispatch, channel, messageBodyPayload);
            console.log("Changes saved successfully:", messageBodyPayload);
        } catch (error) {
            console.error("Error saving changes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTemplateSelect = (templateId: string) => {
        const selectedData = templateData.find((item) => item.id === templateId);
        setSelectedTemplate(templateId);
        setSelectedTemplateData(selectedData || {});
    };

    const handlePlaceholderSelect = (placeholder: string) => {
        console.log('Selected placeholder:', placeholder);
        // You might want to insert this placeholder into the message body
        // For example:
        // setMessageBodyValue(prev => `${prev} {{${placeholder}}}`);
    };

    return (
        <div className={styles.formContainer}>
            <div className={componentStyle.headerContainer}>
                <div className={componentStyle.header}>
                    <h3 className={componentStyle.title}>Edit Subscription</h3>
                </div>
                <div className={componentStyle.triggerHeader}>
                    <span className={componentStyle.triggerTitle}>{triggerName}</span>
                </div>
            </div>

            <div className={styles.templateSearchContainer}>
                <br />
                <label htmlFor="templateSelection" className={styles.label}>
                    Choose Template
                </label>
                <select
                    id="templateSelection"
                    value={selectedTemplate}
                    onFocus={handleResourceDataFetch}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className={styles.searchInput}
                >
                    <option value="">Select a template...</option>
                    {templateData.map((res) => (
                        <option key={res.id} value={res.id} className={styles.dropdownItem}>
                            {resourceType}-{res.id}
                        </option>
                    ))}
                </select>
            </div>

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
                        messageBody={messageBodyValue}
                        onMessageChange={setMessageBodyValue}
                    />
                    <br />
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                        className={styles.submitButton}
                        disabled={!messageBodyValue || isLoading}
                    >
                        {isLoading ? (
                            <div className={styles.loadingContainer}>
                                <span className={styles.loadingIndicator}></span>
                                <small>Saving</small>
                            </div>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>)}
        </div>
    );
};

export default EditSubscription;