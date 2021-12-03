const BaseHeaders = {
    'Content-Type': 'application/json'
};

function buildHeaders(bearerToken?: string, customerToken?: string) {
    if(bearerToken) {
        return {
            'Authorization': `Bearer ${bearerToken}`,
            // To avoid the WWW-Authenticate header in the response, that would let the browser open
            // its authentication dialog:
            'X-Requested-With': 'XMLHttpRequest',
            ...BaseHeaders
        };
    } else if(customerToken) {
        return {
            'Authorization': `Basic ${btoa(customerToken + ':')}`,
            // To avoid the WWW-Authenticate header in the response, that would let the browser open
            // its authentication dialog:
            'X-Requested-With': 'XMLHttpRequest',
            ...BaseHeaders
        };
    }
    return BaseHeaders;
}

export async function fetchChat(url: string, bearerToken?: string, customerToken?: string) {
    const response = await window.fetch(url, {
        method: 'get',
        headers: buildHeaders(bearerToken, customerToken)
    });
    if (!response.ok) {
        throw new Error("Could not fetch messages");
    }
    return await response.json() as ChatObject;
}

export async function postMessage(url: string, sender: string, message: string, bearerToken?: string, customerToken?: string): Promise<ChatObject> {
    const response = await window.fetch(url, {
        method: 'post',
        headers: buildHeaders(bearerToken, customerToken),
        body: JSON.stringify({
            sender,
            message
        })
    });
    if (!response.ok) {
        throw new Error("Could not post messages");
    }
    return await response.json() as ChatObject;
}

export async function markMessagesRead(url: string, us: string, messageUuids: string[], bearerToken?: string, customerToken?: string) {
    await window.fetch(url, {
        method: 'put',
        headers: buildHeaders(bearerToken, customerToken),
        body: JSON.stringify({
            us: us,
            messageUuids: messageUuids
        })
    });
}

export interface ChatObject {
    account: string;
    tenant: string;
    created: string;
    uuid: string;
    application: string;
    shop: string;
    messages: MessageObject[];
}

export interface MessageObject {
    uuid: string;
    sender: string;
    created: string;
    read: string;
    subject: string;
    message: string;
    chatUuid: string;
}
