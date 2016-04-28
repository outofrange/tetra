Tetra.Highscore = function () {
    var that = this;
    var currentScore;

    var highscoreBaseUrl = 'https://www.outofrange.org/tetra';

    var style = Tetra.style.text.highscore;
    var rowHeight = 32;
    var margin = 16;

    this.createTable = function (left, top, right, entries, heading) {
        this.add.text(left + margin, top, heading, Tetra.style.text.heading);

        for (var i = 0; i < entries.length; i++) {
            var rowY = (rowHeight + margin) * (i + 1) + top;
            var rowX = left + margin;
            var entry = entries[i];

            if (entry.fresh) {
                var graphics = this.add.graphics(rowX, rowY + rowHeight / 2);
                graphics.beginFill(0xFF0000, 1);
                graphics.drawCircle(0, 0, 20);

                rowX += 30;
            }

            this.add.text(rowX, rowY, entry.name, style.name);

            var scoreText = this.add.text(0, rowY, entry.score, style.score);
            scoreText.x = right - margin - scoreText.width;
        }
    };

    this.init = function (score) {
        console.log('Showing highscore');

        currentScore = score;
    };

    var getLocalHighscore = function () {
        var local = JSON.parse(localStorage.getItem('tetra.highscore'));

        return local != null ? local : [];
    };

    var saveLocalHighscore = function (completeHighscore) {
        var saving = [];

        completeHighscore.forEach(function (entry) {
            saving.push(_.pick(entry, ['name', 'score']));
        });

        localStorage.setItem('tetra.highscore', JSON.stringify(saving));
    };

    var processHighscore = function (name, score, loadHighscore, saveHighscore, show) {
        show = pick(show, 5);

        var newEntry = {name: name, score: score, fresh: true};
        var combined = _.reverse(_.sortBy(_.concat(loadHighscore(), newEntry), 'score'));

        var showedHighscore = _.take(combined, show);

        if (saveHighscore) {
            saveHighscore(newEntry, showedHighscore);
        }

        return showedHighscore;
    };

    var sendToGlobalHighscore = function (newEntry) {
        console.log('Submitting highscore...');

        qwest.post(highscoreBaseUrl + '/highscore/send.php', newEntry)
            .then(function () {
                console.log('...successfully submitted!');
            })
            .catch(function (e, xhr, response) {
                console.log('...error while submitting highscore!');
                console.log(response);
            });
    };

    var requestGlobalHighscore = function () {
        console.log('Requesting highscore...');

        qwest.get(highscoreBaseUrl + '/highscore/get.php')
            .then(function (xhr, response) {
                console.log('...successfully requested!');

                var highscore = processHighscore(getPlayerName(), currentScore, function () {
                    return JSON.parse(response);
                }, sendToGlobalHighscore, 6);

                that.createTable(10, 10, that.game.width - 10, highscore, 'Global highscore');
            });
    };

    this.create = function () {
        this.world.setBounds(0, 0, 800, 800);
        this.stage.backgroundColor = '#000';

        requestGlobalHighscore();

        var local = processHighscore(getPlayerName(), currentScore, getLocalHighscore, _.flip(saveLocalHighscore), 4);
        this.createTable(10, this.game.height / 2 + 10, this.game.width - 10, local, 'Local highscore');

        var playAgainBtn = new Tetra.Button(this, 0, 0, 250, 75, 'Play again');
        playAgainBtn.x = this.world.width / 2 - playAgainBtn.width / 2;
        playAgainBtn.y = this.world.height - playAgainBtn.height - margin;

        playAgainBtn.setOnClick(function () {
            this.state.start('Arcade');
        }, this);
        this.add.existing(playAgainBtn);

        var menuBtn = new Tetra.Button(this, 0, 0, 200, 75, 'Menu');
        menuBtn.x = this.world.width / 2 - menuBtn.width / 2;
        menuBtn.y = playAgainBtn.top - menuBtn.height - margin;

        menuBtn.setOnClick(function () {
            this.state.start('Menu');
        }, this);
        this.add.existing(menuBtn);
    };
};


