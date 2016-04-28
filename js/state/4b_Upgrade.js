Tetra.Upgrade = function () {
    var player = null;
    
    this.init = function (passedPlayer) {
        player = passedPlayer;
    };

    this.create = function () {
        // build gui
    };
    
    this.save = function () {
        localStorage.setItem('iterative.player.data', JSON.stringify(player));
    };
};