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
let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        
        GAME_OBJECTS.push(this);
        this.has_called_start = false; /* 处理start函数只执行一次 */
        this.timedelta = 0; /* 当前帧距离上一帧的时间间隔 */
        this.uuid = this.create_uuid();
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
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

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)"; /* resize时将背景透明度设为1 即不透明状态 */
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() { 
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; /* 第四个参数为背景透明度 */
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class NoticeBoard extends GameObject {
    constructor(playground) {
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪: 0人";

    }

    start() {

    }

    write(text) {
        this.text = text;
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
    }

}class Particle extends GameObject {
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
        this.eps = 0.01;
    }

    start() {

    }
    update() {
        let scale = this.playground.scale;
        if (this.move_length < this.eps || this.speed < 50 / scale) {
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

class Player extends GameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
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
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01; /* 精度 */
        this.spent_time = 0;
        this.fireballs = [];


        this.cur_skill = null; /* 选择的技能 */

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_coldtime = 3;
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png"
            
            this.blink_coldtime = 3;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        
        }

    }

    start() {
        this.playground.player_count++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if (this.playground.player_count >= 2) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if (this.character === "me") {
            this.add_listening_events();
        }
        else if (this.character === "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
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
            if (outer.playground.state !== "fighting")
                return false;

            let scale = outer.playground.scale;
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (outer.playground.players[0].character === "robot") return false;
            /* 左键1 滚轮2 右键3 */
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / scale, ty = (e.clientY - rect.top) / scale;
                outer.move_to(tx, ty); /* 鼠标坐标的API */
                if (outer.playground.mode == "multi mode")
                    outer.playground.mps.send_move_to(tx, ty);
            }
            else if (e.which === 1) {

                let tx = (e.clientX - rect.left) / scale;
                let ty = (e.clientY - rect.top) / scale;
                if (outer.cur_skill === "fireball") {
                    let fireball = outer.shoot_fireball(tx, ty);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                }
                else if (outer.cur_skill === "blink") {
                    if (outer.blink_coldtime > outer.eps)
                        return false;
                    outer.blink(tx, ty);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                    
                }

                outer.cur_skill = null; /* 释放后清空技能 */
            }
        });

        $(window).keydown(function (e) {
            /* 返回ture避免按键失效 */
            if (outer.playground.state !== "fighting")
                return true;



            /* 这里查询keycode码设置技能按键 */
            if (e.which === 81) { /* q键 */
                if (outer.fireball_coldtime > outer.eps)
                    return true;
                outer.cur_skill = "fireball";
                return false;
            } 
            else if (e.which === 70) { /* f键 */
                if (outer.blink_coldtime > outer.eps)
                    return true;
                outer.cur_skill = "blink";
                return false;
            }
    
        });

    }

    shoot_fireball(tx, ty) {
        let scale = this.playground.scale;

        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01 / scale;
        let angle = Math.atan2(ty - this.y, tx - this.x); /* 反正切函数获得偏移角度 */
        let vx = Math.cos(angle), vy = Math.sin(angle);

        let color = "LightBLue";
        let speed = this.playground.height * 0.8 / scale;

        let move_length = Math.max(this.playground.width, this.playground.height) / scale;
        let damage = this.playground.height * 0.01 / scale;

        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;

        return fireball;
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid == uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);
        this.blink_coldtime = 3;
        this.move_length = 0; /* 闪现后停止移动 */
    }

    move_to(tx, ty) {

        this.move_length = this.get_dist(this.x, this.y, tx, ty); /* 需要移动的距离 */
        let angle = Math.atan2(ty - this.y, tx - this.x); /* 反正切函数获得偏移角度 */

        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        let scale = this.playground.scale;
        for (let i = 0; i < 20 + Math.random() * 5; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 5;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        /* 打四下消失 */
        if (this.radius < 0.02) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if (this.character === "me" && this.playground.state === "fighting")
            this.update_coldtime();
        this.update_move();
        this.render();
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    update_move() {
        let scale = this.playground.scale;

        if (this.character === "robot" && this.spent_time > 3 && Math.random() < 1 / 180.0) {
            let player = this.playground.players[0];

            /* 火球攻击预判0.3秒后的位置 */
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;

            this.shoot_fireball(player.x, player.y);
        }

        if (this.damage_speed > 80 / scale) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            let moved = this.damage_speed * this.timedelta / 1000; /* 计算每一帧移动的距离 */
            this.x += this.damage_x * moved;
            this.y += this.damage_y * moved;
            this.damage_speed *= this.friction;
        }
        else {
            /* 移动距离的精准度 */
            if (this.move_length < 0.00001) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / scale;
                    let ty = Math.random() * this.playground.height / scale;
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
    }

    render() {
        let scale = this.playground.scale;
        /* 画图 */
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            /* 画圆 */
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            /* 放图片 */
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        }
        /* 画颜色 */
        else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.character === "me" && this.playground.state === "fighting")
            this.render_skill_coldyime();
    }

    render_skill_coldyime() {
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;

        /* 火球 */
        this.ctx.save();
        this.ctx.beginPath();
        /* 画圆 */
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        /* 放图片 */
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        /* 闪现 */
        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        /* 画圆 */
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        /* 放图片 */
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

    }

    on_destroy() {
        if(this.character === "me")
        {
            this.playground.state = "over";
            this.playground.notice_board.write("over");
        }

        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] == this) {
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
        this.eps = 0.01;

    }

    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        this.update_move();

        if(this.player.character !== "enemy")
            this.update_attack();

        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); /* 速度*两帧间的时间=移动距离 timedalta单位为毫秒 */
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /* 判断是否碰撞 */
    is_collision(obj) {
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        if (distance < this.radius + obj.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage); /* 此处可用动能方程优化 */

        if(this.playground.mode === "multi mode") {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }

        this.destroy();

    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i++) {
            if (fireballs[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
    }

}
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app5806.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }

    // 接受后端的请求
    receive() {
        let outer = this;
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
            else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            }
            else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }
            else if (event === "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid)
            }
            else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty);
            }
        };
    }

    send_create_player(username, photo) {
        let outer = this;
        /* 向后端发送消息 */
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            this.playground.height / 2 / this.playground.scale,
            this.playground.height * 0.05 / this.playground.scale,
            this.playground.get_random_color(),
            this.playground.height * 0.3 / this.playground.scale,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        this.playground.players.push(player);
    }


    get_player(uuid) {
        let players = this.playground.players;

        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.uuid === uuid)
                return player;
        }
        return null;
    }

    send_move_to(tx, ty) {
        let outer = this;
        /* 向后端发送消息 */
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);

        if (player) {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this;
        /* 向后端发送消息 */
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);

        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        /* 向后端发送消息 */
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if(player) {
            player.blink(tx, ty);
        }
    }

}
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
        $(window).resize(function () {
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
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            /* 向后端发送消息 */
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }

    }

    hide() { /* 关闭playground页面 */
        this.$playground.hide();
    }
}
class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "web";
        if (this.root.info) this.platform = "app";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
            <div class = "game_settings"> 
                <div class = "game_settings_login"> 
                    <div class = "game_settings_title">
                        登陆
                    </div>

                    <div class = "game_settings_username">
                        <div class = "game_settings_item">
                            <input type = "text" placeholder = "用户名">
                        </div>
                    </div>

                    <div class = "game_settings_password">
                        <div class = "game_settings_item">
                            <input type = "password" placeholder = "密码">
                        </div>
                    </div>

                    <div class = "game_settings_submit">
                        <div class = "game_settings_item">
                            <button>
                                登陆
                            </button>
                        </div>
                    </div>

                    <div class = "game_settings_error">

                    </div>

                    <div class = "game_settings_option">
                        注册
                    </div>
                    <br>
                    
                    <div class = "game_settings_logo">
                        <img width = "40" src = "https://app5806.acapp.acwing.com.cn/static/image/settings/logo_Q.png">
                        <br>
                        <div>
                            一键登录
                        </div>
                    </div>

                </div>

                <div class = "game_settings_register"> 
                    <div class = "game_settings_title">
                        注册
                    </div>

                    <div class = "game_settings_username">
                        <div class = "game_settings_item">
                            <input type = "text" placeholder = "用户名">
                        </div>
                    </div>

                    <div class = "game_settings_password game_settings_password_first">
                        <div class = "game_settings_item">
                            <input type = "password" placeholder = "密码">
                        </div>
                    </div>

                    <div class = "game_settings_password game_settings_password_second">
                        <div class = "game_settings_item">
                            <input type = "password" placeholder = "确认密码">
                        </div>
                    </div>

                    <div class = "game_settings_submit">
                        <div class = "game_settings_item">
                            <button>
                                注册
                            </button>
                        </div>
                    </div>

                    <div class = "game_settings_error">

                    </div>

                    <div class = "game_settings_option">
                        登陆
                    </div>
                    <br>
                    
                    <div class = "game_settings_logo">
                        <img width = "35" src = "https://app5806.acapp.acwing.com.cn/static/image/settings/logo_Q.png">
                        <br>
                        <div>
                            一键登录
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.$login = this.$settings.find(".game_settings_login");
        this.$login_username = this.$login.find(".game_settings_username input"); /* 相邻两级用 >  */
        this.$login_password = this.$login.find(".game_settings_password input");
        this.$login_submit = this.$login.find(".game_settings_submit button");
        this.$login_error = this.$login.find(".game_settings_error");
        this.$login_register = this.$login.find(".game_settings_option");

        this.$login.hide();

        this.$register = this.$settings.find(".game_settings_register");
        this.$register_username = this.$register.find(".game_settings_username input"); /* 相邻两级用 >  */
        this.$register_password = this.$register.find(".game_settings_password_first input");
        this.$register_password_confirm = this.$register.find(".game_settings_password_second input");
        this.$register_submit = this.$register.find(".game_settings_submit button");
        this.$register_error = this.$register.find(".game_settings_error");
        this.$register_login = this.$register.find(".game_settings_option");

        this.$register.hide();

        this.$web_login = this.$settings.find(".game_settings_logo img");

        this.root.$game.append(this.$settings);

        this.start();
    }

    start() {
        if (this.platform === "web") {
            this.getinfo_web();
            this.add_listening_events();
        }
        else if (this.platform === "app") {
            this.getinfo_app();
        }
    }

    add_listening_events() {
        let outer = this;

        this.add_listening_events_login();
        this.add_listening_events_register();


        this.$web_login.click(function () {
            outer.web_login();
        });
    }

    add_listening_events_login() {
        let outer = this;

        $(window).keydown(function (e) {
            /* 这里查询keycode码设置技能按键 */
            if (e.which === 13 || e.which === 108) { /* Enter键 */
                outer.login_on_remote();
            }
        });

        this.$login_submit.click(function () {
            outer.login_on_remote();
        });

        this.$login_register.click(function () {
            outer.register();
        });

    }

    add_listening_events_register() {
        let outer = this;

        this.$register_submit.click(function () {
            outer.register_on_remote();
        });

        this.$register_login.click(function () {
            outer.login();
        });
    }

    web_login() {
        console.log("click logo");
        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url) /* 页面重定向跳转到该页面 */
                }
                else {
                    outer.$login_error.html(resp.result);
                }
            }
        })
    }

    login_on_remote() { /* 在远程服务器上登陆 */
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error.empty();

        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload(); /* 登陆成功直接刷新即可 */
                }
                else {
                    outer.$login_error.html(resp.result);
                }
            }
        });
    }

    register_on_remote() { /* 在远程服务器上注册 */
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error.empty();

        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload(); /* 登陆成功直接刷新即可 */
                }
                else {
                    outer.$register_error.html(resp.result);
                }
            }
        });

    }

    logout_on_remote() { /* 在远程服务器上退出 */
        if (this.platform !== "web") {
            this.root.info.api.window.close();
        }
        else {
            $.ajax({
                url: "https://app5806.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function (resp) {
                    console.log(resp);
                    if (resp.result === "success") {
                        location.reload();
                    }
                }
            });
        }
    }


    register() {
        this.$login.hide();
        this.$register.show();
    }

    login() {
        this.$register.hide();
        this.$login.show();
    }

    app_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.info.api.oauth2.authorize(appid, redirect_uri, scope, state, function (resp) {
            console.log(resp);
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_app() {
        let outer = this;
        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/acwing/app/apply_code/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    outer.app_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    getinfo_web() {
        let outer = this;
        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}export class Game{
    constructor(id, info){
        this.id = id;
        this.info = info;
        console.log(info);
        
        this.$game = $('#' + id);
        this.settings = new Settings(this);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);
        this.start();
    }
    
    start() {

    }
}
