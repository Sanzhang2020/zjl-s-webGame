class player extends GameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        //console.log(character, username, photo);
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
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.speed = speed;
        this.eps = 0.01;
        this.move_length = 0;
        this.cur_skill = null;
        this.frition_damage = 0;
        this.spend_time = 0;
        this.fireballs = [];
        if (this.character !== "robot") {
            this.img = new Image();// 头像的图片
            this.img.src = this.photo;// this.playground.root.settings.photo; // 图床url
        }
        if (this.character === "me") {
            this.fireball_cold_time = 3;//火球冷却时间
            this.fireball_img = new Image();
            this.fireball_img.src = "https://s3.bmp.ovh/imgs/2022/04/04/dd4c4eb08b35c383.jpg";
            this.blink_coldtime = 5; //闪现冷却时间
            this.blink_img = new Image();
            this.blink_img.src = "https://s3.bmp.ovh/imgs/2022/04/04/f4d9157dda4e7740.png";
        }

    }
    start() {
        let outer = this;
        this.playground.player_count++;
        this.playground.noticeBoard.write("已就绪：" + this.playground.player_count + "人");
        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            var start = Date.now();
            var add = setInterval(function clock() {
                var end = Date.now();
                var t = Math.trunc((end - start) / 1000);
                outer.playground.noticeBoard.write(getTimeFormat(t));
            }, 1000);
        }
        this.cold_time = 5;//冷静期：5秒
        if (this.character === "me") {
            this.add_listening_events();
        }
    }
    update() {
        this.spend_time += this.timedelta / 1000;
        this.render();
        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_cold_time();
        }
        this.update_win();
        this.update_move();
        this.update_AI();
    }
    update_win() {
        // 竞赛状态，且只有一名玩家，且改名玩家就是我，则胜利
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1) {
            this.playground.state = "over";
            this.playground.score_board.win();
        }
    }
    render() {
        let scale = this.playground.scale;
        if (this.character !== "robot") {
            //如果是玩家的话，就渲染图片；
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else { //如果不是我，就按原来辣么画
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
        }
    }
    render_skill_coldtime() {
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        //画一层阴影表示冷却
        if (this.fireball_cold_time > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_cold_time / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgb(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
        //画闪现图标
        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        //画一层阴影表示冷却
        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgb(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }
    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid = uuid) {
                fireball.destroy();
                break;
            }
        }
    }
    blink(tx, ty) {
        let distance = getDist(this.x, this.y, tx, ty);
        distance = Math.min(distance, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += distance * Math.cos(angle);
        this.y += distance * Math.sin(angle);
        this.blink_coldtime = 5;
        this.move_length = 0; //闪现完停止；
    }
    on_destroy() { //在死之前干掉它，不然死了还能发炮弹
        if (this.character === "me" && this.playground.state === "fighting") {
            this.playground.state = "over";
            this.playground.score_board.lose();
        }
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

            if (outer.playground.state !== "fighting") return true;
            let ee = e.which;
            const rect = outer.ctx.canvas.getBoundingClientRect(); //从canvas里面获取这个矩形框框

            if (ee == 3) { //右键
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            } else if (ee === 1) {

                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball") {
                    if (outer.fireball_cold_time > outer.eps) {
                        return false;
                    }
                    let fireball = outer.shoot_fireball(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                    return false;
                } else if (outer.cur_skill === "blink") {
                    if (outer.blink_coldtime > outer.eps) {
                        return false;
                    }
                    //广播blink函数
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                    outer.blink(tx, ty);
                }
                outer.cur_skill = null;
            }
        });
        this.playground.gameMap.$canvas.keydown(function (e) {
            if (e.which === 13) { //enter
                if (outer.playground.mode === "multi mode") { //打开聊天框
                    outer.playground.chat_field.show_input();
                    return false;
                }
            } else if (e.which === 27) {
                if (outer.playground.mode === "multi mode") {
                    outer.playground.chat_field.hide_input();
                }
            }
            if (outer.playground.state !== "fighting") return true;
            let ee = e.which;

            if (ee === 81) { //key code ，可以去查
                if (outer.fireball_cold_time > outer.eps) {
                    return true;
                }
                outer.cur_skill = "fireball"; //将技能选为fireball
                return false;
            } else if (ee === 70) {
                if (outer.blink_coldtime > outer.eps) {
                    return true;
                }
                outer.cur_skill = "blink";
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
    update_cold_time() {
        this.fireball_cold_time -= this.timedelta / 1000;
        this.fireball_cold_time = Math.max(this.fireball_cold_time, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }
    shoot_fireball(tx, ty) { //发射火球，这里只要给定坐标，计算参数，给fireball对象，由对象根据参数进行发射的动作。
        //console.log(tx, ty);
        let x = this.x, y = this.y;
        let radius = 0.01;
        let color = "orange";
        let damage = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let move_dist = 0.5;
        let speed = 0.5;

        let fireballInstance = new fireball(this.playground, this, x, y, radius, color, damage, vx, vy, speed, move_dist);
        this.fireballs.push(fireballInstance);
        //需要获取火球的uuid
        this.fireball_cold_time = 3;
        return fireballInstance;
    }
    update_AI() { //实现简单的AI
        if (this.character !== "robot") {
            return false;
        }
        this.update_AI_move();
        //AI发射火球
        if (!this.update_AI_cold_time()) return false; //没走完冷静期，不准开火；
        this.update_AI_shoot_fireball();
    }
    update_AI_move() { //实现简单的AI移动
        if (this.move_length < this.eps) { //运动停止， 重新随机生成一个target 坐标
            //随机生成的x方向的坐标
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
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
    receive_attack(x, y, angle, damage, b_uuid, attacker) {
        attacker.destroy_fireball(b_uuid);
        this.x = x;
        this.y = y;
        this.isAttacked_concrete(angle, damage);
    }
    //判断this是否去世了
    isDied() {
        if (this.radius * this.playground.scale < this.eps) {
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

const getTimeFormat = (value) => {
    let h = Math.floor(value / 3600);
    let m = Math.floor((value / 60) % 60);
    let s = Math.floor(value % 60);

    let str = "";
    str += `${h}:`
    str += `${m}:`
    str += `${s}`
    return str;
};