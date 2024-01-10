export class Game{
    constructor(id, info, access, refresh){
        this.id = id;
        this.info = info;
        this.access = access;
        this.refresh = refresh;

        this.$game = $('#' + id);
        this.settings = new Settings(this);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);
        this.start();
    }
    
    start() {

    }
}
