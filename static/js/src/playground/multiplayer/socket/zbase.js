class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app5806.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {

    }

    send_create_player() {

        this.ws.send(JSON.stringify({
            'message': "success",
        }));

    }

    receive_create_player() {

    }
}