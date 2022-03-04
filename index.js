//const stage = 'teste se os estagios vao ficar randomicos mesmo';

const stage = 'rafael';

let fix_stage = stage.toLowerCase().replace(/[^A-Za-z]/g, '');
if (fix_stage.length > 40) fix_stage = fix_stage.slice(0, 40);

/*
while (fix_stage.length < 40) {
    let temp = fix_stage.split('');
    let reverse = temp.reverse();
    fix_stage += reverse.join('');
}
*/

const index_alpha = 'abcdefghijklmnopqrstuvwxyz';
const index_alpha2 = '01230123012301230123012301';
const index_alpha3 = '65432106543210654321065432';

const decode = [];
for (let i = 0; i < fix_stage.length; ++i) {
    const index = index_alpha.indexOf(fix_stage.charAt(i));
    decode.push({
        distance: Number(index_alpha3.charAt(index)),
        type: Number(index_alpha2.charAt(index)),
    });
}

/*
for (let i = 0; i < 40; ++i) {
    const distance = Phaser.Math.Between(3, 19);
    const type = Phaser.Math.Between(1, 4);
    decode.push({ distance, type });
}
*/

let record = window.localStorage.getItem(stage)
    ? Number(window.localStorage.getItem(stage))
    : 0;

console.log(decode);

class MyGame extends Phaser.Scene {
    constructor() {
        super();
        this.maxSpeed = 600;
        this.currentSpeed = 0;
        this.jumping = false;
        this.allSpeed = 0;
        this.allTime = 0;
        this.timer = new Phaser.Time.TimerEvent();
    }

    preload() {
        this.load.setBaseURL('//localhost:88/miolo/');
        this.load.image('back', 'assets/back.png');

        this.load.image('tiles', 'assets/map.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');

        this.load.image('tiles2', 'assets/ground.png');
        this.load.tilemapTiledJSON('map2', 'assets/ground.json');

        this.load.spritesheet('obstacle', 'assets/obstacle.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet('obstacle2', 'assets/obstacle.png', {
            frameWidth: 32,
            frameHeight: 64,
        });

        this.load.spritesheet('player', 'assets/rod.png', {
            frameWidth: 64,
            frameHeight: 32,
        });

