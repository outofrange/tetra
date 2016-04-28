Tetra.Iterative = function () {
    var field = new Tetra.Field(8, 0, 10, 39, 'map');

    Tetra.Game.call(this, field, Tetra.Iterative.Player);
};


Tetra.Iterative.prototype = Object.create(Tetra.Game.prototype);
Tetra.Iterative.prototype.constructor = Tetra.Game;

Tetra.Iterative.prototype._create = Tetra.Iterative.prototype.create;
Tetra.Iterative.prototype.create = function () {
    this._create();
    console.log("lolz");
};

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