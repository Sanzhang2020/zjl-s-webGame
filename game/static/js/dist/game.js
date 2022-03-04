class zsGameMenu {
    //这个root是zs_game这个对象
    constructor(root) {
        this.root = root;
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
        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi.click(function(){

        });
        this.$settings.click(function(){

        });
    }
    show() { //显示menu菜单,show 和hide 是有api的。
        this.$menu.show();
    }
    hide() {// 关闭menu菜单
        this.$menu.hide();
    }
}class zsGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="zs-game-playground"></div>`);
        //this.hide();
        this.root.$zs_game.append(this.$playground);
        this.width = this.$playground.width;
        this.height = this.$playground.height;


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
}export class zsGame {
    //构造函数
    constructor(id) {
        this.id = id;
        //找到主对象的那个div即 zs_game
        this.$zs_game = $('#' + id);
        //this.menu = new zsGameMenu(this);
        this.playground = new zsGamePlayground(this);
        this.start();
    }
    start() {

    }
}