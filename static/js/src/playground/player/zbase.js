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
        //被攻击的方向；要有惯性
        this.damage_x = 0;
        this.damage_y = 0;
        //被攻击后的惯性速度
        this.damage_speed = 0;
        this.radius = radius;
        this.color = color;
        this.isMe = isMe;
        this.speed = speed;
        this.eps = 0.1;
        this.isAlive = true;
        this.move_length = 0;
        this.cur_skill = null;
        this.frition_damage = 0;
    }
    start() {
        this.cold_time = 5;//冷静期：5秒
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
            const rect = outer.ctx.canvas.getBoundingClientRect(); //从canvas里面获取这个矩形框框
            let tx = e.clientX - rect.left, ty = e.clientY - rect.top;
            if (ee == 3) { //右键
                outer.move_to(tx, ty);
            } else if (ee === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(tx, ty);
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
        if (this.damage_speed > this.eps) { //如果此时在被击退状态，则处于被控制状态，无法控制移动
            //因为惯性而应该后移的距离
            this.vx = this.vy = 0; //控制不了自己
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.frition_damage;
        } else {
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
    }
    shoot_fireball(tx, ty) { //发射火球，这里只要给定坐标，计算参数，给fireball对象，由对象根据参数进行发射的动作。
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
        //AI发射火球
        if (!this.update_AI_cold_time()) return false; //没走完冷静器，不准开火；
        this.update_AI_shoot_fireball();
    }
    update_AI_move() { //实现简单的AI移动
        if (this.move_length < this.eps) { //运动停止， 重新随机生成一个target 坐标
            //随机生成的x方向的坐标
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    //碰撞；相互碰撞；
    is_Attacked(obj) { //这里应该是被火球击中了，
        let angle = Math.atan2(this.y - obj.y, this.x - obj.x);
        let damage = obj.damage;//伤害
        this.isAttacked_concrete(angle, damage);

    }
    //被具体伤害
    isAttacked_concrete(angle, damage) {
        this.explode_particle();
        this.radius -= damage; //半径就是血量；
        //console.log('this.radius' + this.radius);
        this.frition_damage = 0.8; //摩檫力系数吧。。。大概
        //如果去世了，那就不用计算了
        if (this.isDied()) return false;

        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);

        this.damage_speed = damage * 100; //被击退之后由于惯性产生的效果，会在极短时间内消失。
        this.speed *= 1.2; // 每次被击中增加百分之二十的速度

    }
    //判断this是否去世了
    isDied() {
        if (this.radius < this.eps * 10) {
            this.destroy();
            return true;
        }
        return false;
    }
    explode_particle() {
        for (let i = 0; i < 10 + Math.random() * 5; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius / 3;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;

            new particle(this.playground, x, y, radius, color, vx, vy, speed);
        }
    }
    update_AI_cold_time() {
        if (this.cold_time > 0) { //如果处于冷静期，就不开火
            this.cold_time -= this.timedelta / 1000; //timedelta是ms 单位是每个帧的时间间隔
            return false;
        }
        return true;
    }
    update_AI_shoot_fireball() {
        if (Math.random() < 1 / 180.0) { //每隔一定时间间隔发射一次
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)]; //这个可以设置成随机
            this.shoot_fireball(player.x, player.y); //发射火球

        }
    }


}
//全局函数，判断两点之间的距离
let getDist = function (x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
};
