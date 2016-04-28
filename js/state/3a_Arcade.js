Tetra.Arcade = function () {
    var field = new Tetra.Field(8, 0, 10, 39, 'map_xl');
    var config = new Tetra.Game.DefaultConfig();

    Tetra.Game.call(this, field, Tetra.Game.defaultPlayer(), config);

    this.nextScreen = function () {
        this.state.start('Highscore', true, false, !this.debug ? this.player.points : 0);
    };
};


Tetra.Arcade.prototype = Object.create(Tetra.Game.prototype);
Tetra.Arcade.prototype.constructor = Tetra.Game;

Tetra.Arcade.prototype.origCreate = Tetra.Arcade.prototype.create;
Tetra.Arcade.prototype.create = function () {
    this.origCreate();
    this.player.points = 0;
};