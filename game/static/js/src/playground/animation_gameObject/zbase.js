let zs_game_objects = [];
class GameObject {
    constructor() {
        zs_game_objects.push(this);

        this.isStarted = false;
        this.timedelta = 0;
        this.uuid = this.create_uuid();
    }
    late_update() { //每一帧均会执行一次，且在所有 update 执行完后才执行

    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 1)之间的数
            res += x;
        }
        return res;
    }

    start() { }
    update() { }
    on_destroy() { }
    destroy() {
        this.on_destroy();
        for (let i = 0; i < zs_game_objects.length; i++) {
            if (zs_game_objects[i] === this) {
                zs_game_objects.splice(i, 1);
                break;
            }
        }
    }

}
let last_timestamp;
let ZS_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < zs_game_objects.length; i++) {
        let obj = zs_game_objects[i];
        obj.late_update();
        if (!obj.isStarted) {
            obj.start();
            obj.isStarted = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    //递归调用,无限刷新实现动画效果
    requestAnimationFrame(ZS_GAME_ANIMATION);
};
requestAnimationFrame(ZS_GAME_ANIMATION);