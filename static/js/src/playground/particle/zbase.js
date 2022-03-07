class particle extends GameObject {
    constructor(playground, x, y, radius, color, vx, vy, speed) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.eps = 0.1;

    }
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    start() {
        this.frition_speed = 0.8;
        this.frition_radius = 0.8;
    }
    update() {
        this.render();
        this.update_move();
    }
    update_move() {
        if (this.speed < this.eps || this.radius < this.eps) {
            this.destroy();
            return false;
        }
        this.x += this.vx * this.speed * this.timedelta / 1000;
        this.y += this.vy * this.speed * this.timedelta / 1000;

        this.speed *= this.frition_speed;
        this.radius *= this.frition_radius;
    }
}