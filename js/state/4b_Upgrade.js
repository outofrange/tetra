Tetra.Upgrade = function () {
    var that = this;

    var player = null;
    var margin = 15;

    this.init = function (passedPlayer) {
        player = passedPlayer;
    };

    this.create = function () {
        this.world.setBounds(0, 0, 800, 800);
        this.stage.backgroundColor = '#000';

        var saveAndContinueBtn = new Tetra.Button(this, 0, 0, 250, 75, 'Save & Continue');
        saveAndContinueBtn.x = this.world.width - saveAndContinueBtn.width - margin;
        saveAndContinueBtn.y = this.world.height - saveAndContinueBtn.height - margin;

        saveAndContinueBtn.setOnClick(function () {
            this.save();

            this.state.start('Iterative');
        }, this);
        this.add.existing(saveAndContinueBtn);

        var currentY = this.add.text(15, 15, 'Upgrade!', Tetra.style.text.heading).bottom;
        var totalCredits = this.add.text(15, currentY + margin, '', Tetra.style.text.normal);
        totalCredits.update = function () {
            this.text = 'Total credits: ' + player.points;
        };
        currentY = totalCredits.bottom;
        currentY += 4 * margin;


        currentY = this.addUpgradable(margin, currentY, 'Shooting: ', function () {
                return player.data.upgrades.shooting;
            }, function () {
                var cost = that.costFunction(player.data.upgrades.shooting);
                if (player.points > cost) {
                    player.points -= cost;
                    player.data.upgrades.shooting++;
                }
            }).bottom + 2 * margin;

        currentY = this.addUpgradable(margin, currentY, 'Jumping: ', function () {
                return player.data.upgrades.jumping;
            }, function () {
                var cost = that.costFunction(player.data.upgrades.jumping);
                if (player.points > cost) {
                    player.points -= cost;
                    player.data.upgrades.jumping++;
                }
            }).bottom + 2 * margin;

        this.addUpgradable(margin, currentY, 'Running: ', function () {
            return player.data.upgrades.running;
        }, function () {
            var cost = that.costFunction(player.data.upgrades.running);
            if (player.points > cost) {
                player.points -= cost;
                player.data.upgrades.running++;
            }
        });
    };

    this.costFunction = function (currentVal) {
        return (100000 - 5000) / 10 * currentVal + 5000;
    };

    this.save = function () {
        localStorage.setItem('iterative.player.data', JSON.stringify(player.data));
    };

    this.addUpgradable = function (x, y, textString, paramGetter, btnCallback) {
        var enoughCredits = function () {
            return player.points > that.costFunction(paramGetter());
        };

        var text = this.add.text(x, y, 'Shooting: ' + paramGetter(), Tetra.style.text.normal);
        text.update = function () {
            this.text = textString + paramGetter();
        };

        var btnSize = text.height;
        var btn = new Tetra.Button(this, 0, 0, btnSize, btnSize, '+');
        btn.x = text.right + 2 * margin;
        btn.y = y;
        btn.setOnClick(btnCallback, this);
        btn.update = function () {
            this.visible = enoughCredits();
        };
        this.add.existing(btn);


        var price = this.add.text(btn.right + margin, y, '', Tetra.style.text.normal);
        price.update = function () {
            this.visible = enoughCredits();
            this.text = '(Costs ' + that.costFunction(paramGetter()) + ')';
        };

        return text;
    };
};