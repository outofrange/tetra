Tetra.Iterative = function () {
    var field = new Tetra.Field(8, 0, 10, 21, 'map');
    var config = new Tetra.Game.DefaultConfig();
    var player = Tetra.Iterative.getPlayer();

    config.goal = new Phaser.Rectangle(18 * field.tileSize, field.tileSize, 6 * field.tileSize, 4 * field.tileSize);

    var shooting = linearFunction(500, 2500, 10);
    var running = linearFunction(300, 750, 10);
    var jumping = linearFunction(4, 2.5, 10);

    config.shootingSpeed = function () {
        return shooting(player.data.upgrades.shooting);
    };
    config.runningSpeed = function () {
        return running(player.data.upgrades.running);
    };
    config.jumpingSpeed = function () {
        return jumping(player.data.upgrades.jumping);
    };

    Tetra.Game.call(this, field, player, config);

    this.nextScreen = function () {
        this.state.start('Upgrade', true, false, this.player);
    };
};


Tetra.Iterative.prototype = Object.create(Tetra.Game.prototype);
Tetra.Iterative.prototype.constructor = Tetra.Game;

Tetra.Iterative.iterativeDefaultData = {
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
        player.data = Tetra.Iterative.iterativeDefaultData;
    }

    return player;
};