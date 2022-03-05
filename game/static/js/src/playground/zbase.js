class zsGamePlayground {
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
};