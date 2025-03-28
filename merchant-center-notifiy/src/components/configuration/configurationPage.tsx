import React, { useEffect, useState } from 'react'
import { fetchAllChannelsHook } from '../hooks/channel/fetchChannel.hooks';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';

type TLogsPageProps = {
    linkToNotifications: string;
};

type ChannelConfiguration = {
    isEnabled: boolean;
    messageBody: {
        OrderCreated: string;
        OrderUpdated: string;
    }
};

const ChannelIcons = {
    whatsapp: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
        </svg>
    ),
    email: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
        </svg>
    ),
    sms: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.132 1.563.2 2.417.2 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.1.55.55.88 1.302.88 2.092v.019c0 .458.137.92.405 1.308l.219.291Z" clipRule="evenodd" />
        </svg>
    )
};

const ConfigurationPage = ({ linkToNotifications }: TLogsPageProps) => {
    const dispatch = useAsyncDispatch();
    const [channels, setChannels] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const responseChannels = await fetchAllChannelsHook(dispatch);
                setChannels(responseChannels.value);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch channels', error);
                setLoading(false);
            }
        };
        fetchChannels();
    }, [dispatch]);

    const renderChannelCard = (channelName: string, config: ChannelConfiguration) => {
        const ChannelIcon = ChannelIcons[channelName as keyof typeof ChannelIcons] || (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-1.06-1.06c1.523-1.465 3.97-1.465 5.494 0 1.46 1.406 1.46 3.684 0 5.09a3.576 3.576 0 0 1-.373.334.75.75 0 0 1-.94-1.18c.278-.224.5-.495.56-.679a2.081 2.081 0 0 0-.419-2.313ZM12 12.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" clipRule="evenodd" />
            </svg>
        );

        return (
            <div
                key={channelName}
                className={`
                    bg-white rounded-lg shadow-md p-6 
                    ${config.isEnabled ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}
                `}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div
                            className={`
                                ${config.isEnabled ? 'text-green-600' : 'text-gray-400'}
                            `}
                        >
                            {ChannelIcon}
                        </div>
                        <h2 className="text-xl font-semibold capitalize">
                            {channelName} Channel
                        </h2>
                    </div>
                    <span
                        className={`
                            px-3 py-1 rounded-full text-sm font-medium
                            ${config.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        `}
                    >
                        {config.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Order Created Message</h3>
                        <p className="text-gray-800">{config.messageBody.OrderCreated}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Order Updated Message</h3>
                        <p className="text-gray-800">{config.messageBody.OrderUpdated}</p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse text-gray-400 w-12 h-12">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                </svg>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Notification Channels</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(channels).map(([channelName, config]) =>
                    renderChannelCard(channelName, config.configurations)
                )}
            </div>
        </div>
    )
}

export default ConfigurationPage;