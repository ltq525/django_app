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
        $(window).resize(function() {
            outer.resize();
        });
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        console.log("resize", this.width, this.height);
        /* 改变窗口后 改变窗口中的相对位置 */
        this.scale = this.height;

        if(this.game_map) this.game_map.resize();

    }

    show() { /* 显示playground页面 */
        this.$playground.show();

        this.resize();
        this.game_map = new GameMap(this);
        this.players = [];
        let scale = this.scale;
        this.players.push(new Player(this, this.width / 2 / scale, this.height / 2 / scale, this.height * 0.05 / scale, "white", this.height * 0.3 / scale, true));
        
        for(let i = 0; i < 8; i ++) {
            this.players.push(new Player(this, this.width / 2 / scale, this.height / 2 / scale, this.height * 0.05 / scale, this.get_random_color(), this.height * 0.3 / scale, false));
        }
    }   

    hide() { /* 关闭playground页面 */
        this.$playground.hide();
    }
}
