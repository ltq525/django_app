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

