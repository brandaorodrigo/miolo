// stage by url ================================================================

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('o')) {
    let stageParam = urlParams.get('o').replace(/[^0-9]/g, '');
    if (stageParam.length > 120) stageParam = stageParam.slice(0, 119);
    window.localStorage.setItem('stage', stageParam);
}

// stage by storage ============================================================

let stage = window.localStorage.getItem('stage')
    ? window.localStorage.getItem('stage')
    : '';

// record by stage =============================================================

let record = window.localStorage.getItem(stage);

let score = null;

function stage_create() {
    let stageTemp = '';
    for (let i = 0; i < 20; i++) {
        const number = Phaser.Math.Between(1, 6);
        stageTemp = stageTemp + '' + number;
        const zeros = Phaser.Math.Between(0, 3);
        for (z = 0; z < zeros; z++) stageTemp = stageTemp + '0';
    }
    window.localStorage.setItem('stage', stageTemp);
    stage = stageTemp;
    record = window.localStorage.getItem(stageTemp);
    window.history.pushState(null, null, '/?o=' + stageTemp);
}

class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        // config ==============================================================

        const { width, height } = this.sys.game.canvas;
        this.physics.world.setFPS(44);

        if (score !== null) {
            this.scoreText = this.add.text(
                width / 2 - 300,
                100,
                'SEU TEMPO FOI ' + score,
                {
                    font: '40px Courier New',
                    fill: '#a86',
                }
            );
        }

        if (record != null) {
            this.recordText = this.add.text(
                width / 2 - 300,
                200,
                'SEU RECORDE ATUAL É ' + record,
                {
                    font: '30px Courier New',
                    fill: '#000',
                }
            );
        }

        if (record === score) {
            this.recordText = this.add.text(
                width / 2 - 300,
                200,
                'NOVO RECORDE!',
                {
                    font: '70px Courier New',
                    fill: '#000',
                }
            );
        }

        if (record != null) {
            this.shareText = this.add.text(
                width / 2 - 300,
                300,
                'APERTE S PARA COMPARTILHAR ESTE ESTÁGIO E DESAFIAR UM AMIGO',
                {
                    font: '30px Courier New',
                    fill: '#f0f',
                }
            );

            this.startText = this.add.text(
                width / 2 - 300,
                400,
                'APERTE ENTER PARA TENTAR DE NOVO',
                {
                    font: '30px Courier New',
                    fill: '#0f0',
                }
            );
        } else {
            this.startText = this.add.text(
                width / 2 - 300,
                300,
                'APERTE ENTER PARA JOGAR',
                {
                    font: '30px Courier New',
                    fill: '#0f0',
                }
            );
        }

        this.createText = this.add.text(
            width / 2 - 300,
            500,
            'APERTE C PARA GERAR UM NOVO ESTÁGIO',
            {
                font: '30px Courier New',
                fill: '#00f',
            }
        );

        // cursor ==============================================================

        this.cursors = this.input.keyboard.addKeys({
            start: Phaser.Input.Keyboard.KeyCodes.ENTER,
            generate: Phaser.Input.Keyboard.KeyCodes.C,
            share: Phaser.Input.Keyboard.KeyCodes.S,
        });
    }

    update() {
        if (this.cursors.start.isDown) {
            this.startText.setText('PREPASE-SE...');
            this.time.addEvent({
                delay: 2000,
                loop: false,
                callback: () => {
                    this.scene.start('Game');
                },
            });
        }

        if (this.cursors.generate.isDown) {
            this.startText.setText('GERANDO NOVO ESTÁGIO...');
            stage_create();
            this.time.addEvent({
                delay: 2000,
                loop: false,
                callback: () => {
                    this.scene.restart();
                },
            });
        }
    }
}

