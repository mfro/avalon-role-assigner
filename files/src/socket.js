let ws;
let events = {};
let listening = {};

export function on(key, callback) {
    events[key] = events[key] || [];
    events[key].push(callback);

    ws && ws.addEventListener(key, callback);
}

export function listen(key, callback) {
    listening[key] = listening[key] || [];
    listening[key].push(callback);
}

export function close() {
    ws.close();
}

export function create(name, onError) {
    let base = SERVICE_URL;
    let url = SERVICE_URL.replace('http', 'ws');

    ws = new WebSocket(url + '/socket?name=' + name, 'protocolTwo');
    window.ws = ws;
    for (let key in events) {
        for (let callback of events[key]) {
            ws.addEventListener(key, callback);
        }
        delete events[key];
    }

    ws.addEventListener('message', e => {
        let msg = JSON.parse(e.data);

        let list = listening[msg.type];
        if (!list) return;

        for (let callback of list) {
            callback(msg.body);
        }
    });

    ws.addEventListener('error', e => {
        onError(e);
    });
}

export function send(type, body) {
    ws.send(JSON.stringify({
        type: type,
        body: body
    }));
}