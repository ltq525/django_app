class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game_playground"></div>`);

        this.hide();
        this.root.$game.append(this.$playground);

        this.start();
    }

    get_random_color() {
        let colors = ["LightBLue", "Violet", "pink", "LightPink", "LightGoldenrodYellow", "LightGrey"];
        return colors[Math.floor(Math.random() * 6)];
    }


    start() {
        let outer = this;
        $(window).on('resize', function () {
            outer.resize();
        });
 
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        /* 改变窗口后 改变窗口中的相对位置 */
        this.scale = this.height;

        if (this.game_map) this.game_map.resize();

    }

    show(mode) { /* 显示playground页面 */
        let outer = this;
        this.$playground.show();

        this.resize();
        this.game_map = new GameMap(this);

        this.mode = mode;
        this.state = "waiting"; /* 状态机 waiting -> fighting -> over */
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;

        this.players = [];
        let scale = this.scale;
        this.players.push(new Player(this, this.width / 2 / scale, this.height / 2 / scale, this.height * 0.05 / scale, "white", this.height * 0.3 / scale, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode") {
            for (let i = 0; i < 8; i++) {
                this.players.push(new Player(this, this.width / 2 / scale, this.height / 2 / scale, this.height * 0.05 / scale, this.get_random_color(), this.height * 0.3 / scale, "robot"));
            }
        }
        else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            /* 向后端发送消息 */
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }

    }

    hide() { /* 关闭playground页面 */

        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }

        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }

        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }

        this.$playground.empty();

        this.$playground.hide();
    }
}
