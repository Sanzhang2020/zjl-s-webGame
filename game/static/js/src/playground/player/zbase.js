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
    }
    start() {
        if (this.isMe) {
            this.add_listening_events();
        }
    }
    update() {
        this.render();
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

    }

}
let getDist = function (x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}