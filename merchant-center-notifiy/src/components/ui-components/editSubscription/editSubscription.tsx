import { useState, useEffect } from "react";
import styles from "./editSubscription.module.css";
import { useAsyncDispatch } from '@commercetools-frontend/sdk';

import { fetchCurrentResourceData } from "../../../repository/fetchResouces.repository";
import { updateMessageBodyHook } from "../../hooks/channel/updateChannel.hooks";

type EditSubscriptionProps = {
    resourceType: string;
    messageBody: string;
    triggerName: string;
    channel: string;
}

const EditSubscription = ({ resourceType, messageBody, channel, triggerName }: EditSubscriptionProps) => {

    const [messageBodyValue, setMessageBody] = useState(messageBody);
    const [resource, setResource] = useState<{ id: string }[]>([]);
    const [selectedResource, setSelectedResource] = useState("");
    const dispatch = useAsyncDispatch();

    const handleResourceDataFetch = async () => {
        try {
            const response = await fetchCurrentResourceData(dispatch, resourceType);
            setResource(response);
            return response;
        } catch (error) {
            console.error("Error fetching resource data:", error);
            throw error;
        }
    };


    const handleSave = async () => {
        try {
            // Correctly structure the payload with the updated message body
            const messageBodyPayload = {
                [triggerName]: messageBodyValue,
            };
            await updateMessageBodyHook(dispatch, channel, messageBodyPayload)
            console.log(messageBodyPayload);

        } catch (error) {
            console.error("Error saving changes:", error);
            throw error;
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Edit Subscription</h2>

            {/* Resource Template Selection */}
            <label htmlFor="resourceType">Choose Resource Template</label>
            <select
                id="resourceType"
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                onFocus={handleResourceDataFetch}
                className={styles.select}
            >
                <option value="">Select a resource...</option>
                {resource.map((res) => (
                    <option key={res.id} value={res.id}>
                        {resourceType}-{res.id}
                    </option>
                ))}
            </select>

            {/* Display Trigger Name */}
            <div className={styles.infoField}>
                <strong>Trigger Name:</strong> {triggerName}
            </div>

            {/* Message Body */}
            <label htmlFor="messageBody">Message Body</label>
            <textarea
                id="messageBody"
                value={messageBodyValue}
                onChange={(e) => setMessageBody(e.target.value)}
                className={styles.textarea}
                placeholder="Enter your message..."
            />

            {/* Save Button */}
            <button onClick={handleSave} className={styles.saveButton}>
                Save
            </button>
        </div>
    );
};

export default EditSubscription;