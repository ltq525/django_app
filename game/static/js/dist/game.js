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
            outer.root.playground.show();
        });
        this.$multi.click(function() {
            console.log("2")
        });
        this.$settings.click(function() {
            console.log("3")
        });
    }
    show() { /* 显示menu页面 */
        this.$menu.show();
    }   

    hide() { /* 关闭menu页面 */
        this.$menu.hide();
    }

}
let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        
        GAME_OBJECTS.push(this);
        this.has_called_start = false; /* 处理start函数只执行一次 */
        this.timedelta = 0; /* 当前帧距离上一帧的时间间隔 */
    }

    start() { /* 只会在第一帧执行 */

    }

    update() { /* 每一帧都执行 */

    }

    on_destroy() { /* 删除前执行 */

    }

    destroy() { /* 删除该物体 */
        this.on_destroy();

        for(let i = 0; i < GAME_OBJECTS.length; i ++)
        {
            if (GAME_OBJECTS[i] === this) /* 三等号 需类型和值同时相等 */
            {
                GAME_OBJECTS.splice(i, 1); /* 删除函数 */
                break;
            }
        }

    } 
}

/* 利用时间计算 避免不同网页帧数不同的情况 */
let last_timestamp;
let GAME_ANIMATION = function(timestamp) {

    for(let i = 0; i < GAME_OBJECTS.length; i ++)
    {
        let obj = GAME_OBJECTS[i];
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

requestAnimationFrame(GAME_ANIMATION); /* 帧数刷新60hz */

class GameMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`); /* 画布 */
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() { 

    }

    update() { 
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; /* 第四个参数为背景透明度 */
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Particle extends GameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 0.1;
    }

    start() {

    }
    update() {

        if (this.move_length < this.eps || this.speed < 1) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

class Player extends GameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;

        /* 速度矢量 */
        this.vx = 0;
        this.vy = 0;

        /* 受攻击后的速度矢量 */
        this.damage_x = 0;
        this.damage_y = 0;

        this.damage_speed = 0;
        /* 速度摩擦力 */
        this.friction = 0.9;

        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1; /* 精度 */
        this.spent_time = 0;


        this.cur_skill = null; /* 选择的技能 */

    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        }
        else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        /* 取消鼠标右键菜单 */
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            /* 左键1 滚轮2 右键3 */
            if (e.which === 3) {
                outer.move_to(e.clientX, e.clientY); /* 鼠标坐标的API */
            }
            else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX, e.clientY);
                }

                outer.cur_skill = null; /* 释放后清空技能 */
            }
        });

        $(window).keydown(function (e) {
            /* 这里查询keycode码设置技能按键 */
            if (e.which === 81) { /* q键 */
                outer.cur_skill = "fireball";
                return false;
            }

        });

    }

    shoot_fireball(tx, ty) {

        //console.log(tx, ty);
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x); /* 反正切函数获得偏移角度 */
        let vx = Math.cos(angle), vy = Math.sin(angle);

        let color = "orange";
        let speed = this.playground.height * 0.8;

        let move_length = this.playground.height * 2;
        this.playground.skills.push(new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01));
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        //console.log(tx, ty);
        this.move_length = this.get_dist(this.x, this.y, tx, ty); /* 需要移动的距离 */
        let angle = Math.atan2(ty - this.y, tx - this.x); /* 反正切函数获得偏移角度 */

        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 20 + Math.random() * 5; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if(!this.is_me && this.spent_time > 3 && Math.random() < 1 / 180.0) {
            let player = this.playground.players[0];

            /* 火球攻击预判0.3秒后的位置 */
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;

            this.shoot_fireball(player.x, player.y);
        }

        if (this.damage_speed > 50) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            let moved = this.damage_speed * this.timedelta / 1000; /* 计算每一帧移动的距离 */
            this.x += this.damage_x * moved;
            this.y += this.damage_y * moved;
            this.damage_speed *= this.friction;
        }
        else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            }
            else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); /* 计算每一帧移动的距离 */
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() {

        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        for(let i = 0; i < this.playground.players.length; i ++) {
            if(this.playground.players[i] == this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }


    }
}
class FireBall extends GameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;

    }

    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); /* 速度*两帧间的时间=移动距离 timedalta单位为毫秒 */
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for(let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }


        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(obj) {
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        if(distance < this.radius + obj.radius)
            return true;
        return false;
    }   

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage); /* 此处可用动能方程优化 */
        this.destroy();

    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game_playground"></div>`);
        //this.hide();
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.skills = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.3, true));
        
        for(let i = 0; i < 8; i ++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
        
        this.start();
    }

    get_random_color() {
        let colors = ["LightBLue", "Violet", "pink", "LightPink", "LightGoldenrodYellow", "LightGrey"];
        return colors[Math.floor(Math.random() * 6)];
    }


    start() {

    }

    show() { /* 显示playground页面 */
        this.$playground.show();
    }   

    hide() { /* 关闭playground页面 */
        this.$playground.hide();
    }
}
export class Game{
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
