class Settings {//大写是因为想让它在前面。
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
            <div class="zs-game-settings-tencent">
                <img src="/static/image/settings/logo.png" width="120" height="24">
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
            <div class="zs-game-settings-tencent">
                <img src="/static/image/settings/logo.png" width="120" height="24">
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
        this.add_listening_events_login();
        this.add_listening_events_register();
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
    }
    register_on_remote() {

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
            url: "", //登出后应该访问的url
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
