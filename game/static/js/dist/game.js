class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
            <div class = "game_menu">
                <div class = "game_menu_field">
                    <!---空格隔开 索引多个class--->
                    <div class = "game_menu_field_item single">
                        单人模式
                    </div>
                    <br>
                    <div class = "game_menu_field_item multi">
                        多人模式
                    </div>
                    <br>
                    <div class = "game_menu_field_item settings">
                        设置
                    </div>
                </div>
            </div>
        `);
        this.root.$game.append(this.$menu);
        //找class前用. 找id前用#
        this.$single = this.$menu.find('.single');
        this.$multi = this.$menu.find('.multi');
        this.$settings = this.$menu.find('.settings');

        this.start();
    }
    start() {
        this.add_listening_events();
    }
    add_listening_events() {
        let outer = this;
        this.$single.click(function() {
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi.click(function() {
            console.log("2")
        });
        this.$settings.click(function() {
            console.log("3")
        });
    }
    show() { // 显示menu页面
        this.$menu.show();
    }   

    hide() { // 关闭menu页面
        this.$menu.hide();
    }

}class GamePlayground {
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
}class Game{
    constructor(id){
        this.id = id;
        this.$game = $('#' + id);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }
    start() {

    }
}