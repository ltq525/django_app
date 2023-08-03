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

        this.move_length = 0;

        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.01; /* 精度 */

        this.cur_skill = null; /* 选择的技能 */
        
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        }
    }

    add_listening_events() {
        let outer = this;
        /* 取消鼠标右键菜单 */
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        }); 
        this.playground.game_map.$canvas.mousedown(function(e) {
            /* 左键1 滚轮2 右键3 */
            if(e.which === 3) {
                outer.move_to(e.clientX, e.clientY); /* 鼠标坐标的API */
            }
            else if(e.which === 1) {
                if(outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX, e.clientY);
                }
                
                outer.cur_skill = null; /* 释放后清空技能 */
            }
        });

        $(window).keydown(function(e) {
            /* 这里查询keycode码设置技能按键 */
            if(e.which === 81) { /* q键 */
                outer.cur_skill = "fireball";
                return false;
            }
            
        });

    }

    shoot_fireball(tx, ty) {

        console.log(tx, ty);
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x); /* 反正切函数获得偏移角度 */
        let vx = Math.cos(angle), vy = Math.sin(angle);
        
        let color = "orange";
        let speed = this.playground.height;

        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length);
        
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        console.log(tx, ty);
        this.move_length = this.get_dist(this.x, this.y, tx, ty); /* 需要移动的距离 */
        let angle = Math.atan2(ty - this.y, tx - this.x); /* 反正切函数获得偏移角度 */
        
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update() {
        if(this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
        }
        else
        {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); /* 计算每一帧移动的距离 */
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
        this.render();
    }

    render() {

        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        
    }
}
