var Invasion = {
    musica:null,
    laserAud:null
};

Invasion.Menu = function(){}

Invasion.Menu.prototype = {
    preload:function(){
        this.load.image('bg', 'assets/images/desert.png');
        this.load.image('menu', 'assets/images/menu.png');
        this.load.spritesheet('ship', 'assets/images/ship.png', 16, 24);
        this.load.spritesheet('inimigo', 'assets/images/enemyS.png', 16, 16);
        this.load.spritesheet('laser', 'assets/images/laser.png', 5, 13);
        this.load.spritesheet('bala', 'assets/images/bala.png', 5, 5);
        this.load.spritesheet('explosao', 'assets/images/explosion.png', 16, 16);
        
        this.load.audio('musica',['assets/audio/blueSpace.mp3','assets/audio/blueSpace.ogg']);
        this.load.audio('laserAud',['assets/audio/laser.mp3','assets/audio/laser.ogg']);
        this.load.audio('explosaoAud',['assets/audio/explosion.mp3','assets/audio/explosion.ogg']);
    },
    create: function(){
        Invasion.laserAud = this.add.audio('laserAud');
        Invasion.musica = this.add.audio('musica');
        
        this.add.image(0,0,'menu');
        
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        
        var space = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        space.onDown.addOnce(this.start, this);
        
        Invasion.musica.loop = true;
        Invasion.musica.play();
        Invasion.laserAud.volume = .05;
    },
    start: function(){
        Invasion.laserAud.play();
        this.state.start('Play');
    }
}
Invasion.Play = function(){}

