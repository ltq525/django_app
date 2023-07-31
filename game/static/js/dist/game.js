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

}let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.has_called_start = false; // 处理start函数只执行一次
        this.timedelta = 0; // 当前帧距离上一帧的时间间隔
    }

    start() { // 只会在第一帧执行

    }

    update() { // 每一帧都执行

    }

    on_destory() { // 删除前执行

    }

    destory() { // 删除该物体
        this.on_destory();

        for(let i = 0; i < GAME_OBJECTS.length; i ++)
        {
            if (GAME_OBJECTS[i] === this) // 三等号 需类型和值同时相等
            {
                GAME_OBJECTS.splice(i, 1); // 删除函数
                break;
            }
        }

    } 
}

// 利用时间计算 避免不同网页帧数不同的情况
let last_timestamp;
let GAME_ANIMATION = function(timestamp) {

    for(let i = 0; i < GAME_ANIMATION.length; i ++)
    {
        let obj = GAME_ANIMATION[i];
        if(!obj.has_called_start)
        {
            obj.start();
            obj.has_called_start = true;
        }
        else 
        {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(GAME_ANIMATION);
}

requestAnimationFrame(GAME_ANIMATION); // 帧数刷新class GamePlayground {
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
}export class Game{
    constructor(id){
        this.id = id;
        this.$game = $('#' + id);
        //this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }
    start() {

    }
}