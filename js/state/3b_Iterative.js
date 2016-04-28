Tetra.Iterative = function () {
    var field = new Tetra.Field(8, 0, 10, 20, 'map');
    var config = new Tetra.Game.DefaultConfig();
    config.goal = new Phaser.Rectangle(18 * field.tileSize, field.tileSize, 6 * field.tileSize, 4 * field.tileSize);

    Tetra.Game.call(this, field, Tetra.Iterative.getPlayer(), config);

    this.nextScreen = function () {
        this.state.start('Upgrade', true, false, this.player);
    };
};


Tetra.Iterative.prototype = Object.create(Tetra.Game.prototype);
Tetra.Iterative.prototype.constructor = Tetra.Game;

var playerTemp = {};
_.extend(playerTemp, Tetra.Game.Player);

Tetra.Iterative.getPlayer = function () {
    var playerData = localStorage.getItem('iterative.player.data');
    var player = _.extend({}, playerTemp);
    
    if (playerData) {
        player.data = JSON.parse(playerData);
    }
    
    return player;
};