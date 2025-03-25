import Spacings from "@commercetools-uikit/spacings";
import Text from "@commercetools-uikit/text";
import { Link as RouterLink } from "react-router-dom";
import Link from '@commercetools-uikit/link';

import FlatButton from "@commercetools-uikit/flat-button";
import { BackIcon, InformationIcon, EyeIcon, EyeCrossedIcon } from "@commercetools-uikit/icons";
import MultilineTextField from '@commercetools-uikit/multiline-text-field';
import messages from "./messages";
import { useCallback, useEffect, useState } from "react";
import styles from './settings.module.css';
import Card from '@commercetools-uikit/card';
import whatsappSvg from './whatsapp.svg';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { fetchMessageBodyObject, fetchOrders, updateMessageBodyObject } from "../../repository/messages.repository";
import Loader from "../loader";
import { validateTemplate } from "../../utils/messageBody.utils";
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useIntl } from 'react-intl';
import SelectField from "@commercetools-uikit/select-field";
import { generateMessage } from "../../utils/messageTemplate.utils";
import ViewSwitcher from '@commercetools-uikit/view-switcher';
type TEditMessagesProps = {
    linkToNotifications: string;
};

const EditMessages = ({ linkToNotifications }: TEditMessagesProps) => {
    const [selectedMethod, setSelectedMethod] = useState("whatsapp");
    const [editedMessage, setEditedMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [showPreview, setPreview] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [renderedMessage, setRenderedMessage] = useState('');
    const [seletedValue, setSelectedValue] = useState('edit-template');

    const dispatch = useAsyncDispatch();
    const intl = useIntl();
    const showNotification = useShowNotification();

    const loadMessages = useCallback(async () => {
        try {
            const results = await fetchMessageBodyObject(dispatch);
            if (!hasLoaded) {
                const selectedMsg = results.find(
                    msg => msg.value.channel.toLowerCase() === selectedMethod.toLowerCase()
                );
                setEditedMessage(selectedMsg?.value.message || "");
                setHasLoaded(true);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, selectedMethod, hasLoaded]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const handleTemplateChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newMessage = event.target.value;
        setEditedMessage(newMessage);
        const errors = validateTemplate(newMessage);
        setValidationErrors(errors);
    };

    const handleSave = async () => {
        setPreview(false)
        setShowNotes(false)
        setRenderedMessage('')
        setIsSaving(true);

        const key = selectedMethod === "whatsapp" ? "msg-body-key-constant-whatsapp" : "msg-body-key-constant-other-channel";
        try {
            await updateMessageBodyObject(dispatch, {
                container: "messageBody",
                key: key,
                value: {
                    channel: selectedMethod,
                    message: editedMessage,
                },
            });
            loadMessages();
            showNotification({
                kind: 'success',
                domain: 'side',
                text: intl.formatMessage({ id: 'message.save.success', defaultMessage: "Message saved successfully!" }),
            });
        } catch (error) {
            showNotification({
                kind: 'error',
                domain: 'side',
                text: intl.formatMessage({ id: 'message.save.error', defaultMessage: "Something went wrong!" }),
            });
            console.error('Error saving message:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNotes = (showNotes: boolean) => {
        setPreview(false)
        setShowNotes(showNotes)
    }
    const handlePreview = async (preview: boolean) => {
        setShowNotes(false)
        setPreview(preview)
        if (preview) {
            const response = await fetchOrders(dispatch);
            setOrders(response);
        }
    }



    const handlePreviewRender = (data: object[], template: string, orderId: string) => {
        const selectedOrder = data.find((item: any) => item.id === orderId);
        if (!selectedOrder) {
            return null;
        }
        const message = generateMessage(selectedOrder, template);
        setRenderedMessage(message)
        return message;
    }

    return (
        <Spacings.Stack scale="xl">
            {isLoading ? (
                <div className={styles.loadingContainer}><Loader /></div>
            ) : (
                <>
                    <Spacings.Stack scale="xs">
                        <FlatButton
                            as={RouterLink}
                            to={linkToNotifications}
                            label="Go to notifications"
                            icon={<BackIcon />}
                        />
                        <Text.Headline as="h1" intlMessage={messages.title} />
                        <Text.Subheadline as="h5" intlMessage={messages.subtitle} />
                    </Spacings.Stack>

                    <ViewSwitcher.Group
                        selectedValue={seletedValue}
                        onChange={setSelectedValue}
                    >
                        <ViewSwitcher.Button  isDisabled={seletedValue === 'edit-template'} value="edit-template">
                            Edit Template
                        </ViewSwitcher.Button>
                    </ViewSwitcher.Group>

                    {seletedValue === 'edit-template' && (
                        <Spacings.Stack scale="s">
                            <Card theme="light" type="raised">
                                <div className={styles.actionButtons}>
                                    <div>
                                        <button
                                            onClick={() => setSelectedMethod("whatsapp")}
                                            className={selectedMethod === "whatsapp" ? styles.active : ""}>
                                            <img alt="web developer" src={whatsappSvg} />
                                            <span>WhatsApp</span>
                                        </button>
                                    </div>

                                    <div className={styles.rightSideButtons}>
                                        <FlatButton icon={<InformationIcon />} onClick={() => handleNotes(!showNotes)} label="Show guidelines" />
                                        {editedMessage === '' ? (<></>) : (<FlatButton icon={showPreview ? <EyeCrossedIcon /> : <EyeIcon />} onClick={() => handlePreview(!showPreview)} label={showPreview ? 'Hide preview' : 'Preview'} />)}
                                    </div>
                                </div>

                                {showNotes && (
                                    <Card theme="light" type="raised" className={styles.noteContainer}>
                                        <h4>Note :</h4>
                                        <ul style={{ lineHeight: '1.5' }}>
                                            <li><b>{process.env.MC_APP_ENV_PROJECT_ID}</b>: Ensure all placeholders are populated with valid data from the <Link isExternal={true} to={"https://docs.commercetools.com/api/projects/orders#order"}>order</Link> response to avoid incomplete messages. </li>
                                            <li><b>Character Limits</b>: Consider WhatsApp's character limits (4096 characters for messages) to prevent truncation.</li>
                                            <li><b>Dynamic Data</b>: Ensure the order object has necessary attributes (e.g., shippingAddress, id, totalPrice) populated before generating the message.</li>
                                            <li><b>Supported resource</b>: Currently, this application supports only the order resource. Please refer <Link isExternal={true} to={"https://docs.commercetools.com/api/projects/orders#order"}>CommerceTools official documentation</Link> for order resource and its attributes for more details.</li>
                                        </ul>
                                    </Card>
                                )}

                                {showPreview && (
                                    <Card theme="light" type="raised" className={styles.noteContainer}>
                                        <SelectField
                                            title="Select your order"
                                            name="order-select"
                                            value={{
                                                label: 'Default Template',
                                                value: 'default'
                                            }}
                                            options={orders.map(order => ({
                                                label: order.lineItems.map((item: any) => item.variant.sku).join(', '),
                                                value: order.id
                                            }))}
                                            onChange={(event) => {
                                                // Handle template selection
                                                handlePreviewRender(orders, editedMessage, event.target.value as string)
                                            }}
                                        />
                                        {renderedMessage !== '' ? (
                                            <div className={styles.previewContainer}>
                                                <h4>Preview :</h4>
                                                <br />
                                                <p dangerouslySetInnerHTML={{ __html: renderedMessage.replace(/\n/g, '<br />') }}></p>
                                            </div>

                                        ) : null}
                                    </Card>
                                )}

                                <div className={styles.messageArea}>
                                    <MultilineTextField
                                        title="Message body"
                                        placeholder="What's your message body"
                                        value={editedMessage}
                                        onFocus={() => {
                                            setPreview(false)
                                            setRenderedMessage('')
                                        }}
                                        defaultExpandMultilineText={true}

                                        onChange={handleTemplateChange}
                                        id="messageBodyTextarea"
                                    />
                                    {validationErrors.length > 0 && (
                                        <div className={styles.validationErrors}>
                                            <ul>
                                                {validationErrors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardFooter}>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || validationErrors.length > 0}
                                    >
                                        {isSaving ? <div className={styles.loader}></div> : 'Save changes'}
                                    </button>
                                </div>
                            </Card>
                        </Spacings.Stack>
                    )}
                </>
            )}
        </Spacings.Stack>
    );
};

export default EditMessages;

