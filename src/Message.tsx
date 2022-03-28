import React from "react";
import * as moment from "moment";
import {Theme, Typography} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import {lightBlue} from "@mui/material/colors";
import {makeStyles} from "@mui/styles";

export interface ChatMessageProps {
    subject: string;
    message: string;
    ours: boolean;
    created: string;
    read: string;
}

export function Message(props: ChatMessageProps) {
    const {subject, message, ours, created, read } = props;
    const styles = useStyles(props);
    return (
        <div className={styles.message}>
            {
                subject &&
                <Typography variant="h5" className={styles.subject}>{subject}</Typography>
            }
            <Typography variant="body1" className={styles.text}>{message}</Typography>
            <Typography variant="caption" className={styles.timeStamp}>
                {prettifyDate(created)}
                { ours && read && <CheckIcon className={styles.checkIcon} /> }
            </Typography>
        </div>
    );
}

export function prettifyDate(date: string, format?: string) {
    return moment(date).format(format || 'DD.MM.YYYY HH:mm');
}

function getStyles(props: ChatMessageProps) {
    return props.ours ? {
        textAlign: "right",
        marginTop: '8px',
        marginLeft: 'auto',
        background: lightBlue[100],
        border: '1px solid ' + lightBlue[600],
        borderRadius: "20px 20px 0 20px",
        padding: `5px 8px 5px`
    } : {
        textAlign: "right",
        marginTop: '8px',
        marginRight: 'auto',
        background: "#fff",
        border: '1px solid #aaa',
        borderRadius: "20px 20px 20px 0",
        padding: `10px 8px 5px`
    };
}

function getColour(props: ChatMessageProps) {
    return props.ours ? lightBlue[600] : '#aaa';
}

const useStyles = makeStyles<Theme, ChatMessageProps>(() => ({
    message: getStyles as any,
    subject: {
        fontSize: '1.2em',
        lineHeight: '1.45em',
        fontWeight: 'bold',
        marginBottom: 5
    },
    text: {
        fontSize: '0.85em',
        lineHeight: '1.25em'
    },
    timeStamp: {
        fontSize: '0.75em',
        lineHeight: '1.20em',
        color: getColour,
        fontStyle: 'italic'
    },
    checkIcon: {
        width: '0.5em',
        height: '0.5em',
        marginLeft: '0.3em'
    }
}));
