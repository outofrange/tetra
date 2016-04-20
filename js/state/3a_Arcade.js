tetra.arcade = function () {
    var character = null;
    
    this.create = function () {
        console.log('Creating Arcade level');

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 1500;

        character = new tetra.Character(this);
    };

    this.update = function () {
        character.update();
    };
};


