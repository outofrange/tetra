Tetra.Arcade = function () {
    var field = new Tetra.Field(8, 0, 10, 39, 'map_xl');
    var config = new Tetra.Game.DefaultConfig();

    Tetra.Game.call(this, field, new Tetra.Arcade.Player(), config);

    this.nextScreen = function () {
        this.state.start('Highscore', true, false, !this.debug ? this.player.points : 0);
    };
};


Tetra.Arcade.prototype = Object.create(Tetra.Game.prototype);
Tetra.Arcade.prototype.constructor = Tetra.Game;

Tetra.Arcade.Player = {
    data: {
        name: getPlayerName(),
        _points: 0
    },
    set points(value) {
        this._points = value >= 0 ? value : 0;
    },
    get points() {
        return this._points;
    }
};