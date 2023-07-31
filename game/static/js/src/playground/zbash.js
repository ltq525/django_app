class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div>
                游戏界面
            </div>
        `);
        this.hide();
        this.root.$game.append(this.$playground);

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