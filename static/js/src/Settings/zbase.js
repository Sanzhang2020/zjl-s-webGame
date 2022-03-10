class Settings {//大写是因为想让它在前面。
    //浏览器处理逻辑
    constructor(root) {
        //向客户端发送request时携带的信息
        this.root = root;
        this.platform = "WEB";

        if (this.root.OS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";
        this.start();
    }
    start() {

        this.getinfo();
    }
    register() { //打开注册页面

    }
    login() { //打开登录界面

    }
    hide() {

    }
    show() {

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
                    console.log('outer.photo : 1' + outer.photo);

                    outer.photo = resp.photo;
                    console.log('outer.photo : 2' + outer.photo);
                    outer.hide();
                    outer.root.menu.show(); //登陆成功后，隐藏这个登录界面，并显示菜单页面
                } else {
                    outer.login(); //没有登录就得让他登录
                }
                console.log('photo : int settings ' + outer.photo);
                console.log('photo : int settings ' + this.photo);
            }
        });
        console.log('this.photo the last ' + this.photo);
    }
}
