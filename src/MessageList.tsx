import React, {Fragment, useEffect} from "react";
import {MessageObject} from "./backend";
import {Message} from "./Message";

type MessageListProps = {
    messages: MessageObject[],
    us: string
}

export const MessageList = ({messages, us}: MessageListProps) => {

    useEffect(() => {
        const logs = document.getElementById("variocubeChatLogs");
        if (logs) {
            logs.scrollTop = logs.scrollHeight;
        }
    }, []);

    return (
        <Fragment>
            {messages.map(message => (
                <Message key={message.uuid}
                         subject={message.subject}
                         created={message.created}
                         read={message.read}
                         ours={message.sender == us}
                         message={message.message} />
            ))}
        </Fragment>
    );
}