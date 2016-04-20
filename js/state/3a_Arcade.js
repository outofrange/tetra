tetra.arcade = function () {
    var character = null;
    var map = null;
    var layer = null;

    this.create = function () {
        console.log('Creating Arcade level');

        this.stage.backgroundColor = '#fff';

        //this.world.setBounds(0, 0, 800, 1280);
        map = this.add.tilemap('map_xl');
        map.addTilesetImage('kachel', 'tiles');
        layer = map.createLayer('Layer 1');
        layer.resizeWorld();
        map.setCollision([0, 1]);

        //this.camera.setBoundsToWorld();

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 1500;

        character = new tetra.Character(this, 64, 768);

        console.log(this);
    };

    this.update = function () {
        this.physics.arcade.collide(character.legsSprite, layer);
        this.physics.arcade.collide(character.bodySprite, layer);

        character.update();
    };

    this.render = function () {
    }
};


