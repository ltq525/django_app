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
                        退出
                    </div>
                </div>
            </div>
        `);
        this.hide();
        this.root.$game.append(this.$menu);
        /* 找class前用. 找id前用# */
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
            outer.root.playground.show("single mode");
        });
        this.$multi.click(function() {
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function() {
            outer.root.settings.logout_on_remote();
        });
    }
    show() { /* 显示menu页面 */
        this.$menu.show();
    }   

    hide() { /* 关闭menu页面 */
        this.$menu.hide();
    }

}
