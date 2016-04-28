Tetra.Iterative = function (game) {
    var field = new Tetra.Field(8, 0, 10, 39, 32);

    Tetra.MainGame.call(this, field, Tetra.Iterative.Player);
};


Tetra.Iterative.prototype = Object.create(Tetra.MainGame.prototype);
Tetra.Iterative.prototype.constructor = Tetra.MainGame;

Tetra.Iterative.Player = {
    name: pick(localStorage.getItem('playerName'), 'anonymous'),
    _points: 0,
    set points(value) {
        Tetra.Player.arcade._points = value >= 0 ? value : 0;
    },
    get points() {
        return Tetra.Player.arcade._points;
    }
};