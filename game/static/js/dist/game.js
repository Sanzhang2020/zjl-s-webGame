class zsGameMenu {
    //这个root是zs_game这个对象
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="zs-game-menu">
    <div class="zs-game-menu-field">
        <div class="zs-game-menu-field-item zs-game-menu-field-item-single">
            单人模式
        </div>
        <div class="zs-game-menu-field-item zs-game-menu-field-item-multi">
            多人模式
        </div>
        <div class="zs-game-menu-field-item zs-game-menu-field-item-settings">
            设置
        </div>
    </div>
</div>        
`);
        this.root.$zs_game.append(this.$menu);
        this.$single = this.$menu.find('.zs-game-menu-field-item-single');
        this.$multi = this.$menu.find('.zs-game-menu-field-item-multi');
        this.$settings = this.$menu.find('.zs-game-menu-field-item-settings');
        this.start();
    }
    start() {
        this.add_listening_events();
    }
    add_listening_events() {
        let outer = this;
        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi.click(function(){

        });
        this.$settings.click(function(){

        });
    }
    show() { //显示menu菜单,show 和hide 是有api的。
        this.$menu.show();
    }
    hide() {// 关闭menu菜单
        this.$menu.hide();
    }
}let zs_game_objects = [];
class GameObject {
    constructor() {
        zs_game_objects.push(this);

        this.isStarted = false;
        this.timedelta = 0;
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
        if (!obj.isStarted) {
            obj.start();
            obj.isStarted = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    //不断递归调用这个
    requestAnimationFrame(ZS_GAME_ANIMATION);
};
requestAnimationFrame(ZS_GAME_ANIMATION);class fireball extends GameObject {
    constructor(playground, player, x, y, radius, color, damage, vx, vy, speed, move_dist) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.damage = damage; //伤害
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.move_dist = move_dist; //射程
        this.eps = 0.1;
    }
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    start() {

    }
    update() {
        this.update_move();
        this.render();

    }
    update_move() {
        if (this.move_dist < this.eps) {
            this.destroy();
            return false;
        } else {
            //同样的道理, 该时间间隔下，小球应该运动的距离
            let moved = Math.min(this.move_dist, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_dist -= moved;
        }
    }
}class gameMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        //设置画布的大小
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        //常规操作，拼接DOM
        this.playground.$playground.append(this.$canvas);

    }
    start() {

    }
    update() {
        this.render();
    }
    render() {
        this.ctx.fillStyle = "rgb(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class player extends GameObject {
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
};class zsGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="zs-game-playground"></div>`);
        //this.hide();
        this.root.$zs_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.gameMap = new gameMap(this);
        this.players = [];
        this.players.push(
            new player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", true, this.height * 0.15)
        );
        for (let i = 0; i < 5; i++) {
            this.players.push(
                new player(this, this.width / 2, this.height / 2, this.height * 0.05, GET_RANDOM_COLOR, false, this.height * 0.15)
            );
        }
        this.start();
    }
    show() { //打开playground界面
        this.$playground.show();
    }
    hide() {
        this.$playground.hide();
    }
    start() {
    }
}
let HEX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

let GET_RANDOM_COLOR = function () {
    let color = "#";
    for (let i = 0; i < 6; ++i) {
        color += HEX[Math.floor(Math.random() * 16)];
    }
    // let num = Math.floor(255 * 255 * 255 * Math.random());
    // color += num.toString(16);
    return color;
};export class zsGame {
    //构造函数
    constructor(id) {
        this.id = id;
        //找到主对象的那个div即 zs_game
        this.$zs_game = $('#' + id);
        //this.menu = new zsGameMenu(this);
        this.playground = new zsGamePlayground(this);
        this.start();
    }
    start() {

    }
}