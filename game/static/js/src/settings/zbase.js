class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "web";
        if(this.root.info) this.platform = "app";
        
        this.start();
    }

    start() {
        this.getinfo();
    }

    register() {

    }

    login() {

    }

    getinfo() {
        let outer = this;
        $.ajax({
            url: "http://localhost/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
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

    }

    show() {

    }
}