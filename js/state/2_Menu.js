Tetra.menu = function () {
    var margin = 15;

    this.create = function () {
        console.log('Creating menu');

        showNameInput();

        this.world.setBounds(0, 0, 800, 800);
        this.stage.backgroundColor = '#000';

        var arcadeModeBtn = new Tetra.Button(this, 0, 0, 250, 75, 'Start Arcade');
        arcadeModeBtn.x = this.world.width - arcadeModeBtn.width - margin;
        arcadeModeBtn.y = margin;

        arcadeModeBtn.setOnClick(function () {
            Tetra.Player.name = getNameAndHide();

            this.state.start('Arcade');
        }, this);
        this.add.existing(arcadeModeBtn);


        var incrementalModeBtn = new Tetra.Button(this, 0, 0, 250, 75, 'Start Incremental');
        incrementalModeBtn.x = this.world.width - incrementalModeBtn.width - margin;
        incrementalModeBtn.y = this.world.height - incrementalModeBtn.height - margin;

        incrementalModeBtn.setOnClick(function () {
            Tetra.Player.name = getNameAndHide();

            this.state.start('Iterative');
        }, this);
        this.add.existing(incrementalModeBtn);


        this.add.text(margin, margin, 'Welcome to Tetra!', Tetra.style.text.heading);

        var description = "The idea is pretty simple.\n" +
            "You know Tetris? Just wait for falling blocks and\n" +
            "build your way to the goal in the upper right corner.\n" +
            "\n" +
            "Oh. You can shoot with your left mouse button.\n" +
            "And walk with 'A' and 'D'. And jump. With space. Of course.\n" +
            "\n" +
            "As long as blocks are falling, you can destroy them without any penalty.\n" +
            "When they touch the ground you'll get points, when you shoot resting\n" +
            "blocks you will lose some. And completing rows and reaching the goal\n" +
            "gives also some nice extra points.\n" +
            "\n" +
            "Arcade is harder, but you can upload your score!\n" +
            "Incremental should be easier. And you can upgrade your weapon \\o/\n" +
            "\n" +
            "Idea: search for 'tetris vs. contra' on YouTube\n" +
            "Music: ozzed.net has some pretty nice tracks!";

        var normal = this.add.text(0,0, description, Tetra.style.text.normal);
        normal.setTextBounds(margin, arcadeModeBtn.bottom + margin, this.world.width - 2 * margin,
            incrementalModeBtn.top - arcadeModeBtn.bottom - margin);
    };

    var showNameInput = function () {
        var field = document.getElementById('playerName');
        field.value = Tetra.Player.name;
        field.removeAttribute('class');
    };

    var getNameAndHide = function () {
        var field = document.getElementById('playerName');
        var value = field.value;
        field.setAttribute('class', 'hidden');

        if (value && value != '') {
            localStorage.setItem('playerName', value);
        }

        return value;
    };
};


