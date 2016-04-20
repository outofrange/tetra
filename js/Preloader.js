tetra.preload = function () {

    this.create = function () {
        console.log("Creating preloader...");
        //this.preloadBar.cropEnabled = false; //force show the whole thing

        // load tiles & map
        this.load.tilemap('map', 'assets/tile/map.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('map_xl', 'assets/tile/map_xl.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'assets/tile/kachel.png');

        // load sprites
        this.load.atlasJSONArray('sprites', 'assets/sprite/tetrasprites.png', 'assets/sprite/tetrasprites.json');
        this.load.spritesheet('explosion_box', 'assets/sprite/explosionbox.png', 32, 32);
        this.load.spritesheet('explosion_big', 'assets/sprite/explosiontetra.png',  70, 64);

        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
        this.preloadBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.preloadBar);
        this.titleText = this.add.image(this.world.centerX, this.world.centerY - 220, 'titleimage');
        this.titleText.anchor.setTo(0.5, 0.5);
    };

    this.update = function () {
        this.state.start('Menu');
    };
};