class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.maxSpeed = 2200;
        this.currentSpeed = 0;
        this.jumping = false;
        this.allTime = 0;
        this.timer = new Phaser.Time.TimerEvent();
    }

    preload() {
        // scenario ============================================================

        this.load.image('sky', 'assets/sky.png');
        this.load.image('back', 'assets/back.png');
        this.load.image('tiles', 'assets/map.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        this.load.image('tiles2', 'assets/ground.png');
        this.load.tilemapTiledJSON('map2', 'assets/ground.json');
        this.load.image('first', 'assets/first.png');
        this.load.image('mount', 'assets/mount.png');

        // ground ==============================================================

        this.load.spritesheet('ground', 'assets/ground.png', {
            frameWidth: 500,
            frameHeight: 50,
        });

        // player ==============================================================

        this.load.spritesheet('player', 'assets/sk8r.png', {
            frameWidth: 50,
            frameHeight: 100,
        });

        // finish ==============================================================

        this.load.spritesheet('finish', 'assets/finish.png', {
            frameWidth: 300,
            frameHeight: 300,
        });

        // obstacle ============================================================

        this.load.spritesheet('50x50', 'assets/obstacle.png', {
            frameWidth: 50,
            frameHeight: 50,
        });

        this.load.spritesheet('100x100', 'assets/obstacle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });

        this.load.spritesheet('50x50_air', 'assets/obstacle.png', {
            frameWidth: 50,
            frameHeight: 50,
        });

        this.load.spritesheet('100x100_air', 'assets/obstacle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });

        this.load.spritesheet('200x100', 'assets/obstacle.png', {
            frameWidth: 200,
            frameHeight: 100,
        });

        this.load.spritesheet('400x50', 'assets/obstacle.png', {
            frameWidth: 400,
            frameHeight: 50,
        });
    }

    create() {
        // config ==============================================================

        const { width, height } = this.sys.game.canvas;
        this.physics.world.setFPS(44);

        // player ==============================================================

        const playerX = width / 3;
        this.player = this.physics.add.sprite(playerX, height - 100, 'player');
        this.cameras.main.startFollow(this.player, false, 1, 1, playerX * -1);
        this.player.setCollideWorldBounds(true).setDepth(30);

        // ground ==============================================================

        const ground = this.physics.add.staticGroup();
        let groundWidth = 250;
        for (let i = 0; i < 200; i++) {
            const current = ground.create(groundWidth, height - 25, 'ground');
            current.body.updateFromGameObject();
            groundWidth += 500;
        }
        this.cameras.main.setBounds(0, 0, groundWidth - 500, height);
        this.physics.world.bounds.width = groundWidth - 500;
        this.physics.world.bounds.height = height;
        this.physics.add.collider(this.player, ground);
        ground.setDepth(20);

        // obstacle ============================================================

        const obstacle = this.physics.add.staticGroup();
        let obstacleX = 2200;
        let countZeros = 0;
        for (let i = 0; i < stage.length; i++) {
            const number = Number(stage[i]);

            let x = 0;
            let y = 0;
            let obs = '';

            if (number === 1) {
                x = 25;
                y = 75;
                obs = '50x50';
            }

            if (number === 2) {
                x = 50;
                y = 100;
                obs = '100x100';
            }

            if (number === 3) {
                x = 25;
                y = 150;
                obs = '50x50_air';
            }

            if (number === 4) {
                x = 50;
                y = 175;
                obs = '100x100_air';
            }

            if (number === 5) {
                x = 100;
                y = 100;
                obs = '200x100';
            }

            if (number === 6) {
                x = 200;
                y = 75;
                obs = '400x50';
            }

            if (number !== 0 && obs !== '') {
                countZeros = 0;
                obstacleX += x + 250;
                const current = obstacle.create(obstacleX, height - y, obs);
                current.body.updateFromGameObject();
                obstacleX += x + 250;
            }

            if (number === 0 && countZeros < 3) {
                countZeros += 1;
                obstacleX += 250;
            }
        }

        this.physics.add.collider(obstacle, this.player, () => {
            this.update_reset();
        });

        obstacle.setDepth(20);

        // finish ==============================================================

        const finish = this.physics.add.staticSprite(
            obstacleX + 1000,
            height - 200,
            'finish'
        );
        finish.setDepth(20);
        this.physics.add.collider(finish, this.player, () => {
            score = this.allTime;
            if (Number(score) < Number(record)) {
                record = score;
                window.localStorage.setItem(stage, String(score));
            }
            this.update_reset();
            this.scene.start('Menu');
        });

        // sky =================================================================

        this.cameras.main.setBackgroundColor(0xdcdcdc);
        this.add
            .tileSprite(0, height - 300, width * 10, 500, 'sky')
            .setScrollFactor(0.05)
            .setDepth(10);

        // cursors =============================================================

        this.cursors = this.input.keyboard.addKeys({
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.W,
            replay: Phaser.Input.Keyboard.KeyCodes.ENTER,
            exit: Phaser.Input.Keyboard.KeyCodes.ESC,
        });

        // text ================================================================

        this.scoreText = this.add
            .text(6, height - 300, '00:00,0', {
                font: '30px Courier New',
                fill: '#000',
            })
            .setDepth(70);

        this.recordText = this.add
            .text(320, height - 300, record, {
                font: '10px Courier New',
                fill: '#000',
            })
            .setDepth(70);

        this.trigger = this.time.addEvent({
            callback: () => {
                if (this.currentSpeed > 0) {
                    this.allTime += 1;
                    const fix_allTime = new Date(this.allTime * 10);
                    this.scoreText.setText(
                        fix_allTime.getMinutes() +
                            ':' +
                            fix_allTime.getSeconds() +
                            ',' +
                            String(fix_allTime.getMilliseconds())
                    );
                }
            },
            callbackScope: this,
            delay: 10,
            loop: true,
        });
    }

    update() {
        this.update_player();

        if (this.cursors.replay.isDown) {
            this.update_reset();
        }

        if (this.cursors.exit.isDown) {
            this.update_reset();
            score = null;
            this.scene.start('Menu');
        }

        if (this.currentSpeed !== 0) {
            this.scoreText.setPosition(this.player.x - 30, 85);
            this.recordText.setPosition(this.player.x + 100, 85);
        }
    }

    update_player() {
        if (this.cursors.right.isDown && this.player.body.onFloor()) {
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed += this.currentSpeed < 50 ? 0.5 : 1;
                this.player.setVelocityX(this.currentSpeed);
            }
        }

        if (this.cursors.right.isUp && this.player.body.onFloor()) {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 0.5;
                this.player.setVelocityX(this.currentSpeed);
            } else {
                this.currentSpeed = 0;
            }
        }

        if (this.cursors.left.isDown && this.player.body.onFloor()) {
            if (this.currentSpeed !== 0) {
                this.currentSpeed -= 4;
                if (this.currentSpeed < 0) {
                    this.currentSpeed = 0;
                }
            }
        }

        if (this.cursors.jump.isDown) {
            if (!this.jumping && this.player.body.onFloor()) {
                this.jumping = true;
                this.player.body.setVelocityY(
                    this.currentSpeed > 300 ? -525 : -425
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
                .setSize(50, 70, false)
                .setOffset(this.player.frame.x, this.player.frame.y + 30);
        }

        if (this.cursors.down.isUp) {
            this.player.body
                .setSize(50, 100, false)
                .setOffset(this.player.frame.x, this.player.frame.y);
        }
    }

    update_reset() {
        this.currentSpeed = 0;
        this.player.setVelocityX(0);
        this.allTime = 0;
        this.scene.restart();
    }
}

const config = {
    type: Phaser.CANVAS,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    backgroundColor: '0xffffff',
    parent: 'game',
    scene: [Menu, Game],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false,
        },
    },
};

const game = new Phaser.Game(config);