Invasion.Play.prototype = {
    create:function(){
        this.explosaoAud = this.add.audio('explosaoAud');
        
        this.bg = this.add.tileSprite(0, 0, 200, 272, 'bg');
        
        this.ship = this.add.sprite(this.world.centerX, 250, 'ship');
        this.ship.anchor.setTo(.5, 0);
        this.physics.enable(this.ship);
        this.ship.body.setSize(14, 15, 1, 0);
        this.ship.body.collideWorldBounds = true;
        
        // animação ship
        this.ship.animations.add('center', [2,7], 10, false);
        this.ship.animations.add('left', [1,6], 10, false);
        this.ship.animations.add('right', [3,8], 10, false);
        
        this.vidas = 2;
        this.pontos = 0;
        this.nivel = 1;
        this.contaInimigos = 0;
        this.criaUi();
        
        // criar grupos
        this.criaGrupoInimigos();
        this.criaGrupoExplosao();    
        this.criaGrupoLaser();
        this.criaGrupoBalas();
        
        // teclado
        this.leftKey = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        this.time.events.loop(1000 - this.nivel * 5, this.novoInimigo, this);
        this.time.events.loop(1000 - this.nivel * 5, this.atiraInimigo, this);
    },
    criaUi:function(){
        var estilo = { font: '10px Arial', fill: '#ffffff' };
        this.vidasTxt = this.add.text(190, 5, 'Vidas: ' + this.vidas, estilo);
        this.vidasTxt.anchor.setTo(1, 0);
        this.nivelTxt = this.add.text(10, 5, 'Nivel: ' + this.nivel, estilo);
        this.pontosTxt = this.add.text(this.world.centerX, 5, 'Pontos: ' + this.pontos, estilo);
        this.pontosTxt.anchor.setTo(.5, 0);
    },
    criaGrupoInimigos:function(){
        this.inimigos = this.add.group()
        this.inimigos.createMultiple(10, 'inimigo', 0);
        this.physics.enable(this.inimigos);
        this.inimigos.callAll('anchor.setTo', 'anchor', .5, 1);
        this.inimigos.setAll('checkWorldBounds', true);
        this.inimigos.setAll('outOfBoundsKill', true);
        
        this.inimigos.callAll('animations.add','animations','anim', [0,1], 10, true);
        this.inimigos.callAll('animations.play','animations','anim');
    },
    criaGrupoExplosao:function(){
        this.explosoes = this.add.group();
        this.explosoes.createMultiple(30, 'explosao');
        this.explosoes.callAll('anchor.setTo', 'anchor', .5);
        this.explosoes.callAll('animations.add', 'animations', 'explode');
    },
    criaGrupoLaser:function(){
        this.lasers = this.add.group()
        this.lasers.createMultiple(10, 'laser',0);
        this.physics.enable(this.lasers);
        this.lasers.callAll('anchor.setTo', 'anchor', .5, 1);
        this.lasers.setAll('checkWorldBounds', true);
        this.lasers.setAll('outOfBoundsKill', true);
        
        this.lasers.callAll('animations.add','animations','anim', [0,1], 20, true);
        this.lasers.callAll('animations.play','animations','anim');
        
        this.lasers.intervalo = 300;
        this.lasers.proximo = 0;
    },
    criaGrupoBalas:function(){
        this.balas = this.add.group()
        this.balas.createMultiple(20, 'bala',0);
        this.physics.enable(this.balas);
        this.balas.callAll('anchor.setTo', 'anchor', .5, 0);
        this.balas.setAll('checkWorldBounds', true);
        this.balas.setAll('outOfBoundsKill', true);
        
        this.balas.callAll('animations.add','animations','anim', [0,1], 20, true);
        this.balas.callAll('animations.play','animations','anim');
    },
    novoInimigo:function(){
        var inimigo = this.inimigos.getFirstDead();
        if (!inimigo) return;
        inimigo.reset(this.rnd.between(8, 192), 0);
        inimigo.body.velocity.y = 40;
    },
    atiraInimigo:function(){
        this.inimigos.forEachAlive(function(inimigo){
            if(this.game.rnd.frac()>.5 && inimigo.y<200)
                var bala = this.balas.getFirstDead();
                if (!bala) return;
                bala.reset(inimigo.x, inimigo.y);
                this.physics.arcade.moveToObject(bala,this.ship,50);
        },this);
    },
    update:function(){
        this.bg.tilePosition.y += 0.5;
        this.atualizaUi();
        
        this.physics.arcade.overlap(this.lasers, this.inimigos, this.eliminaInimigo, null, this);
        this.physics.arcade.overlap(this.lasers, this.balas, this.eliminaInimigo, null, this);
        this.physics.arcade.overlap(this.balas, this.ship, this.eliminaShip, null, this);
        this.physics.arcade.overlap(this.inimigos, this.ship, this.eliminaShip, null, this);
        // movimentos
        if(this.leftKey.isDown){
            this.ship.body.velocity.x = -100;
            this.ship.animations.play('left');
        }
        else if(this.rightKey.isDown){
            this.ship.body.velocity.x = 100;
            this.ship.animations.play('right');
        }
        else{
            this.ship.body.velocity.x = 0;
            this.ship.animations.play('center');
        }
        if(this.spaceKey.isDown && this.ship.alive){
            this.atira();
        }
    },
    atualizaUi:function(){
        this.vidasTxt.text = 'Vidas: ' + (this.vidas >= 0?this.vidas:0);
        this.nivelTxt.text = 'Nivel: ' + this.nivel;
        this.pontosTxt.text = 'Pontos: ' + this.pontos; 
    },
    eliminaInimigo: function(laser, objeto){
        if(this.inimigos.children.indexOf(objeto) > -1){
            // se o objeto for um inimigo
            this.explosaoAud.play();
            this.pontos +=10;
            this.contaInimigos++;
            if(this.contaInimigos>=10){
                this.nivel++;
                this.contaInimigos = 0;
            }
        }
        else{
            // se o objeto for uma bala
            this.pontos +=1;
        }
        laser.kill();
        objeto.kill();
        var explosao = this.explosoes.getFirstDead();
        explosao.reset(objeto.x, objeto.y);
        explosao.play('explode', 30, false, true);
    },
    eliminaShip:function(objeto,ship){
        // objeto pode ser inimigo ou bala
        this.explosaoAud.play();
        this.vidas--;
        objeto.kill();
        ship.kill();
        var explosao = this.explosoes.getFirstDead();
        explosao.reset(ship.x, ship.y);
        explosao.play('explode', 30, false, true);
        
        this.time.events.add(Phaser.Timer.SECOND * 2, this.inicializa, this);
    },
    inicializa:function(){
        if(this.vidas>=0){
            this.balas.callAll('kill');
            this.lasers.callAll('kill');
            this.inimigos.callAll('kill');
            this.ship.reset(this.world.centerX, 250);
        }
        else{
            Invasion.musica.stop();
            this.state.start('Menu');
        }
    },
    atira: function(){
        if(this.time.now > this.lasers.proximo){ 
            var laser = this.lasers.getFirstDead();
            if (!laser) return;
            laser.reset(this.ship.x, this.ship.y);
            laser.body.velocity.y = -200;
            Invasion.laserAud.play();

            this.lasers.proximo = this.time.now + this.lasers.intervalo;
        }
    }
}
var game = new Phaser.Game(200, 272, Phaser.AUTO, 'game');

game.state.add('Menu', Invasion.Menu);
game.state.add('Play', Invasion.Play);

game.state.start('Menu');