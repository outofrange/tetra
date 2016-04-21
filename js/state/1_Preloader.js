tetra.preload = function () {
    this.preload = function () {
        console.log("Creating preloader...");

        // Adding loading text
        var text = this.add.text(0, 0, "Loading...", tetra.style.text.heading);
        text.setTextBounds(0, 100, 800, 100);

        // load tiles & map
        this.load.tilemap('map', 'assets/tile/map.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('map_xl', 'assets/tile/map_xl.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'assets/tile/kachel.png');

        // load sprites
        this.load.atlasJSONHash('sprites', 'assets/sprite/tetrasprites.png', 'assets/sprite/tetrasprites.json');
        this.load.spritesheet('explosion_box', 'assets/sprite/explosionbox.png', 32, 32);
        this.load.spritesheet('explosion_big', 'assets/sprite/explosiontetra.png',  70, 64);
        
        this.load.audio('ozzed_fighter', "assets/music/ozzed/fighter.mp3");
    };

    this.update = function () {
        this.state.start('Menu');
    };
};


