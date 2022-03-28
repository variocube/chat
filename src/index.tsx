import React, {useState, useRef, useEffect} from "react";
import {
    Button,
    CircularProgress,
    SnackbarContent,
    TextField
} from "@mui/material";
import {blueGrey} from "@mui/material/colors";
import {makeStyles} from "@mui/styles";
import SendIcon from "@mui/icons-material/Send";
import {MessageList} from "./MessageList";
import {ChatObject, fetchChat, markMessagesRead, postMessage} from "./backend";

const MARK_MESSAGES_READ_TIMEOUT = 5000;

const useStyles = makeStyles({
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

type ChatProps = {
    url: string,
    us: string,
    bearerToken?: string,
    customerToken?: string,
    embedded?: boolean,
}

interface ChatState {
    chat?: ChatObject;
    error?: string;
    message: string;
}

export const Chat = ({url, us, bearerToken, customerToken, embedded}: ChatProps) => {
    const [chat, setChat] = useState<ChatObject>();
    const [error, setError] = useState<string>();
    const [message, setMessage] = useState('');
    const chatLogsRef = useRef<HTMLDivElement>(null);

    let messagesReadTimeout: number|undefined;

    useEffect(() => {
        loadChat().then();

        return () => {
            if (messagesReadTimeout) {
                clearTimeout(messagesReadTimeout);
                messagesReadTimeout = undefined;
            }
        }
    }, []);

    useEffect(() => {
        loadChat().then();
    }, [url, us]);

    const loadChat = async () => {
        setChat(undefined);
        setError(undefined);
        try {
            const chat = await fetchChat(`${url}?us=${us}`, bearerToken, customerToken);
            await markMessagesAsRead(chat);
            setChat(chat);
            scrollToLastMessage();
        } catch (e) {
            setError(`${e}`);
        }
    }

    const markMessagesAsRead = async (chat: ChatObject) => {
        const messageUuids = chat.messages.filter(m => !m.read && m.sender != us).map(m => m.uuid);
        if(messageUuids.length > 0) {
            console.log(`Marking ${messageUuids.length} messages as read in ${MARK_MESSAGES_READ_TIMEOUT} msec.`);
            messagesReadTimeout = setTimeout(() => {
                markMessagesRead(url, us, messageUuids, bearerToken, customerToken);
                messagesReadTimeout = undefined;
            }, MARK_MESSAGES_READ_TIMEOUT);
        }
    }

    const scrollToLastMessage = () => {
        const logs = chatLogsRef.current;
        if (logs) {
            window.requestAnimationFrame(() => {
                console.log('Scrolling animation frame ' + logs.scrollHeight);
                logs.scrollTop = logs.scrollHeight;
            });
        }
    }

    const sendMessage = async () => {
        try {
            const chat = await postMessage(url, us, message, bearerToken, customerToken);
            setMessage('');
            setChat(chat);
            scrollToLastMessage();
        } catch (e) {
            setError(`${e}`);
        }
    }

    const renderContent = () => {
        if (error) {
            return (
                <SnackbarContent
                    message={error}
                    action={<Button color="primary" onClick={loadChat}>Reload</Button>}/>
            );
        } else if (chat) {
            return (
                <MessageList messages={chat.messages} us={us} />
            );
        } else {
            return (
                <CircularProgress/>
            );
        }
    }

    const classes = useStyles();
    return (
        <div className={classes.chat}>
            <div id="variocubeChatLogs"  className={embedded ? classes.chatLogsEmbedded : classes.chatLogs} ref={chatLogsRef}>
                { renderContent() }
            </div>
            <div className={classes.chatInputWrapper}>
                <TextField
                    fullWidth
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className={classes.chatInput}
                    margin="none"
                    onKeyPress={(event) => { if(event.key === 'Enter') { sendMessage().then() }}}
                />
                <Button disabled={!message} color="primary" onClick={sendMessage}><SendIcon className={classes.chatSendIcon}/></Button>
            </div>
        </div>
    )
}