class MyGame extends Phaser.Scene {
    constructor() {
        super();
        this.maxSpeed = 600;
        this.currentSpeed = 0;
        this.jumping = false;
    }

    preload() {
        this.load.setBaseURL('http://localhost:88/miolo');
        this.load.image('back', 'assets/back.png');

        this.load.image('tiles', 'assets/map.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');

        this.load.image('tiles2', 'assets/ground.png');
        this.load.tilemapTiledJSON('map2', 'assets/ground.json');

        this.load.spritesheet('player', 'assets/rod.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    render() {
        game.debug.cameraInfo(game.camera, 32, 32);
        game.debug.spriteCoords(player, 32, 500);
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
        //this.player.body.bounce.set(0.3);
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
    }

    update_player() {
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
                    this.currentSpeed > 200 ? -400 : -250
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
                .setSize(30, 30, false)
                .setOffset(this.player.frame.x, this.player.frame.y + 16);
        }

        if (this.cursors.down.isUp) {
            this.player.body
                .setSize(30, 46, false)
                .setOffset(this.player.frame.x, this.player.frame.y);
        }

        if (this.cursors.replay.isDown) {
            this.currentSpeed = 0;
            this.player.setVelocityX(-4000);
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
            debug: true,
        },
    },
};

const game = new Phaser.Game(config);
