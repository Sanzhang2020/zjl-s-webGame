class zsGameMenu {
    //这个root是zs_game这个对象
    constructor(root, OS) {
        this.root = root;
        this.OS = OS;
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
        this.$menu.hide();
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

        //点击单人模式
        this.$single.click(function () {
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi.click(function () {

        });
        this.$settings.click(function () {
            outer.root.settings.logout_on_remote();
        });
    }
    show() { //显示menu菜单,show 和hide 是有api的。
        this.$menu.show();
    }
    hide() {// 关闭menu菜单
        this.$menu.hide();
    }
}
let zs_game_objects = [];
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
}class particle extends GameObject {
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
        if (this.isMe) {
            this.img = new Image();// 头像的图片
            this.img.src = "https://s3.bmp.ovh/imgs/2022/03/99eb33d8f01d40c0.jpg";// this.playground.root.settings.photo; // 图床url
        }

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
        if (this.isMe) {
            //如果是我的话，就上皮肤
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();

            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else { //如果不是我，就按原来辣么画
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

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
};class zsGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="zs-game-playground"></div>`);
        this.hide();
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
                new player(this, this.width / 2, this.height / 2, this.height * 0.05, GET_RANDOM_COLOR(), false, this.height * 0.15)
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
//获取随机颜色的方法
let GET_RANDOM_COLOR = function () {
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += (Math.random() * 16 | 0).toString(16);
    }
    return color;
};class Settings {//大写是因为想让它在前面。
    //浏览器处理逻辑
    constructor(root) {
        //向客户端发送request时携带的信息
        this.root = root;
        this.platform = "WEB";
        if (this.root.OS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";
        this.$settings = $(`
<div class="zs-game-settings">
        <div class="zs-game-settings-login">
            <div class="zs-game-settings-title"> 
                登录
            </div>
            <div class="zs-game-settings-username">
                <div class="zs-game-settings-item">
                    <input type="text" placeholder="请输入用户名">
                </div>
            </div>
            <div class="zs-game-settings-password">
                <div class="zs-game-settings-item">
                    <input type="password" placeholder="请输入密码">
                </div>
            </div>
            <div class="zs-game-settings-submit">
                <div class="zs-game-settings-item">
                    <button>登录</button>
                </div>
            </div>
            <div class="zs-game-settings-errorMessage">
                
            </div>
            <div class="zs-game-settings-option">
                注册
            </div>
            <br>
            <div class="zs-game-settings-loginWay">
                更多登录方式:
                <span class="zs-game-settings-loginWay-Acwing">
                    <img src="/static/image/settings/acwing.png" width="16", height="16" alt="acwing图标">
                </span>
                <span class="zs-game-settings-loginWay-tencent">
                    <img src="/static/image/settings/QQLogo.png" width="16" height="16" alt="qq图标">
                </span>
            </div>
        </div>

        <div class="zs-game-settings-register">
            <div class="zs-game-settings-title"> 
                注册
            </div>
            <div class="zs-game-settings-username">
                <div class="zs-game-settings-item">
                    <input type="text" placeholder="用户名">
                </div>
            </div>
            <div class="zs-game-settings-password zs-game-settings-password-first">
                <div class="zs-game-settings-item">
                    <input type="password" placeholder="密码">
                </div>
            </div>
            <div class="zs-game-settings-password zs-game-settings-password-second">
                <div class="zs-game-settings-item">
                    <input type="password" placeholder="确认密码">
                </div>
            </div>
            <div class="zs-game-settings-submit">
                <div class="zs-game-settings-item">
                    <button>注册</button>
                </div>
            </div>
            <div class="zs-game-settings-errorMessage">
                
            </div>
            <div class="zs-game-settings-option">
                登录
            </div>
            <br>
            <div class="zs-game-settings-loginWay">
                更多登录方式:
                <span class="zs-game-settings-loginWay-Acwing">
                    <img src="/static/image/settings/acwing.png" width="16", height="16" alt="acwing图标">
                </span>
                <span class="zs-game-settings-loginWay-tencent">
                    <img src="/static/image/settings/QQLogo.png" width="16" height="16" alt="qq图标">
                </span>
            </div>
        </div>
</div>
        `);
        this.root.$zs_game.append(this.$settings);
        this.$register = this.$settings.find(".zs-game-settings-register"); // 注册界面
        this.$register_username = this.$register.find(`.zs-game-settings-username input`);
        this.$register_password = this.$register.find(`.zs-game-settings-password-first input`);
        this.$register_password_confirm = this.$register.find(`.zs-game-settings-password-second input`);
        this.$register_submit = this.$register.find(`.zs-game-settings-submit button`);
        this.$register_errorMessage = this.$register.find(`.zs-game-settings-errorMessage`);
        this.$register_login = this.$register.find(`.zs-game-settings-option`);

        this.$login = this.$settings.find(".zs-game-settings-login"); // 登录界面
        this.$login_username = this.$login.find(`.zs-game-settings-username input`);
        this.$login_password = this.$login.find(`.zs-game-settings-password input`);
        this.$login_submit = this.$login.find(`.zs-game-settings-submit button`);
        this.$login_errorMessage = this.$login.find(`.zs-game-settings-errorMessage`);
        this.$login_register = this.$login.find(`.zs-game-settings-option`);
        this.$acwing_login = this.$settings.find(`.zs-game-settings-loginWay-Acwing`);
        this.$register.hide(); // 隐藏注册界面

        this.$login.hide(); // 隐藏登录界面

        this.start();
    }

    getinfo() { //获取信息
        let outer = this;
        //由浏览器向服务器
        //ajax的作用： 不需要刷新页面的情况下，就可以产生局部刷新的效果
        //异步的传输数据,局部刷新，我们管这个叫异步更新
        //虽然他叫async javascripts and xml 但是它不仅支持xml也支持json
        $.ajax({//发送一个ajax请求
            url: "https://app1042.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform, //是什么平台
            },
            success: function (resp) { //服务器返回的response
                //我们前面在服务器写的getinfo定义的response是json格式的
                console.log(resp);
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show(); //登陆成功后，隐藏这个登录界面，并显示菜单页面
                } else {
                    outer.login(); //没有登录就得让他登录
                }
            }
        })
    }


    register() { //打开注册页面
        this.$login.hide();
        this.$register.show();
    }
    login() { //打开登录界面
        this.$register.hide();
        this.$login.show();
    }
    hide() {
        this.$settings.hide();
    }
    show() {
        this.$settings.show();
    }
    start() {
        this.getinfo();
        this.add_listening_events();
    }
    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$acwing_login.click(function () {
            outer.acwing_login();
        });
    }
    acwing_login() {
        $.ajax({
            url: "https://app1042.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        })
    }
    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function () {
            outer.register();
        });
        this.$login_submit.click(function () {
            outer.login_on_remote();
        });
    }
    add_listening_events_register() {
        let outer = this;

        this.$register_login.click(function () {
            outer.login();
        });
        this.$register_submit.click(function () {
            outer.register_on_remote();
        });
    }
    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val()
        this.$register_errorMessage.empty()

        $.ajax({
            url: "https://app1042.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_errorMessage.html(resp.result);
                }
            }
        })
    }
    login_on_remote() {
        let outer = this;

        let username = this.$login_username.val(); //获取输入框的用户名；
        let password = this.$login_password.val();//同上
        this.$login_errorMessage.empty(); //清空错误信息；
        //局部更新，使用Get方法传输数据（username,password)
        $.ajax({
            url: "https://app1042.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload(); //重新刷新页面
                } else {
                    outer.$login_errorMessage.html(resp.result); //失败了就显示错误信息
                }
            }
        });
    }
    logout_on_remote() {
        if (this.platform === 'ACAPP') return false;

        $.ajax({
            url: "https://app1042.acapp.acwing.com.cn/settings/logout/", //登出后应该访问的url
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                }
            }
        })
    }
}
export class zsGame {
    //构造函数
    constructor(id) {
        this.id = id;
        //找到主对象的那个div即 zs_game
        this.$zs_game = $('#' + id);

        this.settings = new Settings(this);
        this.menu = new zsGameMenu(this);
        this.playground = new zsGamePlayground(this);
        this.start();
    }
    start() {

    }
}
