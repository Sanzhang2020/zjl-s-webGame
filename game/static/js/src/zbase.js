export class zsGame {
    //构造函数
    constructor(id, OS) {
        this.id = id;
        //找到主对象的那个div即 zs_game
        this.$zs_game = $('#' + id);
        this.OS = OS;
        this.settings = new Settings(this);
        this.menu = new zsGameMenu(this);
        this.playground = new zsGamePlayground(this);
        this.start();
    }
    start() {

    }
}
