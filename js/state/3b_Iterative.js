Tetra.Iterative = function () {
    var field = new Tetra.Field(8, 0, 10, 39, 'map');
    var config = new Tetra.Game.DefaultConfig();

    Tetra.Game.call(this, field, Tetra.Iterative.getPlayer(), config);
};


Tetra.Iterative.prototype = Object.create(Tetra.Game.prototype);
Tetra.Iterative.prototype.constructor = Tetra.Game;

Tetra.Iterative.getPlayer = function () {
    var player = localStorage.getItem('iterative.player');

    if (player) {
        return JSON.parse(player);
    } else {
        return Tetra.Iterative.Player;
    }
};

Tetra.Iterative.Player = {
    name: getPlayerName(),
    _points: 0,
    set points(value) {
        Tetra.Iterative.Player._points = value >= 0 ? value : 0;
    },
    get points() {
        return Tetra.Iterative.Player._points;
    }
};