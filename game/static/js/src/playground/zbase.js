class zsGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="zs-game-playground"></div>`);
        this.hide();
        this.root.$zs_game.append(this.$playground);
        this.mps = new MultiPlayerSocket(this);
        this.start();
    }
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));   //[0, 10)
            res += x;
        }
        return res;
    }
    start() {
        let outer = this;
        let uuid = this.create_uuid
        $(window).resize(function () {
            outer.resize();
        });
        if (this.root.OS) {
            outer.root.OS.api.window.on_close(function () {
                $(window).off(`resize.${uuid}`);
            });
        }
    }
    resize() { //统一游戏地图比例为16:9
        //console.log("resize");
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.gameMap) this.gameMap.resize();
    }

    show(mode) { //打开playground界面
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.gameMap = new gameMap(this);

        this.mode = mode;
        this.state = "waiting" //waiting -> fighting -> over
        this.noticeBoard = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;
        this.resize();
        this.players = [];

        this.players.push(
            new player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo)
        );
        if (mode === "single mode") {
            for (let i = 0; i < 5; i++) {
                this.players.push(
                    new player(this, this.width / 2 / this.scale, 0.5, 0.05, GET_RANDOM_COLOR(), 0.15, "robot")
                );
            }
        }
        else if (mode === "multi mode") {
            let outer = this;
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function () {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }

    }
    hide() {
        //清空游戏元素
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }
        if (this.gameMap) {
            this.gameMap.destroy();
            this.gameMap = null;
        }

        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }
        this.$playground.empty(); //清空html标签
        this.$playground.hide();

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