var game = new Phaser.Game(384, 435, Phaser.CANVAS, '', null, false, false);
var Breakout = {};

Breakout.Boot = function(game) {
    this.game = game;
};

Breakout.Boot.prototype = {
  
    preload: function() {        
        this.load.spritesheet('bricks', 'assets/bricks.png', 16, 16);
        this.load.spritesheet('brick-shadow', 'assets/brick_shadow.png', 16, 16);
        this.load.image('blue-metal', 'assets/16x16-blue-metal.png');
        game.load.image('goldFont', 'assets/retroFonts/gold_font.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('paddle', 'assets/paddle.png');
        this.load.image('paddle-shadow', 'assets/paddle_shadow.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('ball-shadow', 'assets/ball_shadow.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.image('gameover-bg', 'assets/gameover_bg.png');
        this.load.audio('hit', '/assets/sounds/Open_00.ogg');
        this.load.audio('menu1', '/assets/sounds/Menu_Navigate_00.mp3');
        this.load.audio('menu2', '/assets/sounds/Pickup_01.ogg');
        this.load.audio('miss', '/assets/sounds/Explosion_00.ogg');
        this.load.audio('gameover', '/assets/sounds/Hero_Death_00.ogg');
    },
    
    create: function() {
        this.scale.pageAlignVertically = true;
        this.scale.pageAlignHorizontally = true;
        this.state.start('Menu');
    }    
};

Breakout.Menu = function(game) {
    this.game = game;
};

Breakout.Menu.prototype = {
  
    create: function() {        
        var logo = this.add.image(this.world.centerX, this.world.centerY, 'logo');     
        var texture1 = game.add.retroFont('goldFont', 16, 16, "!     :() ,?." + Phaser.RetroFont.TEXT_SET10, 20, 0, 0);
       // var texture2 = game.add.retroFont('blue-metal', 16, 16, '               0123456789 ABCDEFGHIJKLMNOPQRSTUVXWYZ');
        texture1.text = 'play';
       // texture2.text = 'exit';
        this.playOption = game.add.image(this.world.centerX - 13 * 3, this.world.centerY + 110, texture1);
       // this.creditsOption = game.add.image(this.world.centerX - 16 * 3, this.world.centerY + 150, texture2);
        this.option = game.add.image(this.playOption.x - 20, this.playOption.y, 'ball');
        
        logo.anchor.set(0.5, 0.8);
        this.playOption.anchor.set(0, 0.5);
       // this.creditsOption.anchor.set(0, 0.5);
        this.option.anchor.set(0.5);
        
        this.swapAudio = this.add.audio('menu1');
        this.selectAudio = this.add.audio('menu2');
        this.swapTime = this.time.now + 200;
        this.option.optionId = 0;
    },
    
    update: function() {        
        if (this.time.now < this.swapTime) {
            return;
        }            
        else if (this.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            this.swapOption(-1);
        }
        else if (this.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.swapOption(1);
        }        
        else if (this.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            this.selectOption();
        }
    },
    
    swapOption: function(n) {        
        this.option.optionId += n;
        if (this.option.optionId % 2 === 0) {
            this.option.y = this.playOption.y;
        }
        else {
            this.option.y = this.creditsOption.y;
        }
        this.swapAudio.play();
        this.swapTime = this.time.now + 250;
    },
    
    selectOption: function() {        
        if (this.option.optionId % 2 === 0) {
            this.time.events.loop(100, this.toggleVisibility, this, this.playOption);
            this.time.events.add(500, this.startState, this, 'Game');
        }        
        else {
            this.time.events.loop(100, this.toggleVisibility, this, this.creditsOption);
            this.time.events.add(500, this.startState, this, 'Credits');
        }
        this.selectAudio.play();
        this.swapTime = Infinity;
    },
    
    toggleVisibility: function(image) {
        image.visible = !image.visible;
    },
    
    startState: function(name) {
        this.state.start(name);
    }
};

Breakout.Game = function(game) {
    this.game = game;
};

Breakout.Game.prototype = {
    
    create: function() {
        var background, brick, brickRandom;        
        this.game.physics.startSystem(Phaser.Physics.ARCADE.factory);
        this.game.physics.arcade.checkCollision.down = false;
        
        background = this.add.tileSprite(0, 60, this.game.width, this.game.height, 'background');        
        this.shadows = this.add.group();
        this.shadows.alpha = 0.5;
        this.bricks = this.add.group();
        this.bricks.enableBody = true;
        this.bricks.physicsBodyType = Phaser.Physics.ARCADE.factory;
        for (var y=0; y<7; y++) {
            brickRandom = this.game.rnd.integer() % 50;
            for (var x=0; x<24; x++) {			
                brick = this.bricks.create(x * 16, 16 * 2 + y * 16, 'bricks', brickRandom);
                brick.shadow = this.shadows.create(brick.x + 12, brick.y + 12, 'brick-shadow');
                brick.body.immovable = true;
            }
        }
        
        this.paddle = this.add.sprite(this.game.width/2, this.game.height - 20, 'paddle');
        this.paddle.anchor.set(0.5);
        this.paddle.shadow = this.shadows.create(0, 0, 'paddle-shadow');	
        this.paddle.shadow.anchor.set(0.5);
        this.game.physics.enable(this.paddle, Phaser.Physics.ARCADE);
        this.game.physics.enable(this.paddle.shadow, Phaser.Physics.ARCADE);
        this.paddle.body.collideWorldBounds = true;
        this.paddle.body.immovable = true;
        
        this.ball = this.add.sprite(this.paddle.x, this.paddle.y - 20, 'ball');
        this.ball.anchor.set(0.5);
        this.ball.shadow = this.shadows.create(this.ball.x + 8, this.ball.y + 8, 'ball-shadow');
        this.ball.shadow.anchor.set(0.5);
        this.game.physics.enable(this.ball, Phaser.Physics.ARCADE);
        this.game.physics.enable(this.ball.shadow, Phaser.Physics.ARCADE);
        this.ball.checkWorldBounds = true;
        this.ball.body.collideWorldBounds = true;
        this.ball.body.bounce.set(1);
        this.ball.body.maxVelocity.set(200, 300);
        this.ball.events.onOutOfBounds.add(this.loseBall, this);
        
        var livesFontTexture = this.add.retroFont('goldFont', 16, 16, "!     :() ,?." + Phaser.RetroFont.TEXT_SET10, 20, 0, 0);
        var livesTextImage = this.add.image(20, 15, livesFontTexture);
        livesFontTexture.text = 'lives';
        this.lives = [this.add.image(110, 10, 'ball'),
                this.add.image(140, 10, 'ball'),
                this.add.image(170, 10, 'ball')
        ];
        this.lives[0].scale.set(1.5);
        this.lives[1].scale.set(1.5);
        this.lives[2].scale.set(1.5);
        
        this.score = 0;
        this.scoreFontTexture = this.add.retroFont('blue-metal', 16, 16, '               0123456789 ABCDEFGHIJKLMNOPQRSTUVXWYZ');
        this.scoreFontTexture.text = '0';
        this.scoreTextImage = this.add.image(this.game.width - 10, 15, this.scoreFontTexture);
        this.scoreTextImage.anchor.set(1, 0);
        
        this.hitAudio = this.add.audio('hit');
        this.missAudio = this.add.audio('miss');
        this.gameOverAudio = this.add.audio('gameover');
        this.startTime = this.time.now;
        this.running = false;
    },
    
    update: function() {
        this.ball.shadow.body.x = this.ball.body.x + 8;
        this.ball.shadow.body.y = this.ball.body.y + 8;  
        this.paddle.shadow.body.x = this.paddle.body.x + 8;
        this.paddle.shadow.body.y = this.paddle.body.y + 8;
        this.paddle.body.velocity.set(0);
        var leftDown = this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
        var rightDown = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);        
        if (this.running) {
            if (leftDown) {
                this.paddle.body.velocity.x = -400;
            }
            else if (rightDown) {
                this.paddle.body.velocity.x = 400;
            }        
            this.game.physics.arcade.collide(this.ball, this.paddle, this.ballHitPaddle, null, this);
            this.game.physics.arcade.collide(this.ball, this.bricks, this.ballHitBrick, null, this);
        }
        else {
            if ((leftDown || rightDown)) {	
                this.running = true;
                this.releaseBall();
            }
        }
    },
    
    ballHitPaddle: function(ball, paddle) {
        ball.body.velocity.x += paddle.body.velocity.x * 0.25;
    },
    
    ballHitBrick: function(ball, brick) {
        this.score += 50;
        this.scoreFontTexture.text = String(this.score);
        brick.kill();
        brick.shadow.kill();
        if (this.bricks.countLiving() === 0) {
            this.gameOver();
        }        
        else {
            this.hitAudio.play();  
        }
    },
    
    releaseBall: function(self) {
        this.ball.body.velocity.set(100, 500);
    },
    
    loseBall: function() {        
        this.ball.x = this.paddle.x;
        this.ball.y = this.paddle.y - 20;
        this.ball.body.velocity.set(0);        
        if (this.lives.length > 0) {
            this.lives.pop().destroy();
            this.missAudio.play();
        }        
        else {
            this.gameOver();
        }        
        this.paddle.body.velocity.set(0);
        this.running = false;
    },
    
    gameOver: function() {        
        this.gameOverAudio.play();
        this.ball.kill();
        this.ball.shadow.kill();   
        this.startState('GameOver');
    },
    
    startState: function(name) {
        this.state.start(name, false, false, this.score, this.time.now - this.startTime);
    }
};

Breakout.GameOver = function(game) {
    this.game = game;
};

Breakout.GameOver.prototype = {

    init: function(score, time) {
        this.score = score || 0;
        this.time = time || 0;
        this.time = Math.floor(this.time / 1000);
    },
    
    create: function() {
        var background = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'gameover-bg');
        background.alpha = 0.5;
        var texture1 = this.add.retroFont('goldFont', 16, 16, "!     :() ,?." + Phaser.RetroFont.TEXT_SET10, 20, 0, 0);
        texture1.text = 'score';
        var score = this.add.image(this.world.centerX, this.world.centerY, texture1);
        score.anchor.set(0.5);
        var texture2 = this.add.retroFont('goldFont', 16, 16, "!     :() ,?." + Phaser.RetroFont.TEXT_SET10, 20, 0, 0);
        texture2.text = 'time';
        var time = this.add.image(this.world.centerX, this.world.centerY + 80, texture2);
        time.anchor.set(0.5);
        var scoreText = this.add.text(score.x, score.y + 32, String(this.score), {fill:'#ffff00'});
        scoreText.font = 'consolas', scoreText.fontSize = 24; scoreText.anchor.set(0.5);
        var timeText = this.add.text(time.x, time.y + 32, String(this.time), {fill:'#ffff00'});
        timeText.font = 'consolas'; timeText.fontSize = 24; timeText.anchor.set(0.5);
    },
    
    update: function() {
        if (this.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            this.startState('Menu');
        }
    },
    
    startState: function(name) {
        this.state.start(name);
    }
};



game.state.add('Boot', Breakout.Boot);
game.state.add('Menu', Breakout.Menu);
game.state.add('Game', Breakout.Game);
game.state.add('GameOver', Breakout.GameOver);
game.state.start('Boot');