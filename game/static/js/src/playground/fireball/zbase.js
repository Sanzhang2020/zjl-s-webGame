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
        this.update_attack();
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


    //碰撞的方法。。我们这里写的是相互碰撞。
    //判断是否是满足我们常规意义上的“碰撞”
    is_satisfy_collision(obj) { //真正意义上的碰撞
        if (this === obj) return false; //火球自己无法被攻击

        if (this.player === obj) return false; //发射源（player）不会被攻击
        return isCollision(this, obj);
    }
    //player和物体相互碰撞
    hit(obj) {
        obj.is_Attacked(this);//玩家被火球攻击了。玩家，这里是obj 被this(火球)攻击了
        this.isAttacked(obj);//火球被玩家攻击了
    }
    isAttacked(obj) { //被撞击而产生伤害
        this.isAttacked_concrete(0, 0); //描述物体伤害值，这里是火球，直接消失吧。
    }
    isAttacked_concrete(angle, damage) {
        this.destroy(); //直接消失
    }
    update_attack() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let obj = this.playground.players[i];
            if (this.is_satisfy_collision(obj)) {
                this.hit(obj);
                break; //火球只能碰撞一个物体，这里要break;
            }
        }
    }
}

//全局函数，判断两物体是否碰撞,这里两球相切也算碰撞
let isCollision = function (obj1, obj2) {
    return getDist(obj1.x, obj1.y, obj2.x, obj2.y) < obj1.radius + obj2.radius;
};