class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "web";
        if (this.root.info) this.platform = "app";
        this.uername = "";
        this.photo = "";

        this.$settings = $(`
            <div class = "game_settings"> 
                <div class = "game_settings_login"> 
                    <div class = "game_settings_title">
                        登陆
                    </div>

                    <div class = "game_settings_username">
                        <div class = "game_settings_item">
                            <input type = "text" placeholder = "用户名">
                        </div>
                    </div>

                    <div class = "game_settings_password">
                        <div class = "game_settings_item">
                            <input type = "password" placeholder = "密码">
                        </div>
                    </div>

                    <div class = "game_settings_submit">
                        <div class = "game_settings_item">
                            <button>
                                登陆
                            </button>
                        </div>
                    </div>

                    <div class = "game_settings_error">

                    </div>

                    <div class = "game_settings_option">
                        注册
                    </div>
                    <br>
                    
                    <div class = "game_settings_logo">
                        <img width = "40" src = "https://app5806.acapp.acwing.com.cn/static/image/settings/logo_Q.png">
                        <br>
                        <div>
                            一键登录
                        </div>
                    </div>

                </div>

                <div class = "game_settings_register"> 
                    <div class = "game_settings_title">
                        注册
                    </div>

                    <div class = "game_settings_username">
                        <div class = "game_settings_item">
                            <input type = "text" placeholder = "用户名">
                        </div>
                    </div>

                    <div class = "game_settings_password game_settings_password_first">
                        <div class = "game_settings_item">
                            <input type = "password" placeholder = "密码">
                        </div>
                    </div>

                    <div class = "game_settings_password game_settings_password_second">
                        <div class = "game_settings_item">
                            <input type = "password" placeholder = "确认密码">
                        </div>
                    </div>

                    <div class = "game_settings_submit">
                        <div class = "game_settings_item">
                            <button>
                                注册
                            </button>
                        </div>
                    </div>

                    <div class = "game_settings_error">

                    </div>

                    <div class = "game_settings_option">
                        登陆
                    </div>
                    <br>
                    
                    <div class = "game_settings_logo">
                        <img width = "35" src = "https://app5806.acapp.acwing.com.cn/static/image/settings/logo_Q.png">
                        <br>
                        <div>
                            一键登录
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.$login = this.$settings.find(".game_settings_login");
        this.$login_username = this.$login.find(".game_settings_username input"); /* 相邻两级用 >  */
        this.$login_password = this.$login.find(".game_settings_password input");
        this.$login_submit = this.$login.find(".game_settings_submit button");
        this.$login_error = this.$login.find(".game_settings_error");
        this.$login_register = this.$login.find(".game_settings_option");

        this.$login.hide();

        this.$register = this.$settings.find(".game_settings_register");
        this.$register_username = this.$register.find(".game_settings_username input"); /* 相邻两级用 >  */
        this.$register_password = this.$register.find(".game_settings_password_first input");
        this.$register_password_confirm = this.$register.find(".game_settings_password_second input");
        this.$register_submit = this.$register.find(".game_settings_submit button");
        this.$register_error = this.$register.find(".game_settings_error");
        this.$register_login = this.$register.find(".game_settings_option");

        this.$register.hide();

        this.$web_login = this.$settings.find(".game_settings_logo img");

        this.root.$game.append(this.$settings);

        this.start();
    }

    start() {
        if (this.platform === "web") {
            this.getinfo_web();
            this.add_listening_events();
        }
        else if (this.platform === "app") {
            this.getinfo_app();
        }
    }

    add_listening_events() {
        let outer = this;

        this.add_listening_events_login();
        this.add_listening_events_register();


        this.$web_login.click(function () {
            outer.web_login();
        });
    }

    add_listening_events_login() {
        let outer = this;

        $(window).keydown(function (e) {
            /* 这里查询keycode码设置技能按键 */
            if (e.which === 13 || e.which === 108) { /* Enter键 */
                outer.login_on_remote();
            }
        });

        this.$login_submit.click(function () {
            outer.login_on_remote();
        });

        this.$login_register.click(function () {
            outer.register();
        });

    }

    add_listening_events_register() {
        let outer = this;

        this.$register_submit.click(function () {
            outer.register_on_remote();
        });

        this.$register_login.click(function () {
            outer.login();
        });
    }

    web_login() {
        console.log("click logo");
        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url) /* 页面重定向跳转到该页面 */
                }
                else {
                    outer.$login_error.html(resp.result);
                }
            }
        })
    }

    login_on_remote() { /* 在远程服务器上登陆 */
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error.empty();

        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload(); /* 登陆成功直接刷新即可 */
                }
                else {
                    outer.$login_error.html(resp.result);
                }
            }
        });
    }

    register_on_remote() { /* 在远程服务器上注册 */
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error.empty();

        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload(); /* 登陆成功直接刷新即可 */
                }
                else {
                    outer.$register_error.html(resp.result);
                }
            }
        });

    }

    logout_on_remote() { /* 在远程服务器上退出 */
        if (this.platform !== "web") return false;

        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                }
            }
        });
    }


    register() {
        this.$login.hide();
        this.$register.show();
    }

    login() {
        this.$register.hide();
        this.$login.show();
    }

    app_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.info.api.oauth2.authorize(appid, redirect_uri, scope, state, function (resp) {
            if (resp.result === "success") {
                outer.uername = resp.uername;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_app() {
        let outer = this;
        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    //outer.app_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                    outer.uername = resp.uername;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else {
                    outer.login();
                }
            }
        });
    }

    getinfo_web() {
        let outer = this;
        $.ajax({
            url: "https://app5806.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    outer.uername = resp.uername;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}