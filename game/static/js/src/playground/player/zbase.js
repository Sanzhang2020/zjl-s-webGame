class player extends GameObject {
    constructor(playground, x, y, radius, color, isMe, speed) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;
        this.x = x;
        this.y = y;
        //移动方向
        this.vx = 0;
        this.vy = 0;
        this.radius = radius;
        this.color = color;
        this.isMe = isMe;
        this.speed = speed;
        this.eps = 0.1;
        this.isAlive = true;
        this.move_length = 0;
        this.cur_skill = null;
    }
    start() {
        if (this.isMe) {
            this.add_listening_events();
        }
    }
    update() {
        this.render();
        this.update_move();
        this.update_AI();
    }
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    on_destroy() { //在死之前干掉它，不然死了还能发炮弹
        this.isAlive = false;
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
    add_listening_events() {
        let outer = this;
        //取消右键菜单
        this.playground.gameMap.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.gameMap.$canvas.mousedown(function (e) {
            if (!outer.isAlive) {
                return false;
            }
            let ee = e.which;
            if (ee == 3) { //右键
                outer.move_to(e.clientX, e.clientY);
            } else if (ee === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX, e.clientY);
                    return false;
                }
                outer.cur_skill = null;
            }
        });
        $(window).keydown(function (e) {
            if (!outer.isAlive) {
                return false;
            }
            let ee = e.which;
            if (ee == 81) { //key code ，可以去查
                outer.cur_skill = "fireball"; //将技能选为fireball
                return false;
            }
        });
    }
    move_to(tx, ty) {
        this.move_length = getDist(this.x, this.y, tx, ty);
        let dx = tx - this.x, dy = ty - this.y;
        let angle = Math.atan2(dy, dx);
        //两点间按直线距离行走，分别得到x，y方向的向量；
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
        // console.log('tx:' + tx + 'ty:' + ty);
    }
    update_move() { //更新移动过程
        if (this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
        } else {
            //每个时间间隔下应该走的距离。
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // s = v * delta t;
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
    }
    shoot_fireball(tx, ty) {
        //console.log(tx, ty);
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let color = "orange";
        let damage = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let move_dist = this.playground.height * 0.5;
        let speed = this.playground.height * 0.5;
        new fireball(this.playground, this, x, y, radius, color, damage, vx, vy, speed, move_dist);
    }
    update_AI() { //实现简单的AI
        if (this.isMe) {
            return false;
        }
        this.update_AI_move();
    }
    update_AI_move() { //实现简单的AI移动
        if (this.move_length < this.eps) { //运动停止， 重新随机生成一个target 坐标
            //随机生成的x方向的坐标
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

}
let getDist = function (x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
};