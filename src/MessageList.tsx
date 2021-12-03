import {Component, createElement} from "react";
import {MessageObject} from "./backend";
import {Message} from "./Message";

interface MessageListProps {
    messages: MessageObject[];
    us: string;
}

export class MessageList extends Component<MessageListProps> {

    componentDidMount() {
        const logs = document.getElementById("variocubeChatLogs");
        if (logs) {
            logs.scrollTop = logs.scrollHeight;
        }
    }

    render() {
        const {messages,us} = this.props;

        return messages.map(message => (
            <Message key={message.uuid}
                     subject={message.subject}
                     created={message.created}
                     read={message.read}
                     ours={message.sender == us}
                     message={message.message} />
        ));
    }
}