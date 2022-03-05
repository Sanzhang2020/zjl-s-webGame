class fireball extends GameObject {
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
}