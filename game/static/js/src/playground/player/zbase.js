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
        this.eps = 0.01; /* 精度 */
        this.spent_time = 0;


        this.cur_skill = null; /* 选择的技能 */

        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }

    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        }
        else {
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
            let scale = outer.playground.scale;
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (!outer.playground.players[0].is_me) return false;
            /* 左键1 滚轮2 右键3 */
            if (e.which === 3) {
                outer.move_to((e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale); /* 鼠标坐标的API */
            }
            else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball((e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale);
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
        let scale = this.playground.scale;

        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01 / scale;
        let angle = Math.atan2(ty - this.y, tx - this.x); /* 反正切函数获得偏移角度 */
        let vx = Math.cos(angle), vy = Math.sin(angle);

        let color = "LightBLue";
        let speed = this.playground.height * 0.8 / scale;

        let move_length = Math.max(this.playground.width, this.playground.height) / scale;
        let damage = this.playground.height * 0.01 / scale;

        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
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

    update() {
        this.update_move();
        this.render();
    }

    update_move() {
        let scale = this.playground.scale;
        this.spent_time += this.timedelta / 1000;
        if (!this.is_me && this.spent_time > 3 && Math.random() < 1 / 180.0) {
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
                if (!this.is_me) {
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
        if (this.is_me) {
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
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }


    }
}
