class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div>
                game_playground
            </div>
        `);
        //this.hide();
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.start();
    }

    start() {

    }

    show() { // 显示playground页面
        this.$playground.show();
    }   

    hide() { // 关闭playground页面
        this.$playground.hide();
    }
}