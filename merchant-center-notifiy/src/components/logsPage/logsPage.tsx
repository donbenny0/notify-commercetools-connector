
import Spacings from "@commercetools-uikit/spacings";
import Text from "@commercetools-uikit/text";
import { Link as RouterLink, useParams } from "react-router-dom";
import FlatButton from "@commercetools-uikit/flat-button";
import { BackIcon } from "@commercetools-uikit/icons";
import messages from "./messages";
import { useCallback, useEffect, useState } from "react";
import { fetchNotificationsObject } from "../../repository/notifications.repository";
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { LogState } from "../../interfaces/LogState.interface";
import Card from '@commercetools-uikit/card';
import styles from './logsPage.module.css';
import Loader from "../loader";

type TLogsPageProps = {
    linkToNotifications: string;
};

const LogsPage = ({ linkToNotifications }: TLogsPageProps) => {
    const dispatch = useAsyncDispatch();
    const [logStatestate, setLogStatestate] = useState<LogState>({});
    const [loadingstate, setLoadingstate] = useState(true);
    const { id } = useParams<{ id: string }>();

    const loadNotificationsLog = useCallback(async () => {
        try {
            setLoadingstate(true);
            const results: LogState = await fetchNotificationsObject(dispatch, id);
            setLogStatestate(results);
            setLoadingstate(false);

        } catch (error) {
            setLoadingstate(false);
            console.error('Failed to load notifications:', error);
            setLogStatestate({});
        } finally {
        }
    }, [dispatch, id]);
    useEffect(() => {
        loadNotificationsLog();
    }, [loadNotificationsLog]);

    if (loadingstate) {
        return (
            <div className={styles.loadingContainer}>
                <Loader />
            </div>
        );
    }

    return (
        <Spacings.Stack scale="xl">
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
            <div className={styles.logContainer}>
                <div className={`${styles.statusContainer} ${styles[`status${logStatestate.value?.logs?.statusCode}`]}`}>
                    <span>{logStatestate.value?.logs?.statusCode}</span>
                </div>
                <Card theme="dark" type="raised">
                    <div className={styles.messageAndTime}>
                        <h6>Message</h6>
                        <span>{logStatestate.createdAt ? new Date(logStatestate.createdAt).toLocaleDateString('en-US', { weekday: 'long' }) : ''}, {logStatestate.createdAt ? new Date(logStatestate.createdAt).toLocaleString() : ''}</span>
                    </div>
<br />
                    <code>{logStatestate.value?.logs?.message}</code>

                </Card>
            </div>
        </Spacings.Stack >
    )
}

export default LogsPage
