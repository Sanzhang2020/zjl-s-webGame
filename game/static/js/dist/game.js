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
requestAnimationFrame(ZS_GAME_ANIMATION);class gameMap extends GameObject {
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
    }
    start() {
        if (this.isMe) {
            this.add_listening_events();
        }
    }
    update() {
        this.render();
        this.update_move();
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
            new player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true)
        );
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
}export class zsGame {
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