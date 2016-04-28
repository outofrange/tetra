Tetra.Arcade = function () {
    var field = new Tetra.Field(8, 0, 10, 39, 'map_xl');
    var config = new Tetra.Game.DefaultConfig();

    Tetra.Game.call(this, field, Tetra.Arcade.Player, config);
};


Tetra.Arcade.prototype = Object.create(Tetra.Game.prototype);
Tetra.Arcade.prototype.constructor = Tetra.Game;

Tetra.Arcade.Player = {
    name: pick(localStorage.getItem('playerName'), 'anonymous'),
    _points: 0,
    set points(value) {
        Tetra.Player.arcade._points = value >= 0 ? value : 0;
    },
    get points() {
        return Tetra.Player.arcade._points;
    }
};