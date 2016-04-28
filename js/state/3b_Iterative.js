Tetra.Iterative = function () {
    var field = new Tetra.Field(8, 0, 10, 21, 'map');
    var config = new Tetra.Game.DefaultConfig();
    config.goal = new Phaser.Rectangle(18 * field.tileSize, field.tileSize, 6 * field.tileSize, 4 * field.tileSize);

    Tetra.Game.call(this, field, Tetra.Iterative.getPlayer(), config);

    this.nextScreen = function () {
        this.state.start('Upgrade', true, false, this.player);
    };
};


Tetra.Iterative.prototype = Object.create(Tetra.Game.prototype);
Tetra.Iterative.prototype.constructor = Tetra.Game;

var iterativeDefaultData = {
    upgrades: {
        shooting: 0,
        running: 0,
        jumping: 0
    },
    points: 0
};

Tetra.Iterative.getPlayer = function () {
    var playerData = localStorage.getItem('iterative.player.data');
    var player = Tetra.Game.defaultPlayer();

    if (playerData) {
        player.data = JSON.parse(playerData);
    } else {
        player.data = iterativeDefaultData;
    }

    return player;
};