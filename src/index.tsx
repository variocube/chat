import {createElement, Component, RefObject, createRef} from "react";
import {
    Button,
    CircularProgress,
    SnackbarContent,
    TextField,
    WithStyles,
    withStyles,
    createStyles,
    Theme
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import {ChatObject, fetchChat, markMessagesRead, postMessage} from "./backend";
import {MessageList} from "./MessageList";
import {blueGrey} from "@material-ui/core/colors";

const MARK_MESSAGES_READ_TIMEOUT = 5000;

export interface ChatProps extends WithStyles<any> {
    url: string;
    us: string;
    bearerToken?: string;
    customerToken?: string;
    className?: string;
    embedded?: boolean;
}

interface ChatState {
    chat?: ChatObject;
    error?: string;
    message: string;
}

class Chat extends Component<ChatProps, ChatState> {

    private messagesReadTimeout?: number;
    private readonly chatLogsRef: RefObject<HTMLDivElement>;

    constructor(props: ChatProps) {
        super(props);
        this.chatLogsRef = createRef();
        this.state = {
            message: ''
        };
    }

    async componentDidMount() {
        await this.loadChat();
    }

    async componentDidUpdate(prevProps: Readonly<ChatProps>, prevState: Readonly<ChatState>, snapshot?: any) {
        if(prevProps.url != this.props.url) {
            await this.loadChat();
        }
    }

    componentWillUnmount(): void {
        if(this.messagesReadTimeout) {
            clearTimeout(this.messagesReadTimeout);
            this.messagesReadTimeout = undefined;
        }
    }

    render() {
        const {message} = this.state;
        const styles = this.props.classes;
        return (
            <div className={styles.chat}>
                <div className={this.props.embedded ? styles.chatLogsEmbedded : styles.chatLogs} id="variocubeChatLogs" ref={this.chatLogsRef}>
                    {
                        this.renderContent()
                    }
                </div>
                <div className={styles.chatInputWrapper}>
                    <TextField
                        fullWidth
                        value={message}
                        onChange={(event) => this.setState({ message: event.target.value })}
                        className={styles.chatInput}
                        margin="none"
                        onKeyPress={(event) => { if(event.key === 'Enter') { this.sendMessage(); } } }
                    />
                    <Button disabled={!this.state.message} color="primary" onClick={this.sendMessage.bind(this)}><SendIcon className={styles.chatSendIcon}/></Button>
                </div>
            </div>
        );
    }

    private renderContent() {
        const {chat, error} = this.state;
        const {us} = this.props;

        if (error) {
            return (
                <SnackbarContent
                    message={error}
                    action={<Button color="primary" onClick={this.loadChat}>Reload</Button>}/>
            );
        }
        else if (chat) {
            return (
                <MessageList messages={chat.messages} us={us} />
            );
        }
        else {
            return (
                <CircularProgress/>
            );
        }
    }

    private scrollToLastMessage() {
        const logs = this.chatLogsRef.current;
        if(logs) {
            window.requestAnimationFrame(() => {
                console.log('Scrolling animation frame ' + logs.scrollHeight);
                logs.scrollTop = logs.scrollHeight;
            });
        }
    }

    private async sendMessage() {
        try {
            const { bearerToken, customerToken } = this.props;
            const chat = await postMessage(this.props.url, this.props.us, this.state.message, bearerToken, customerToken);
            this.setState({
                message: '',
                chat: chat
            });
            this.scrollToLastMessage();
        } catch (ex) {
            return this.setState({
                error: `${ex}`
            });
        }
    }

    private loadChat = async () => {
        try {
            const url = `${this.props.url}?us=${this.props.us}`;
            const { bearerToken, customerToken } = this.props;

            const chat = await fetchChat(url, bearerToken, customerToken);
            await this.markMessagesAsRead(chat);
            this.setState({chat, error: undefined});
            this.scrollToLastMessage();
        } catch (e) {
            this.setState({chat: undefined, error: `${e}`});
        }
    };

    private async markMessagesAsRead(chat: ChatObject) {
        const us = this.props.us;
        const url = this.props.url;
        const { bearerToken, customerToken } = this.props;
        const messageUuids = chat.messages.filter(m => !m.read && m.sender != us).map(m => m.uuid);
        if(messageUuids.length > 0) {
            console.log(`Marking ${messageUuids.length} messages as read in ${MARK_MESSAGES_READ_TIMEOUT} msec.`);
            this.messagesReadTimeout = setTimeout(() => {
                markMessagesRead(url, us, messageUuids, bearerToken, customerToken);
                this.messagesReadTimeout = undefined;
            }, MARK_MESSAGES_READ_TIMEOUT);
        }
    }

}

const useStyles = (theme: Theme) => createStyles ({
    chat: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
    },
    chatLogs: {
        marginTop: 'auto',
        display: 'flex',
        alignContent: 'flex-end',
        flexDirection: 'column',
        padding: `8px`,
        marginBottom: `80px`,
        overflowY: 'scroll',
        overflowX: 'hidden',
    },
    chatLogsEmbedded: {
        marginTop: 'auto',
        display: 'flex',
        alignContent: 'flex-end',
        flexDirection: 'column',
        padding: `8px`,
        marginBottom: `80px`,
        minHeight: '25vh',
        maxHeight: '50vh',
        overflowY: 'scroll',
        overflowX: 'hidden',
    },
    chatInputWrapper: {
        padding: `8px`,
        background: '#FFF',
        width: '100%',
        display: 'flex',
        position: 'absolute',
        bottom: '0',
        boxShadow: '0 0 15px ' + blueGrey[100],
    },
    chatInput: {
        flexGrow: 2
    },
    chatSendIcon: {
        fontSize: '2.5em',
        lineHeight: '1em'
    }
});

export default withStyles(useStyles)(Chat);
