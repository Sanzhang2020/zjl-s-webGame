class player extends GameObject {
    constructor(playground, x, y, radius, color, isMe, speed) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.isMe = isMe;
        this.speed = speed;
        this.eps = 0.1;
        this.isAlive = true;
    }
    start() { }
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
}