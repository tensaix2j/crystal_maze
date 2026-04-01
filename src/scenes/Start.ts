import {Scene} from 'phaser'
import { globalGameData } from '../GlobalGameData';

export class Start extends Scene {


    //---------
    constructor() {
        super('Start');
        console.log("Start::constructor");
    }


    //---------
    preload() {
        console.log("Start::preload");

        this.graphics = this.add.graphics();
        this.graphics.fillStyle( 0x161212, 1); // Black color with full opacity
        this.graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        this.load.image('cover'       , 'images/cover.jpg');
        this.load.image('lock'        , 'images/lock.png');

        
    }

    //------
    create_button( x, y , w, h , txt ) {

        const btn = this.add.container(x,y);

        let g = this.add.graphics();
        btn.add( g );
        const radius = 20; 
        const color = 0x000000; 

        g.fillStyle(color, 1); 
        g.fillRoundedRect( -w/2, -h/2, w, h, radius);
        g.setInteractive( 
            new Phaser.Geom.Rectangle(
                -w/2, 
                -h/2, 
                w, 
                h
            ), 
            Phaser.Geom.Rectangle.Contains
        );

        let lbl = this.add.text( 0, 0, txt , {
            fontFamily: '"Comic Sans MS"',
            fontSize: '30px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5, 0.5); 

        btn.add( lbl );


        return btn;        
    }

    
    //---------
    create() {
        console.log("Start::create");

        let x;
        let y;
        let w;
        let h;

        

        //-------
       // title
       x = this.sys.game.config.width * 0.5;
       y = this.sys.game.config.width * 0.1;

       let title = "Crystal Maze ";
       const title_text = this.add.text(x, y, title, {
            fontFamily: '"Comic Sans MS"',
            fontSize: '80px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5, 0.5).setDepth(1000);


        //-------
        // cover
        x = this.sys.game.config.width * 0.5;
        y = this.sys.game.config.height * 0.5;
        const cover = this.add.image(x, y, 'cover').setOrigin(0.5, 0.5);
        
        

        //-------
        // buttons
        x = this.sys.game.config.width * 0.5;
        y = this.sys.game.config.height - 100;
        w = this.sys.game.config.width * 0.8;
        h = 80;
        
        this.startbtn = this.create_button( x,y,w,h, "START" );
        
        //---
        this.input.on('gameobjectdown', (p, g) => this.onGameObjectDown(p, g))

        
        //----
        // Level menu

        let unlocked_level = globalGameData.unlocked_level


        this.levelMenuContainer = this.add.container(
            this.sys.game.config.width / 2 ,
            this.sys.game.config.height/ 2
        ).setVisible(0);

        
        let window = this.add.graphics();
        window.lineStyle(2, 0xffffff, 1);     // white border (2px)
        window.fillStyle(0x110503, 0.85);      // black fill, 50% opacity
        w = 800;
        h = 700;
        x = -w/2;
        y = -h/2 + 50;
        
        window.fillRoundedRect(   x,  y ,   w, h, 20 );
        window.strokeRoundedRect( x,  y ,   w, h, 20 );
        this.levelMenuContainer.add( window );

        let windowtitle = this.add.text( 0 , y + 40, "Select Level", {
            fontFamily: '"Comic Sans MS"',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5,0.5);

        this.levelMenuContainer.add( windowtitle) ;

        
        let bw = 100;
        let bh = 75;
        let hgap = 14;
        let vgap = 14;
        let tbw = (bw + hgap) * 6;
        let tbh = (bh + vgap) * 6;

        for ( let i = 0 ; i < 36 ; i++ ) {
            let level_button = this.add.graphics();
            level_button.lineStyle(2, 0xffffff, 1);     // white border (2px)
            level_button.fillStyle(0x110503, 0.85);      // black fill, 50% opacity
            
            let bx = ( i % 6 ) * (bw + hgap)         - tbw/2 ;
            let by = (( i / 6 ) >> 0 ) * (bh + vgap) - tbh/2  + 50;

            level_button.fillRoundedRect(   bx, by ,   bw, bh, 8 );
            level_button.strokeRoundedRect( bx, by ,   bw, bh, 8 );
            level_button.button_id = i;
            this.levelMenuContainer.add( level_button );
            
            if ( i <= unlocked_level ) {
                level_button.setInteractive(
                    new Phaser.Geom.Rectangle(
                        bx, 
                        by, 
                        bw, 
                        bh
                    ), Phaser.Geom.Rectangle.Contains
                ); 
                let levellbl = this.add.text( bx + bw/2, by + bh/2, (i+1), {
                    fontFamily: '"Comic Sans MS"',
                    fontSize: '30px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 8
                }).setOrigin(0.5,0.5);

                this.levelMenuContainer.add( levellbl );

                
            } else {
                let lock = this.add.image( bx + bw/2 ,by + bh/2, 'lock').setDepth(200).setScale(0.5,0.5);
                this.levelMenuContainer.add( lock );
            }

            
        }

        const version = this.sys.game.config.gameVersion; 
        x = this.sys.game.config.width - 10;
        y = this.sys.game.config.height - 14;
        const versiontxt = this.add.text( x, y , version, {
            font: '10px Inter',
            fill: '#fff',
        }).setOrigin(1, 1); 

    }

    //------------
    onGameObjectDown(pointer, item ) {
        if ( item.button_id == null ) {
            this.levelMenuContainer.setVisible(1);
            this.startbtn.setVisible(0);
        } else {
            this.scene.start('MyGame', {level_index: item.button_id })
        }
    }
}