        this.load.spritesheet('end', 'assets/end.png', {
            frameWidth: 32,
            frameHeight: 96,
        });
    }

    create() {
        this.add
            .tileSprite(0, 16, 10000, 240, 'back')
            .setOrigin(0, 0)
            .setScrollFactor(0.2);

        const map = this.make.tilemap({ key: 'map2' });

        const tileset = map.addTilesetImage('ground', 'tiles2');
        const ground = map.createLayer('ground', tileset, 0, 0);
        //const collider = map.createLayer('colider', tileset, 0, 0);
        //const fundo = map.createLayer('fundo', tileset, 0, 0);
        //fundo.setDepth(10);

        ground.setCollisionByProperty({ collider: true });

        this.physics.world.setFPS(44);
        this.physics.world.bounds.width = ground.width;
        this.physics.world.bounds.height = ground.height;

        this.player = this.physics.add.sprite(40, 240, 'player');
        this.player.body.bounce.set(0.3);
        this.player.setCollideWorldBounds(true);

        //collider.setCollisionByProperty({ collider: true });
        //this.physics.add.collider(this.player, collider);
        this.physics.add.collider(this.player, ground);

        this.cameras.main.startFollow(this.player, false, 1, 1, -100);

        this.cameras.main.setBounds(
            0,
            0,
            ground.layer.widthInPixels,
            ground.layer.heightInPixels,
            true
        );

        // configura controles

        this.cursors = this.input.keyboard.addKeys({
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.W,
            replay: Phaser.Input.Keyboard.KeyCodes.R,
        });

        /*
        this.cursors = this.input.keyboard.addKeys({
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
            replay: Phaser.Input.Keyboard.KeyCodes.R,
        });
        */

        const platforms = this.physics.add.staticGroup();

        let last_obstacle = 300;

        //for (let i = 0; i < 40; ++i) {
        //const obstacle_distance = Phaser.Math.Between(300, 1000);
        //const obstacle_type = Phaser.Math.Between(1, 4);
        decode.forEach(({ distance, type }) => {
            let y = 280;
            let obs = 'obstacle';

            if (type === 0) {
                y = 280;
                obs = 'obstacle';
            }

            if (type === 1) {
                y = 260;
                obs = 'obstacle2';
            }

            if (type === 2) {
                y = 240;
                obs = 'obstacle';
            }

            if (type === 3) {
                y = 220;
                obs = 'obstacle2';
            }

            last_obstacle += distance * 81;
            const platform = platforms.create(last_obstacle, y, obs);
            const body = platform.body;
            body.updateFromGameObject();
        });
        //}

        this.physics.add.collider(platforms, this.player, () => {
            this.currentSpeed = 0;
            this.player.setVelocityX(0);
            this.score = 0;
            this.allSpeed = 0;
            this.allTime = 0;
            this.scene.restart();
        });

        let end = this.physics.add.staticSprite(
            last_obstacle + 300,
            240,
            'end'
        );

        this.physics.add.collider(end, this.player, () => {
            if (this.score > record) {
                record = this.score;
                window.localStorage.setItem(stage, String(record));
            }
            this.currentSpeed = 0;
            this.player.setVelocityX(0);
            this.score = 0;
            this.allSpeed = 0;
            this.allTime = 0;
            this.scene.restart();
        });

        this.scoreText = this.add.text(6, 85, this.score, {
            font: '30px Arial',
            fill: '#000',
        });

        this.recordText = this.add.text(320, 85, record, {
            font: '10px Arial',
            fill: '#000',
        });

        this.scoreText.setText(this.score);

        this.trigger = this.time.addEvent({
            callback: this.timer_score,
            callbackScope: this,
            delay: 300, // 1000 = 1 second
            loop: true,
        });
    }

    timer_score() {
        this.allSpeed += this.currentSpeed;
        this.allTime += 1;
        const media = this.allSpeed / this.allTime;
        this.score = (media * 100) / 600;
        if (this.score < 1) this.score = 0;
        this.scoreText.setText(this.score.toFixed(2) + ' %');
        //this.scoreText.setText(this.player.x);
    }

    update_player() {
        if (this.currentSpeed !== 0) {
            this.scoreText.setPosition(this.player.x - 30, 85);
            this.recordText.setPosition(this.player.x + 100, 85);
        }

        if (this.cursors.right.isDown) {
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed += 1;
                this.player.setVelocityX(this.currentSpeed);
            }
        }

        if (this.cursors.right.isUp) {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 0.5;
                this.player.setVelocityX(this.currentSpeed);
            } else {
                this.currentSpeed = 0;
            }
        }

        if (this.cursors.left.isDown) {
            if (this.currentSpeed !== 0) {
                this.currentSpeed -= 2;
                if (this.currentSpeed < 0) {
                    this.currentSpeed = 0;
                }
            }
        }

        if (this.cursors.jump.isDown) {
            if (!this.jumping && this.player.body.onFloor()) {
                this.jumping = true;
                this.player.body.setVelocityY(
                    this.currentSpeed > 200 ? -390 : -270
                );
            }
        }

        if (this.cursors.jump.isUp) {
            if (this.jumping && this.player.body.onFloor()) {
                this.jumping = false;
            }
        }

        if (this.cursors.down.isDown) {
            this.player.body
                .setSize(22, 32, false)
                .setOffset(this.player.frame.x + 5, this.player.frame.y + 28);
        }

        if (this.cursors.down.isUp) {
            this.player.body
                .setSize(22, 42, false)
                .setOffset(this.player.frame.x + 5, this.player.frame.y + 18);
        }

        if (this.cursors.replay.isDown) {
            this.currentSpeed = 0;
            this.player.setVelocityX(0);
            this.score = 0;
            this.allSpeed = 0;
            this.allTime = 0;
            this.scene.restart();
        }
    }

    update() {
        this.update_player();
    }
}

const config = {
    type: Phaser.CANVAS,
    pixelArt: true,
    width: 384,
    height: 240,
    zoom: 2,
    backgroundColor: '0xffffff',
    parent: 'game',
    scene: MyGame,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false,
        },
    },
};

const game = new Phaser.Game(config);
