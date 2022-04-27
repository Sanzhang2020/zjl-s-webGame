class ScoreBoard extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;

        this.state = null;  // win-胜利；lose-失败

        this.win_img = new Image();
        this.win_img.src = "https://s1.328888.xyz/2022/04/11/fHRdi.png";

        this.lose_img = new Image();
        this.lose_img.src = "https://s1.328888.xyz/2022/04/11/fqbVm.jpg";
    }
    start() {
    }

    add_listening_events() {    //点击后，返回主页面
        let outer = this;
        let $canvas = this.playground.gameMap.$canvas;

        $canvas.on('click', function () {
            outer.playground.hide();
            outer.playground.root.menu.show();
        });
    }

    win() {
        this.state = "win";
        let outer = this;
        setTimeout(function () {
            outer.add_listening_events();
        }, 1000);   //1秒后监听点击事件
    }

    lose() {
        this.state = "lose";
        let outer = this;
        setTimeout(function () {
            outer.add_listening_events();
        }, 1000);   //1秒后监听点击事件
    }

    late_update() {
        this.render();  //渲染在图层最上方
    }
    render() {
        let len = this.playground.height / 2;
        if (this.state === "win") {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}