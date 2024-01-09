export class Game{
    constructor(id, info){
        this.id = id;
        this.info = info;
        
        this.$game = $('#' + id);
        this.settings = new Settings(this);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);
        this.start();
    }
    
    start() {

    }
}
