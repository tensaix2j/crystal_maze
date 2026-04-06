import {Game, Scene} from 'phaser';
import Sprite = Phaser.GameObjects.Sprite;
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class MyGame extends Scene {


    startTime: number = 0
    
    models = {};
    
    models_to_load = [
        "robot",
        "cube",
        "wall",
        "floor",
        "lock",
        "lockcrystal",
        "exit",
        "water",
        "block",
        "dirt",
        "redspider",
        "bluespider",
        "campfire",
        "ice",
        "ice_corner",
        "greenbutton",
        "bluebutton",
        "redbutton",
        "yellowbutton",
        "greybutton",
        "tank",
        "bomb",
        "glider",
        "fireball",
        "pinkball",
        "trap",
        "clonemachine",
        "thief",
        "teleport",
        "pacman",
        "gravel",
        "hiddenwall",
        "thin_wall",
        "thin_wall_corner"
    ]

    models_loaded = 0;
    game_state = -1;

    text_effect = {
        x: 0,
        y: 0,
        text: "",
        elapsed: 0,
        elapsed_threshold: 100,
        ticking: false
    };
    
    keystates = {};
    materials = [];
    smokes = [];


    current_level_obj_index = {};


    togglables = {};
    creatables = {};
    removables = {};
    movables  = {};
    pickables = {};
    hints = {};
    exits = {};
    directions = {};
    static_tiles = [];
    monsters = {};
    src_and_target = {};
    


    inventories = [];
    recycle_bins = [];
    chip_remaining = 0;
    
    
    setting_initial_speed = 0.06;
    setting_camera_range = 12;
    setting_force_floor_sliding_speed   = 0.15;
    setting_ice_sliding_speed           = 0.15;
    setting_camera_xoff = -0.0001
    setting_water_depth = -0.35;

    // bookmark8
    level_index = 0;
    levels = [

        
        "cc1_01.json",
        "cc1_02.json",
        "cc1_03.json",
        "cclp1_04.json",
        
        "cclp1_02.json",  
        "cclp1_03.json",
        "cc1_04.json",
        "cclp1_08.json",
        
        "cc1_05.json",
        "cclp1_07.json",
        "cclp1_05.json",
        "cc1_08.json",
        
        "cclp1_06.json",
        "cc1_07.json",
        "cclp1_09.json",
        "cclp1_10.json",
        
        "cc1_09.json",
        "cc1_10.json",
        "cc1_11.json",
        "cclp1_121.json",
        
        "cclp3_15.json",
        "cclp1_72.json",  
        "cclp1_54.json",
        "cclp3_28.json",
        
        "cclp3_12.json",
        "cclp3_31.json",
        "cclp3_52.json",
        "cclp2_103.json",
        
        "cclp3_86.json",
        "cclp3_59.json",  
        "cclp3_48.json",
        "cclp3_57.json",
        
        "cclp5_107.json",
        "cclp5_109.json",
        "cclp5_110.json",
        
        //"debug01.json",
        
        "cclp5_114.json",
        

    ];
    
    constructor() {
        super('MyGame');
    }

    

    //----
    init( data ) {
        if ( data != null && data.level_index != null ) {
            this.level_index = data.level_index;
        } else {
            this.level_index = 0;
        }
    }



    //----------------
    preload() {

        if ( this.preloaded == null ) {
            this._0x77665544 = Math.random;
            this._0x77665545 = Math.floor;

            this.load.image('cover'       , 'images/cover.jpg');

            this.load.image('smokesplash', 'images/smokesplash.png');

            this.load.spritesheet('tileset', 'images/tileset_128.png', {
                frameWidth: 128,
                frameHeight: 128
            });

            this.load.image('wasd', 'images/wasd.png');

            this.load.audio('buttonclick', 'sounds/buttonclick.mp3');
            this.load.audio('buttonshort', 'sounds/buttonshort.mp3');
            this.load.audio('correct', 'sounds/correct.mp3');
            this.load.audio('crystal', 'sounds/crystal.mp3');
            this.load.audio('denied', 'sounds/denied.mp3');
            this.load.audio('explosion', 'sounds/explosion.mp3');
            this.load.audio('fire', 'sounds/fire.mp3');
            this.load.audio('hit', 'sounds/hit.mp3');
            this.load.audio('oof', 'sounds/oof.mp3');
            this.load.audio('punch', 'sounds/punch.mp3');
            this.load.audio('scream', 'sounds/scream.mp3');
            this.load.audio('stone', 'sounds/stone.mp3');
            this.load.audio('success', 'sounds/success.mp3');
            this.load.audio('switch', 'sounds/switch.mp3');
            this.load.audio('teleport', 'sounds/teleport.mp3');
            this.load.audio('victory', 'sounds/victory.mp3');
            this.load.audio('water', 'sounds/water.mp3');
            this.load.audio('bgm'  , 'sounds/pixieland.mp3');
        
            
            
        }
    }

    //-----------
    on_model_loaded( modelname ) {

        console.log("MyGame::on_model_loaded" , modelname );
        
        this.models_loaded += 1;
        if ( this.models_loaded >= this.models_to_load.length ) { 
            
            console.log("MyGame::on_model_loaded: All Models loaded");
            
            this.setup_threejs();
            this.init_once();
            
            this.preloaded = 1;
            this.reinit_game_dispatch();
            
        }
    }

    


    //-----------
    cloneInstance( model  ) {
            
        if ( model.type == "Group"){ 

            let group = new THREE.Object3D();
            group.scale.set( model.scale.x, model.scale.y, model.scale.z );
            group.rotation.set( model.rotation.x, model.rotation.y, model.rotation.z );
            group.position.set( model.position.x, model.position.y, model.position.z );
            
            for ( let i = 0 ; i < model.children.length ; i++ ) {
                let child_item  = model.children[i];
                let cloned_child_item =  this.cloneInstance( child_item );
                group.add( cloned_child_item );
            };
            return group;
        } else { 
            
            let mesh_instance = new THREE.InstancedMesh( model.geometry , model.material, 10);
            mesh_instance.scale.set( model.scale.x, model.scale.y, model.scale.z );
            mesh_instance.rotation.set( model.rotation.x, model.rotation.y, model.rotation.z );
            mesh_instance.position.set( model.position.x, model.position.y, model.position.z );
            //mesh_instance.receiveShadow = true;
            
            return mesh_instance;
        }

    }

    //-------
    // GO: GAME OVER
    gameover( die_message , type ) {

        this.display_text_effect("YOU DIED!", 40 );

        this.snds["scream"].play();
        this.txtNotification.setText( die_message + "\n\nPress (1) To Restart.");
        this.bgMask.setVisible(1);
        
        this.game_state = 2;
        this.player.mixer.clipAction( this.models["robot"].animations[2]).play() ; 
        this.player.mixer.clipAction( this.models["robot"].animations[10]).stop() ; 
        
    }

    

    
    //------------
    restart_level() {

        if ( this.game_state == 3 ) {
            return ;
        }
        if ( this.game_state == 4 ) {
            return ;
        }
        
        this.bgMask.setVisible(0);
        this.txtNotification.setText("");

        this.clear_inventories();

        // Dont clear_dynamic_objects() here.. too destructive..
        // Only selectively clear..

        // Dirt and recessed wall
        for ( let tilecoord in this.creatables ) {
            this.threejs_scene.remove( this.creatables[tilecoord] );
            delete this.creatables[tilecoord];
        }

        // Movable blocks reverted
        for ( let tilecoord in this.movables ) {
            this.threejs_scene.remove( this.movables[tilecoord] );
            delete this.movables[tilecoord];
        }

        // hidden wall reverted 
        for ( let tilecoord in this.removables ) {
            if ( this.removables[tilecoord].item_id == 9 ) {
                let tile = this.removables[ tilecoord ];
                tile.children[0].material = this.models["hiddenwall"].scene.children[0].material;
            }
        }

        //toggle door reverted.
        for ( let tilecoord in this.togglables ) {
            
            if ( this.togglables[ tilecoord ].item_id >= 50 && this.togglables[ tilecoord ].item_id <= 51 ) {

                let tile = this.togglables[ tilecoord ] ;
                if ( this.togglables[ tilecoord ].item_id == 50 ) {
                    tile.position.y = -3;
                    this.togglables[ tilecoord ].state = 0;
                } else {
                    tile.position.y = 0;
                    this.togglables[ tilecoord ].state = 1;                    
                }
            }
        }

        // monster
        for ( let tilecoord in this.monsters ) {
            let tile = this.monsters[tilecoord];
            this.threejs_scene.remove( tile );
            delete this.monsters[tilecoord];
        }
        

        //player
        this.player.position.y = 0;
        this.player.lerp_progress   = null;
        this.player.passed_tile_action_done = null;
        this.player.istrapped = null;
        this.player.registered_position.x = this.player.start_x;
        this.player.registered_position.z = this.player.start_z;
        
        this.txtHintContainer.setVisible(0);

        this.load_dynamic_objects();
        this.render_level_status();

        this.game_state = 0;    
        
    }
    

    //--------
    create_or_reuse_object( modelname ) {

        let obj;
        for ( let i = this.recycle_bins.length - 1 ; i >= 0; i-- ) {
            obj = this.recycle_bins[i];
            
            if ( obj.modelname == modelname ) {
                this.recycle_bins.splice( i , 1 );
                this.threejs_scene.add( obj );
                return obj;
            }
        }
        // Nothing from recycle bin, so create new.
        obj = this.cloneInstance( this.models[ modelname ].scene  );
        obj.modelname       = modelname;
        return obj;        
    }

    //---------------
    create_smoke( x, y, z , size ) {

        let obj = null;
        let modelname = "smokesplash";

        for ( let i = this.recycle_bins.length - 1 ; i >= 0; i-- ) {
            let iobj = this.recycle_bins[i];
            if ( iobj.modelname == modelname ) {
                obj = iobj;
                this.recycle_bins.splice( i , 1 );
            }
        }
        if ( obj == null ) {
            let planeGeometry    = new THREE.PlaneGeometry( 1, 1, 1, 1 );
            obj = new THREE.Mesh( planeGeometry, this.materials[modelname] );
            this.setUV( planeGeometry.attributes.uv,  4,4,0,0 );
            obj.modelname = modelname;        
        }

        
        obj.frame_index = 0;
        obj.frame_index_max = 10;
        obj.elapsed = 0;
        obj.elapsed_threshold = 35;

        obj.position.set( x , y ,z );
        obj.scale.set( size, size, size );
        obj.rotation.z = Math.random() * Math.PI * 2;
        obj.rotation.x = 0;
        obj.rotation.y = 0;
        obj.lookAt( this.threejs_camera.position);
        obj.renderOrder = 1;
        
        this.threejs_scene.add( obj );
        this.smokes.push( obj );
        return obj;

    }

    //----------
    create() {

        this.loadingText = this.add.text( this.sys.game.config.width/2,
            100, 'Loading...', {
                fontFamily: '"Comic Sans MS"',
                fontSize: '40px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8
            }).setOrigin(0.5,0.5).setDepth(101);

        this.score = 0;
        this.scoreText = this.add.text( this.sys.game.config.width/2, 100 , '0 ', {
            fontFamily: '"Comic Sans MS"',
                fontSize: '80px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8
        }).setOrigin(0.5, 0.5).setDepth(101).setVisible(0);


        let x = 10;
        let y = this.sys.game.config.height - 20;
        let wasd = this.add.image(x, y, 'wasd').setOrigin(0, 1).setAlpha(0.4);
        wasd.setScale(0.4, 0.4 );

        const version = this.sys.game.config.gameVersion; 
        x = this.sys.game.config.width - 10;
        y = this.sys.game.config.height - 14;
        const versiontxt = this.add.text( x, y , version, {
            font: '10px Inter',
            fill: '#fff',
        }).setOrigin(1, 1); 


        
        this.text_effect.sprite = this.add.text( 
            this.sys.game.config.width  * 0.5  , 
            this.sys.game.config.height * 0.5 , 
            " ",
            {
                font: '150px creepycrawlersrotal',
                fill: '#ffffff',
                stroke: '#000000',       // Border color (red)
                strokeThickness: 8       // Border thickness
            }
        ).setOrigin(0.5, 0.5).setDepth(1);
        
        
        if ( this.created == null ) {

            this.snds = {};
            this.snds["buttonclick"] = this.sound.add('buttonclick');
            this.snds["buttonshort"] = this.sound.add('buttonshort');
            this.snds["correct"] = this.sound.add('correct');
            this.snds["crystal"] = this.sound.add('crystal');
            this.snds["denied"] = this.sound.add('denied');
            this.snds["explosion"] = this.sound.add('explosion');
            this.snds["fire"] = this.sound.add('fire');
            this.snds["hit"] = this.sound.add('hit');
            this.snds["oof"] = this.sound.add('oof');
            this.snds["punch"] = this.sound.add('punch');
            this.snds["scream"] = this.sound.add('scream');
            this.snds["stone"] = this.sound.add('stone');
            this.snds["success"] = this.sound.add('success');
            this.snds["switch"] = this.sound.add('switch');
            this.snds["teleport"] = this.sound.add('teleport');
            this.snds["victory"] = this.sound.add('victory');
            this.snds["water"] = this.sound.add('water');
            this.snds["bgm"] = this.sound.add('bgm', { loop: true });
            this.snds["bgm"].play();

            

            // load glb
            const gltfloader = new GLTFLoader();
            let _this = this;

            for ( let i = 0 ; i < this.models_to_load.length; i++ ) {

                let modelname = this.models_to_load[i];
                console.log("Loading", modelname );


                gltfloader.load(
                    'models/' + modelname + '.glb',
                    function (gltf) {

                        _this.models[ modelname ] = gltf;
                        gltf.scene.traverse((node) => {

                            if ( node.isMesh && modelname == "building" ) {
                                node.castShadow = true; 
                                node.receiveShadow = true;
                            }
                        });
                        _this.on_model_loaded( modelname );
                    },
                    undefined,
                    function (error) {
                        console.error('An error occurred while loading the model:', error);
                    }
                );
            }
            
        }
        this.created = 1;
        
        this.input.keyboard.on('keydown', this.onKeyDown, this);
        this.input.keyboard.on('keyup', this.onKeyUp, this);
        this.input.on('pointerdown', this.onPointerDown, this );
        this.input.on('pointerup', this.onPointerUp, this );
        this.input.on('pointermove', this.onPointerMove, this );

        this.reinit_game_dispatch();

    }


    //-----------------
    onPointerDown( pointer ) {
        this.keystates["touchstart"] = 1;
    }


    //-----------------
    onPointerUp( pointer ) {

        if ( this.keystates["touchstart"] == 1 ) {
            
            this.keystates["touchstart"] = null;
        }
    }


    //-----------------
    onPointerMove( pointer ) {
    }
    
    //---------------
    onKeyDown(event) {
        switch (event.key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                this.keystates[38] = 1;
                this.keystates[40] = null;
                
                break;

            case 'a':
            case 'A':
            case 'ArrowLeft':
                this.keystates[37] = 1;
                this.keystates[39] = null;

                break;
            case 's':
            case 'S':
            case 'ArrowDown':

                this.keystates[40] = 1;
                this.keystates[38] = null;
                
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                this.keystates[37] = null;
                this.keystates[39] = 1;

                
                break;

            case 'm':
            case 'M':
                
                if ( this.snds["bgm"].isPlaying) {
                    this.snds["bgm"].pause();
                } else {
                    this.snds["bgm"].play();
                }

                
                break;

            case 'e':
            case 'E':
                this.next_level();
                break;

            case '1':
                this.restart_level();
                break;
            
            case '2':
                this.scene.start('Start')
                break;

            case '3':
                
                
                break;
            
            case '4':
                break;
            
            default:
                break;
        }
        

    }


    //---------------
    onKeyUp(event) {
        switch (event.key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                this.keystates[38] = null;
                
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
                this.keystates[37] = null;
                
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                
                this.keystates[40] = null;
                
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                this.keystates[39] = null;
                
                break;
            default:
                break;
        }
    }
    //----
    setUV( uvAttribute, rows,cols, row, col ) {
        
        let use_row = rows - row - 1;
        uvAttribute.setXY( 0 , (col+0)/cols , (use_row+1)/rows );
        uvAttribute.setXY( 1 , (col+1)/cols , (use_row+1)/rows );
        uvAttribute.setXY( 2 , (col+0)/cols , (use_row+0)/rows );
        uvAttribute.setXY( 3 , (col+1)/cols , (use_row+0)/rows );
        uvAttribute.needsUpdate = true;
        
    }

    
    //-------------------
    setup_threejs() {
        
        console.log("Setup Threejs");
        
        // Create Three.js scene
        this.threejs_renderer = new THREE.WebGLRenderer({alpha:true});
        this.threejs_renderer.setSize( this.sys.game.config.width, this.sys.game.config.height);
        this.threejs_renderer.setClearColor(0x222222, 1);
        
        this.threejs_renderer.shadowMap.enabled = true; 
        this.threejs_renderer.shadowMap.type = THREE.BasicShadowMap;
        

        let threejs_canvas = this.threejs_renderer.domElement;
        
        document.getElementById("game-container-parent").appendChild( threejs_canvas );
        threejs_canvas.style.width  = document.getElementById("game-container").style.width;
        threejs_canvas.style.height = document.getElementById("game-container").style.height;
        threejs_canvas.style.position = "absolute";
        threejs_canvas.style.left = "0px";
        threejs_canvas.style.top = "0px";
        //threejs_canvas.style.zIndex = 10;
        //threejs_canvas.style.pointerEvents = 'none';
        
        document.getElementById("game-container").style.zIndex = 2;
        document.getElementById("game-container").style.backgroundColor = "rgba(0,0,0,0)";
        

        this.threejs_scene = new THREE.Scene();
        this.threejs_camera = new THREE.PerspectiveCamera(
            25, 
            this.sys.game.config.width / this.sys.game.config.height, 
            0.1, 
            1000
        );
        
        
        const ambientLight = new THREE.AmbientLight(0xfff1d6, 1.0 );
        this.threejs_scene.add(ambientLight);
        
        
        
    }

    

    


    //---
    checkIsMobile() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }



     

    //----
    // Only called once upon models loaded.
    init_once() {
        
        console.log("init_once");

        // Textures for smokes
        let phaserTexture = this.textures.get('smokesplash').getSourceImage();
        let texture = new THREE.Texture( phaserTexture); 
        texture.needsUpdate = true;  
        this.materials["smokesplash"] = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });

        // Textures for tileset
        phaserTexture = this.textures.get('tileset').getSourceImage();
        texture = new THREE.Texture( phaserTexture );
        texture.colorSpace = THREE.SRGBColorSpace

        texture.needsUpdate = true;
        this.materials["tileset"] = new THREE.MeshBasicMaterial({
            map:texture,
            transparent: true
        });

        // Create materials
        this.materials["green"] = new THREE.MeshStandardMaterial({color: 0x00ff00 });;
        this.materials["blue"] = new THREE.MeshStandardMaterial({color: 0x0000ff });;
        this.materials["red"] = new THREE.MeshStandardMaterial({color: 0xff0000 });;
        this.materials["yellow"] = new THREE.MeshStandardMaterial({color: 0xffff00 });;
        this.materials["whiteglow"] = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 1.5
        });;
        
        

        // player
        this.player =  this.models["robot"].scene;
        this.player.castShadow = true;
        this.player.collider = new THREE.Box3();
        this.player.scale.set( 0.25, 0.25, 0.25 );
        this.player.registered_position = new THREE.Vector3(0,0,0);
        this.player.mixer = new THREE.AnimationMixer( this.player );
        this.player.mixer.clipAction( this.models["robot"].animations[2]).play() ; 
        
        this.threejs_scene.add( this.player );

        
        
        // Light
        let light = new THREE.DirectionalLight(0xffe3a1, 1.2);
        light.position.set( -5,  15,  -2); // Position the light source
        light.castShadow = true; // Enable shadow casting
        light.shadow.camera.left = -20;  // Increase/decrease to enlarge/narrow the shadow area
        light.shadow.camera.right = 20;
        light.shadow.camera.top = 20;
        light.shadow.camera.bottom = -20;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 100;
        light.shadow.mapSize.width = 4096; // Default is 512, can increase to 2048, 4096, or higher
        light.shadow.mapSize.height = 4096; 


        this.light = light;
        this.threejs_scene.add(light);

        
        // Camera
        this.threejs_camera.position.set( this.setting_camera_xoff, this.setting_camera_range * 2.1 , this.setting_camera_range );
        this.threejs_camera.lookAt( this.player.position.x , this.player.position.y,  this.player.position.z);

    }




    //---------------------------------
    create_phaser_ui() {

        this.txtContainerStatus = this.add.container(this.sys.game.config.width - 20, 0);
        
        // Level
        this.txtLevel = this.add.text( 
            0,
            30,
            'Level: 1', 
            {
                fontFamily: '"Comic Sans MS"',
                fontSize: '20px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(1,0).setDepth(101);

        
        

        // Chip remaining
        this.txtChipRemaining = this.add.text( 
            0,
            60,
            'Crystal Remaining: 0', 
            {
                fontFamily: '"Comic Sans MS"',
                fontSize: '20px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(1,0).setDepth(101);


        this.txtContainerStatus.add( this.txtLevel );
        this.txtContainerStatus.add( this.txtChipRemaining );
        

        // Txt hint
        this.txtHintContainer = this.add.container(
            this.sys.game.config.width / 2 ,
            this.sys.game.config.height/ 2
        );

        let graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff, 1);     // white border (2px)
        graphics.fillStyle(0x110503, 0.85);      // black fill, 50% opacity
        let w = 800;
        let h = 150;
        graphics.fillRoundedRect(  -w/2, -h/2,   w, h, 20 );
        graphics.strokeRoundedRect(-w/2, -h/2,   w, h, 20 );
        this.txtHintContainer.add( graphics );
        this.txtHint = this.add.text( 
            0 ,
            0 ,
            "Hello World",
            {
                fontFamily: '"Comic Sans MS"',
                fontSize: '18px',
                color: '#ffffff'
            }
        ).setOrigin(0.5, 0.5 )
        this.txtHintContainer.add( this.txtHint );
        this.txtHintContainer.setVisible(0);


        // Txt Notification
        this.txtNotification = this.add.text( 
            this.sys.game.config.width / 2 ,
            this.sys.game.config.height * 0.3,
            "",
            {
                fontFamily: '"Comic Sans MS"',
                fontSize: '18px',
                color: '#ffffff'
            }
        ).setOrigin(0.5, 0.5 ).setDepth(1200);

        // bgMask
        this.bgMask = this.add.graphics();
        this.bgMask.fillStyle(0xff0000, 0.5);   
        w = this.sys.game.config.width;
        h = this.sys.game.config.height;
        this.bgMask.fillRect(  0,0 , w, h);
        this.bgMask.setVisible(0);
    }

    //-----
    text_adjust( txt:string , wrapwidth:number ) {
        
        let marks:any[] = [];
        let cnt = 0;
        for ( let i = 0 ; i < txt.length ; i++) {
            if ( cnt >= wrapwidth ) {
                if ( [". ", ",", " ", "，", "。", "、" ].indexOf( txt[i] ) > -1  ) {      
                    marks.push(i);
                    cnt = 0;
                }
            }
            if ( txt[i] == "\n" ) {
                marks.push(i);
                cnt = 0;
            }
            cnt++;
        }
        for ( let i = marks.length - 1 ; i >= 0 ; i-- ) {
            txt = txt.substring(0, marks[i]) + "\n" + txt.substring( marks[i] + 1);
        }
        return txt;

    }


    //--------------
    // bookmark1
    reinit_game_dispatch() {

        if ( this.preloaded == 1 && this.created == 1 ) {
            console.log("reinit_game_dispatch");
            
            this.text_effect.ticking = false;
            
            this.clear_smokes();
            this.create_phaser_ui();
    
            
            this.clear_inventories();
            this.clear_dynamic_objects();
            this.clear_static_objects();
            
            this.load_level();
            
            window.aaa = this;
        }
    }

    


    //-------------
    clear_smokes() {
        
        for ( let i = this.smokes.length - 1 ; i >= 0 ; i-- ) {

            let obj = this.smokes[i];
            this.recycle_bins.push( obj );
            this.threejs_scene.remove( obj );
            this.smokes.splice( i , 1 );
        }
    }


    //-----------------------
	loadJSON( path, success, error ) {
	    
	    var xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = function() {
	        if (xhr.readyState === XMLHttpRequest.DONE) {
	            if (xhr.status === 200) {
	                if (success)
	                    success(JSON.parse(xhr.responseText));
	            } else {
	                if (error)
	                    error(xhr);
	            }
	        }
	    };
	    xhr.open("GET", path, true);
	    xhr.send();
	}

    //-----
    on_level_loaded( map ) {
        
        console.log("on_level_loaded");

        this.current_level_obj = map.layers;
        this.load_level_data( );        
        this.loadingText.setVisible(0);
        this.render_level_status();
        this.txtNotification.setText( "");
        this.game_state = 0;
        
    }


    //-----
    load_level() {
        
        console.log("load_level", "maps/" + this.levels[ this.level_index ] );

        let _this = this;
        this.loadJSON("maps/" + this.levels[ this.level_index ] ,function( map ) {
            _this.on_level_loaded(map);
        }, false);         
    }


    //----
    // bookmark2 
    load_level_data(  ) {
        
        console.log("load_level_data");

        let layers = this.current_level_obj;

        for ( let ly = 0; ly < layers.length ; ly++ ) {

            this.current_level_obj_index[  layers[ly].name  ] = ly;
            
            //console.log( layers[ly].name );
            if ( ["bg","fg","item"].indexOf( layers[ly].name ) > -1 ) {

                for ( let i = 0 ; i < layers[ly].data.length ; i++ ) {

                    let x_tile =   i % 32;
                    let z_tile =  (i / 32) >> 0 ;
                    let tile;
                    
                    if ( layers[ly].name == "bg" ) {
                        
                        if ( [33,34,43,44,45,46,47,12].indexOf( layers[ly].data[i] ) > -1 ) {

                            // 33: standard floor
                            // 34: exit
                             // 43-47: Ice floor
                             // 12 gravel
                            tile = this.create_textured_block(
                                x_tile ,
                                0, 
                                z_tile , 
                                layers[ly].data[i],
                                1,
                                1.00
                           );
                            

                        // 39-42: Force floor
                                
                        } else if ( layers[ly].data[i] >= 39 && layers[ly].data[i] <= 42  ) {
                            
                            tile = this.create_item_plane( 
                                x_tile,
                                0,
                                z_tile,
                                layers[ly].data[i],
                                1,
                                1.00
                            );
                        }

                    

                    // Foreground
                    } else if ( layers[ly].name == "fg" ) {

                        // 1: standard wall creation
                        // 13-16 17-20 Thin wall creation
                        if ( [1, 13,14,15,16, 17,18,19,20].indexOf( layers[ly].data[i] ) > -1 ) {

                           tile = this.create_textured_block(
                                x_tile ,
                                0, 
                                z_tile , 
                                layers[ly].data[i],
                                1,
                                1.0
                           );
                        }

                    } else if ( layers[ly].name == "item" ) {


                        // GLBs:
                        // 48 : blue button creation,
                        // 49 : green button creation,
                        // 80 : red button creation
                        // 81 : yellow button creation
                        // 82 : grey button creation


                        // 84 ：teleport creation
                        // 52 : trap  creation
                        // 129: thief creation
                        // Textured blocks:
                        // 50,51: Toggle door creation
                        // 53 : recessed wall creation.
                        //  8 : clonemachine creation
                        // 50,51,53 : The indicator 

                        if ( [48,49,80,81,82, 52,8,129, 84].indexOf( layers[ly].data[i] ) > -1 ) {
                            tile = this.create_textured_block(
                                    x_tile ,
                                    0, 
                                    z_tile , 
                                    layers[ly].data[i],
                                    1,
                                    1.0
                            );
                        } else if ( [50,51,53].indexOf( layers[ly].data[i] ) > -1 ) {
                            tile = this.create_item_plane(
                                x_tile ,
                                0.1, 
                                z_tile , 
                                layers[ly].data[i],
                                1,
                                1.0
                            );
                        }

                    } // layer.name == ?
                
                    if ( tile != null ) {
                        tile.tilecoord = i;
                        this.static_tiles.push( tile );
                    }

                } // foreach i in data



            } else if ( ["object"].indexOf( layers[ly].name ) > -1 ) {
                
                for ( let i = 0 ; i < layers[ly].objects.length ; i++ ) {

                    let obj = layers[ly].objects[i];
                    
                    if ( ["switch", "direction","hint", "exit","teleport"].indexOf( obj.type ) > -1  ) {
                        
                        let properties = {};
                        for ( let j = 0 ; j < obj.properties.length ; j++ ) {
                            properties[ obj.properties[j].name ] = obj.properties[j].value;
                        }

                        let tilecoord = properties["tile_y"] * 32 + properties["tile_x"];
                            
                        if ( obj.type == "switch" || obj.type == "teleport" ) {
                            
                            let target_tilecoord = properties["target_tile_y"] * 32 + properties["target_tile_x"];
                            this.src_and_target[ tilecoord ] = target_tilecoord;

                        } else if ( obj.type == "direction" ) {

                            this.directions[ tilecoord ] =  properties["direction"];
                        
                        } else if ( obj.type == "hint" ) {
                            
                            let x_tile = properties["tile_x"];
                            let z_tile = properties["tile_y"];

                            let tile = this.create_item_plane( x_tile , 0.05 , z_tile, 36, 1 )

                            tile.item_id = 36;
                            tile.tilecoord = tilecoord;
                            this.static_tiles.push( tile );  

                            this.hints[ tilecoord ] =  properties["txt"];
                            
                        } else if ( obj.type == "exit" ) {
                            this.exits[ tilecoord ] = properties["to_level"];
                        }
                    }
                }
            }
            
        }
        this.load_dynamic_objects( );
    }

    //--------
    // bookmark2b
    load_dynamic_objects() {

        //console.log("load_dynamic_objects");
        
        let layers = this.current_level_obj;
        for ( let ly = 0 ; ly < layers.length ; ly++ ) {

            if ( ["fg", "bg", "item","removable","monster"].indexOf( layers[ly].name ) > -1 ) {

                for ( let i = 0 ; i < layers[ly].data.length ; i++ ) {

                    let x_tile = i % 32;
                    let z_tile =  (i / 32) >> 0 ;
                    
                    // bg layer
                    if ( layers[ly].name == "bg" ) {

                        // 37: water creation (This can be on bg or removable layer)
                        if ( layers[ly].data[i] == 37 ) {

                            if ( this.removables[ i ] == null ) {
                                
                                
                                let tile = this.create_textured_block( 
                                    x_tile,
                                    0, 
                                    z_tile,
                                    layers[ly].data[i],
                                    1,
                                    1
                                );
                                tile.item_id = layers[ly].data[i];
                                this.removables[ i ] = tile;
                            }


                        // 11 :Dirt creation (This can be on bg or removable layer)
                        } else if ( layers[ly].data[i] == 11 ) {
                            this.create_dirt( i , layers[ly].data[i] );
                        }

                    //-------------------------------
                    // removable layer
                    } if ( layers[ly].name == "removable" ) {

                        // 99 bomb creation
                        if ( layers[ly].data[i] == 99  ) {

                            if ( this.removables[ i ] == null ) {
                                
                                let tile = this.create_textured_block( 
                                    x_tile,
                                    0, 
                                    z_tile,
                                    layers[ly].data[i],
                                    1,
                                    1
                                )
                                tile.item_id = layers[ly].data[i];    
                                
                                this.removables[ i ] = tile;
                            }

                        
                        // 37: water creation (This can be bg or removable both acceptable)
                        } else if ( layers[ly].data[i] == 37 ) {

                            if ( this.removables[ i ] == null ) {
                                
                                let tile = this.create_textured_block( 
                                    x_tile,
                                    0, 
                                    z_tile,
                                    layers[ly].data[i],
                                    1,
                                    1
                                );
                                tile.item_id = layers[ly].data[i];
                                this.removables[ i ] = tile;
                            }

                        // 38: fire creation
                        } else if ( layers[ly].data[i] == 38 ) {

                            if ( this.removables[ i ] == null ) {
                                
                                
                                let tile = this.create_textured_block( 
                                    x_tile,
                                    0.0, 
                                    z_tile,
                                    layers[ly].data[i],
                                    1,
                                    1
                                )
                                tile.item_id = layers[ly].data[i];
                                this.removables[ i ] = tile;
                            }


                        // 2,3,4,5 : lockpad wall creation  
                        // 6 crystal wall creation
                        // 9,10 hidden wall creation
                        } else if ( [2,3,4,5,6, 21,9,10 ].indexOf( layers[ly].data[i] ) > -1  ) {
                            
                            if ( this.removables[ i ] == null ) {

                                // padlock wall refill
                                let tile = this.create_textured_block(
                                    x_tile ,
                                    0, 
                                    z_tile , 
                                    layers[ly].data[i],
                                    1,
                                    1.00
                                );
                                tile.item_id = layers[ly].data[i];

                                this.removables[ i ] = tile;

                            }

                        // 7: movable block creation
                        } else if ( layers[ly].data[i] == 7 ) {

                            if ( this.movables[ i ] == null ) {
                                
                                
                                let tile = this.create_textured_block( 
                                    x_tile,
                                    0, 
                                    z_tile,
                                    layers[ly].data[i],
                                    1,
                                    1
                                );
                                tile.item_id = layers[ly].data[i];
                                this.movables[ i ] = tile;

                            }
                        
                        // 11 dirt creation
                        } else if ( layers[ly].data[i] == 11 ) {

                            this.create_dirt( i , layers[ly].data[i] );
                            
                        }


                    
                    
                    //-------------------------------
                    //  item layer
                    } else if ( layers[ly].name == "item" ) {

                        // 35: Starting position creation
                        if ( layers[ly].data[i] == 35 ) {
                            
                            //console.log("Repositioning Player Position", x_tile , z_tile );
                            this.threejs_camera.position.x = this.player.position.x ;
                            this.threejs_camera.position.z = this.player.position.z + this.setting_camera_range;
                            this.player.registered_position.x = x_tile;
                            this.player.registered_position.z = z_tile;  
                            this.player.start_x = x_tile;
                            this.player.start_z = z_tile;
                            this.player_align_avatar_to_player_pos_tilecoord();


                        // 66,67,68,69: coloured keys creation 
                        // 65 chip creation
                        } else if ( layers[ly].data[i] >= 65 && layers[ly].data[i] <= 69 ) {

                            if ( this.pickables[ i ] == null ) {

                                let tile = this.create_item_plane( 
                                    x_tile,
                                    0.3, 
                                    z_tile, 
                                    layers[ly].data[i],
                                    0.8
                                );
                                tile.item_id = layers[ly].data[i];
                                this.pickables[ i ] = tile;
                                
                                // Chip
                                if ( layers[ly].data[i] == 65 ) {
                                    this.chip_remaining += 1;
                                }
                                
                            }

                        // 70,71,72,73: boots
                        // boots creation
                        } else if ( layers[ly].data[i] >= 70 &&  layers[ly].data[i] <= 73 ) {

                            if ( this.pickables[ i ] == null ) {

                                let tile = this.create_item_plane( 
                                    x_tile,
                                    0.3, 
                                    z_tile, 
                                    layers[ly].data[i],
                                    0.8
                                );
                                tile.item_id = layers[ly].data[i];
                                this.pickables[ i ] = tile;
                            }

                        // 50,51 toggle door creation
                        } else if ( layers[ly].data[i] >= 50 &&  layers[ly].data[i] <= 51 ) {
                            
                            if ( this.togglables[ i ] == null ) {

                                let state  = layers[ly].data[i] - 50;
                                let y       = [ -3,0 ][state] 
                                
                                let tile = this.create_textured_block(
                                    x_tile,
                                    y, 
                                    z_tile,

                                    1,
                                    1,
                                    0.9 
                               );
                               tile.item_id = layers[ly].data[i];
                               tile.state = state;
                               

                               this.togglables[i] = tile;
                            }    

                        }




                    } else if ( layers[ly].name == "monster" ) {
                        
                        // Monsters creation
                        // 97 bug creation
                        // 98 tank creation
                        // 100 glider creation
                        // 101 fireball creation
                        // 102 pink ball creation

                        // 103 eye ball creation
                        // 104 paramecium
                        // 105 blob
                        // 106 walker
                        if ( layers[ly].data[i] > 0 ) {
                            this.create_monster( i , layers[ly].data[i] , this.directions[i] );
                        }
                    }

                }
            }
        }
        this.render_chip_remaining();

        
    }


    //----
    // bookmark4
    create_item_plane( x,y,z, type, size ) {
        
        let planeGeometry    = new THREE.PlaneGeometry( 1, 1, 1, 1 );
        let tile = new THREE.Mesh( planeGeometry, this.materials["tileset"] );
        tile.castShadow = true;
        
        let col;
        let row;

        if ( type >= 65 && type <= 73 ) {
            col = type - 65;
            row = 0;
        } else if ( type == 36 ) {
            col = 9;
            row = 0;
        } else if ( type >= 39 && type <= 42 ) {
            col = 3;
            row = 1;
        } else if ( [50,51].indexOf( type ) > -1 ) {
            col = 2;
            row = 1;
        } else if ( type == 53 ) {
            col = 7;
            row = 1;
        }

        this.setUV( planeGeometry.attributes.uv, 2, 10 ,row, col );
        
        tile.position.set( x , y ,z );
        tile.scale.set( size, size, size );
        
        if ( [36,50,51,53].indexOf( type ) > -1 ) {
            tile.rotation.x = -Math.PI/2    

        } else if ( type >= 65 && type <= 73 ) {
            tile.renderOrder = 1;
            tile.quaternion.copy( this.threejs_camera.quaternion);


        } else if ( type >= 39 && type <= 42 ) {
            tile.rotation.x = -Math.PI/2;
            tile.rotation.z = [ Math.PI/2, 0 , -Math.PI/2, Math.PI ][type - 39 ];

        }
        
        this.threejs_scene.add( tile );
        return tile;
    }



    //--------
    // bookmark3
    create_textured_block( x, y, z , type, height, size ) {

        let tile;
        if ( type == 1 ) {
            tile = this.cloneInstance( this.models["wall"].scene );
            tile.children[0].castShadow = true;
        
        } else if ( type == 9 || type == 10 ) {
            tile = this.cloneInstance( this.models["hiddenwall"].scene );
            tile.children[0].castShadow = true;
            
        } else if ( type == 50 || type == 51 ) {
            tile = this.cloneInstance( this.models["wall"].scene );
            tile.children[0].castShadow = true;
        
        } else if ( type == 7 ) {
            tile = this.cloneInstance( this.models["block"].scene );
            tile.children[0].castShadow = true;
        
        } else if ( type == 99 ) {
            tile = this.cloneInstance( this.models["bomb"].scene );
            tile.children[0].castShadow = true;
        
        
        } else if ( type == 52 ) {
            tile = this.cloneInstance( this.models["trap"].scene );
            tile.children[0].castShadow = true;
        
        } else if ( type == 8 ) {
            tile = this.cloneInstance( this.models["clonemachine"].scene );
            tile.children[0].castShadow = true;
        
        } else if ( type == 129 ) {
            tile = this.cloneInstance( this.models["thief"].scene );
            tile.children[0].castShadow = true;
        
        } else if ( type == 84 ) {
            tile = this.cloneInstance( this.models["teleport"].scene );
            tile.children[0].castShadow = true;
        
        } else if ( type == 100 ) {

            tile = this.cloneInstance( this.models["glider"].scene );
            tile.children[0].castShadow = true;
        
        } else if ( type == 101 ) {

            tile = this.cloneInstance( this.models["fireball"].scene );
            
        } else if ( type == 102 ) {

            tile = this.cloneInstance( this.models["pinkball"].scene );
            tile.children[0].castShadow = true;
        
        } else if ( type == 103 ) {

            tile = this.cloneInstance( this.models["pacman"].scene );
            tile.children[0].castShadow = true;
            
        
        } else if ( type == 11 ) {
            tile = this.cloneInstance( this.models["dirt"].scene );
            tile.children[0].receiveShadow = true;

        } else if ( type == 43 ) {

            tile = this.cloneInstance( this.models["ice"].scene );
        
        } else if ( [48,49,80,81,82].indexOf( type ) > -1 ) {
            
            let modelname = ["bluebutton","greenbutton","redbutton","yellowbutton","greybutton"][ [48,49,80,81,82].indexOf( type )  ]; 
            tile = this.cloneInstance( this.models[modelname].scene );
            tile.children[0].castShadow = true;
            
        } else if ( type >= 44 && type <= 47 ) {

            tile = this.cloneInstance( this.models["ice_corner"].scene );
            tile.rotation.y = [0, -Math.PI/2, Math.PI/2, Math.PI][type - 44 ];

        } else if ( type >= 13 && type <= 16 ) {

            tile = this.cloneInstance( this.models["thin_wall"].scene );
            tile.rotation.y = [ Math.PI , Math.PI/2, 0, -Math.PI/2 ][type - 13 ];
            tile.children[0].castShadow = true;
            
        } else if ( type >= 17 && type <= 20 ) {
            
            tile = this.cloneInstance( this.models["thin_wall_corner"].scene );
            tile.rotation.y = [ Math.PI , Math.PI/2, -Math.PI/2, 0 ][type - 17 ];
            tile.children[0].castShadow = true;
            

        } else if ( type == 33 ) {
            tile = this.cloneInstance( this.models["floor"].scene );
            tile.children[0].receiveShadow = true;

        } else if ( type == 12 ) {
            tile = this.cloneInstance( this.models["gravel"].scene );
            tile.children[0].receiveShadow = true;
        

        } else if ( type == 37 ) {
            tile = this.cloneInstance( this.models["water"].scene );
            tile.children[0].receiveShadow = true;

        } else if ( type == 38 ) {
            tile = this.cloneInstance( this.models["campfire"].scene );
            
        } else if ( type == 34 ) {
            tile = this.cloneInstance( this.models["exit"].scene );
            
        } else if ( type >= 2 && type <= 5 ) {
            tile = this.cloneInstance( this.models["lock"].scene );
            tile.children[0].castShadow = true;

            if ( type >= 2 && type <= 5 ) {
                
                tile.children[0].children[0].material = [
                    this.materials["green"],
                    this.materials["blue"],
                    this.materials["red"],
                    this.materials["yellow"]
                ][ type - 2 ];
                    
                
            }
        } else if ( type == 6 ) {
            tile = this.cloneInstance( this.models["lockcrystal"].scene );
            tile.children[0].castShadow = true;        
          
        } else if ( type == 97 ) {

            tile = this.cloneInstance( this.models["redspider"].scene );
            tile.children[0].castShadow = true;        
          
        } else if ( type == 104 ) {

            tile = this.cloneInstance( this.models["bluespider"].scene );
            tile.children[0].castShadow = true;        

        } else if ( type == 98 ) {
            
            tile = this.cloneInstance( this.models["tank"].scene );
            tile.children[0].castShadow = true;   

        } else {
            tile = this.cloneInstance( this.models["cube"].scene );
        } 

        tile.position.set( x,y,z);
        tile.scale.set( size, height, size );
        this.threejs_scene.add( tile );
        
        return tile;
    }





    //----
    display_text_effect( caption, fontsize ) {

        this.text_effect.sprite.y = this.sys.game.config.height * 0.5;
        this.text_effect.sprite.x = this.sys.game.config.width * 0.5;
        this.text_effect.sprite.setText(caption + " " );

        this.text_effect.sprite.setAlpha( 1.0 );
        this.text_effect.ticking = true;
        this.text_effect.elapsed = 0;
        this.text_effect.sprite.setFontSize( fontsize);
       
        this.text_effect.elapsed_threshold = 3000;
    }

    

    //---
    text_effect_pos( elapsed  ) {
        
        if ( this.text_effect.ticking ) {
            if ( this.text_effect.elapsed >= this.text_effect.elapsed_threshold ) {

                this.text_effect.ticking = false;
                
            } else {
                
                this.text_effect.sprite.y -= 2;
                this.text_effect.sprite.setAlpha( this.text_effect.sprite.alpha - 0.01 );
                this.text_effect.elapsed += elapsed
            }
        }
    }


    


    //--------------
    is_direction_opposite( d1, d2  ) { 
	    if ( d1 == -d2 ) {
		    return true
        }
	    return false
    }


    //------
    create_explosions_on_tile( tilecoord:number ) {
        
        let x_tile = tilecoord % 32;
        let z_tile = (tilecoord / 32) >> 0;
        let x = x_tile;
        let z = z_tile ;
        let y = 1;
        this.create_smoke( x,y,z, 1.5 );
        this.snds["explosion"].play();

    }

    //----
    // CMBCT
    check_movable_block_current_tile( tilecoord:number , prev_tilecoord:number ) {
        
        if ( this.movables[ tilecoord ] ) {

            let tile_data_bg    = this.current_level_obj[ this.current_level_obj_index["bg"] ].data[ tilecoord ];
            let tile_data_item  = this.current_level_obj[ this.current_level_obj_index["item"] ].data[ tilecoord ];
            let movable = this.movables[ tilecoord ];

            // if movable block lands on Player. Player Die
            if ( this.player.registered_position.z * 32 + this.player.registered_position.x == tilecoord ) {
                this.gameover("Killed by a moving rock", 7);
            }
            
            // 37: If movable block lands on water
            if ( this.removables[ tilecoord ] && this.removables[ tilecoord ].item_id == 37  ) {

                // Create dirt
                this.snds["water"].play();
                this.create_dirt( tilecoord , 11 );
                
                // remove water 
                this.threejs_scene.remove( this.removables[tilecoord ] );
                delete this.removables[ tilecoord ];

                // Remove movable block after dirt creation
                this.threejs_scene.remove( movable );
                delete this.movables[ tilecoord ];
                
            }


            // Movable block vs bomb
            // 99: Bomb
            if ( this.removables[ tilecoord ] && this.removables[ tilecoord ].item_id == 99  ) {
                
                //resources["index"].play_sound("explosion");
                this.create_explosions_on_tile( tilecoord );
                
                // Diffuse bomb
                this.threejs_scene.remove( this.removables[ tilecoord ] );
                delete this.removables[ tilecoord ];

                // remove the block too
                this.threejs_scene.remove(  this.movables[ tilecoord ] );
                delete this.movables[ tilecoord ];
            }


            // If movable block lands on force floor
            if ( tile_data_bg >= 39 && tile_data_bg <= 42 ) {

                // CMBCT STEP ON FORCE FLOOR
                
                let direction     = [-1,-32,1,32][ tile_data_bg - 39 ];
                let new_tilecoord = tilecoord + direction;
                
                if ( this.check_is_tile_passable_for_movable_block( new_tilecoord, direction ) == true  ) {
                    
                    let new_direction       = new_tilecoord - tilecoord;
                    movable.lerp_progress   = 0;
                    movable.lerp_start_pos  = this.tilecoord_to_position( tilecoord );
                    movable.lerp_end_pos    = this.tilecoord_to_position( new_tilecoord );
                    movable.direction       = new_direction; 
                    movable.tilecoord       = tilecoord; //save old
                    movable.new_tilecoord   = new_tilecoord;
                    movable.speed           = this.setting_force_floor_sliding_speed;  //speed
                    movable.passed_tile_action_done = null;

                    delete this.movables[ tilecoord ];
                    this.movables[ new_tilecoord ] =  movable ;
                }

            }


            // If movable block lands on ice then it will slide.
            if ( tile_data_bg >= 43 && tile_data_bg <= 47 ) {

                let direction = tilecoord - prev_tilecoord;
                let new_tilecoord = this.get_new_tilecoord_on_ice(  tilecoord, direction, tile_data_bg , movable.item_id );
                let new_direction = new_tilecoord - tilecoord;

                
                movable.lerp_progress   = 0;
                movable.lerp_start_pos  = this.tilecoord_to_position( tilecoord );
                movable.lerp_end_pos    = this.tilecoord_to_position( new_tilecoord );
                movable.direction       = new_direction; 
                movable.tilecoord       = tilecoord; //save old
                movable.new_tilecoord   = new_tilecoord;
                movable.speed           = this.setting_ice_sliding_speed;  //speed
                movable.passed_tile_action_done = null;

                delete this.movables[ tilecoord ];
                this.movables[ new_tilecoord ] =  movable ;
                
            }

             // 48,49,80,81,82 Tile buttons
             if ( [48,49,80,81,82].indexOf( tile_data_item) > -1 ) {
                this.tile_button_on_pressed( tilecoord , tile_data_item );
            }
        }
        
    }

    //-------
    is_trap_active( tilecoord:number ) {

        for ( let key in this.src_and_target ) {

            let src_tilecoord = parseInt( key );
            if ( this.src_and_target[ src_tilecoord ] == tilecoord ) {
                
                // Movable block is still pressing.. so the trap is in deactivated state.
                if ( this.movables[ src_tilecoord ] ) {
                    return false;
                }
                // Player is pressing
                if ( this.player.registered_position.z * 32 + this.player.registered_position.x == src_tilecoord ) {
                    return false;
                }

                // Monster is pressing 
                if ( this.monsters[ src_tilecoord ] ) {
                    return false;
                }
            }
        }
        return true;
    }


    //--------
    // CMCT
    check_monster_current_tile(  tilecoord:number, prev_tilecoord:number , from_where ) {
        
        //console.log( "CMCT", tilecoord, from_where );
                    
        if ( this.monsters[ tilecoord ] ) {

            let tile_data_item  = this.current_level_obj[ this.current_level_obj_index["item"] ].data[ tilecoord ];
            let tile_data_bg    = this.current_level_obj[ this.current_level_obj_index["bg"] ].data[ tilecoord ];
            
            // 52 trap
            if ( tile_data_item == 52 ) {

                //console.log( "CMCT","TR", tilecoord );
                if ( this.is_trap_active( tilecoord ) == true ) {
                    this.monsters[ tilecoord ].istrapped = 1;
                }
            }


            
            // 99 bomb
            if ( this.removables[ tilecoord ] && this.removables[ tilecoord ].item_id == 99 ) {
                
                // Both bomb and monster die
                let tile = this.removables[ tilecoord ];
                this.threejs_scene.remove( tile );
                delete this.removables[ tilecoord ];

                let monster = this.monsters[ tilecoord ];
                this.threejs_scene.remove( monster );
                delete this.monsters[ tilecoord ];

                this.create_explosions_on_tile( tilecoord );
            }


            // Water. All monsters except glider(100) shd die when touch water
            if ( this.removables[ tilecoord ] && this.removables[ tilecoord ].item_id == 37  ) {

                if ( this.monsters[ tilecoord ].item_id != 100 ) {
                    let monster = this.monsters[ tilecoord ];
                    this.threejs_scene.remove( monster );
                    delete this.monsters[ tilecoord ];
                }
            }


            // If monster lands on ice then it will slide.
            if ( tile_data_bg >= 43 && tile_data_bg <= 47 ) {

                let monster = this.monsters[tilecoord];

                let direction = tilecoord - prev_tilecoord;
                let new_tilecoord = this.get_new_tilecoord_on_ice(  tilecoord, direction, tile_data_bg , monster.item_id );
                let new_direction = new_tilecoord - tilecoord;
                
                monster.lerp_progress = 0;
                monster.lerp_start_pos = this.tilecoord_to_position( tilecoord );
                monster.lerp_end_pos = this.tilecoord_to_position( new_tilecoord );
                
                monster.direction = new_direction; 
                monster.tilecoord = tilecoord; 
                monster.new_tilecoord = new_tilecoord;
                monster.speed = this.setting_ice_sliding_speed;  
                monster.passed_tile_action_done = null;
                    
                delete this.monsters[ tilecoord ];
                this.monsters[ new_tilecoord ] = monster;
                
                    
            }


            // If monster lands on force floor
            if ( tile_data_bg >= 39 && tile_data_bg <= 42 ) {

                let monster = this.monsters[tilecoord];

                let direction     = [-1,-32,1,32][ tile_data_bg - 39 ];
                let new_tilecoord = tilecoord + direction;
                let new_direction = direction;
                

                if ( this.check_is_tile_passable_for_monster( new_tilecoord, monster.item_id, direction ) == true  ) {
                    
                    monster.lerp_progress = 0;
                    monster.lerp_start_pos = this.tilecoord_to_position( tilecoord );
                    monster.lerp_end_pos = this.tilecoord_to_position( new_tilecoord );
                    monster.direction = new_direction; 
                    monster.tilecoord = tilecoord; 
                    monster.new_tilecoord = new_tilecoord;
                    monster.speed = this.setting_ice_sliding_speed; 
                    monster.passed_tile_action_done = null;

                    
                    delete this.monsters[ tilecoord ];
                    this.monsters[ new_tilecoord ] = monster;
                }

            }


            // 48,49,80,81 Tile buttons
            if ( [48,49,80,81,82].indexOf( tile_data_item) > -1 ) {

                //console.log("BBB", "monster_press_button", tilecoord );
                this.tile_button_on_pressed( tilecoord , tile_data_item );
            }

            // monster to teleport
            if ( tile_data_item == 84 ) {
                if ( this.src_and_target[ tilecoord ] ) {
                    
                    this.snds["teleport"].play();
                    let monster = this.monsters[tilecoord];
                    let new_tilecoord = this.src_and_target[ tilecoord ]
                    
                    // teleport monster
                    delete this.monsters[tilecoord] ;
                    this.monsters[new_tilecoord] = monster
                    this.monster_next_move( new_tilecoord );

                }
            }
            
        }
    } 


    //----------
    func_tile_passable( new_tilecoord, direction, type ) {

        if ( type == 0 ) {
            if ( this.check_is_tile_passable_for_player( new_tilecoord, direction ) ) {
                return true	
            }
            return false

        } else if ( type == 7 ) {
            if ( this.check_is_tile_passable_for_movable_block( new_tilecoord, direction ) ) {
                return true
            }
            return false

        } else if ( type >= 97 && type <= 106 ) {
            if ( this.check_is_tile_passable_for_monster( new_tilecoord, type, direction ) ) {
                return true
            }
            return false
        }
    }


    //---
    get_new_tilecoord_on_ice(  tilecoord:number , direction:number, tile_data_bg:number , type ) {
        
        let new_tilecoord = tilecoord;  

        if ( tile_data_bg == 43 ) {
            new_tilecoord = tilecoord + direction;
            // Check if new tile actually passable, if not then bounce back.
            if ( this.func_tile_passable( new_tilecoord, direction, type ) == false  ) {
                new_tilecoord = tilecoord - direction;
            }
        
        } else if ( tile_data_bg == 44 ) {
            
            if ( direction == -1 ) {
                new_tilecoord = tilecoord + 32;
                if ( this.func_tile_passable( new_tilecoord, 32, type ) == false  ) {
                    new_tilecoord = tilecoord + 1;
                }
            } else if ( direction == -32 ) {
                new_tilecoord = tilecoord + 1;
                if ( this.func_tile_passable( new_tilecoord, 1, type ) == false  ) {
                    new_tilecoord = tilecoord + 32;
                }
            }



        } else if ( tile_data_bg == 45 ) {
            
            if ( direction == 1 ) {
                new_tilecoord = tilecoord + 32;
                if ( this.func_tile_passable( new_tilecoord, 32, type ) == false  ) {
                    new_tilecoord = tilecoord - 1;
                }
            } else if ( direction == -32 ) {
                new_tilecoord = tilecoord - 1;
                if ( this.func_tile_passable( new_tilecoord, -1, type  ) == false  ) {
                    new_tilecoord = tilecoord + 32;
                }
            }
        } else if ( tile_data_bg == 46 ) {
            
            if ( direction == -1 ) {
                new_tilecoord = tilecoord - 32;
                if ( this.func_tile_passable( new_tilecoord, -32, type  ) == false  ) {
                    new_tilecoord = tilecoord + 1;
                }
            } else if ( direction == 32 ) {

                new_tilecoord = tilecoord + 1;
                if ( this.func_tile_passable( new_tilecoord, 1, type  ) == false  ) {

                    new_tilecoord = tilecoord - 32;
                }
            }

        } else if ( tile_data_bg == 47 ) {
            
            if ( direction == 1 ) {
                new_tilecoord = tilecoord - 32;
                if ( this.func_tile_passable( new_tilecoord, -32 , type ) == false  ) {
                    new_tilecoord = tilecoord - 1;
                }
            } else if ( direction == 32 ) {
                new_tilecoord = tilecoord - 1;
                if ( this.func_tile_passable( new_tilecoord, -1, type  ) == false  ) {
                    new_tilecoord = tilecoord - 32;
                }
            }
        } 
        return new_tilecoord;
    }

    //-------
    player_align_avatar_to_player_pos_tilecoord(){

        this.player.position.x = this.player.registered_position.x;
        this.player.position.z = this.player.registered_position.z;
        
    }


    //--------
    // CPCT
    check_player_current_tile(  prev_tilecoord:number ) {
        
        let tilecoord       = this.player.registered_position.z  * 32 + this.player.registered_position.x  ;
        let tile_data_bg    = this.current_level_obj[ this.current_level_obj_index["bg"] ].data[ tilecoord ];
        let tile_data_item  = this.current_level_obj[ this.current_level_obj_index["item"] ].data[ tilecoord ];
        


        // 37: Water.
        if ( this.removables[ tilecoord ] && this.removables[ tilecoord ].item_id == 37 && this.removables[tilecoord][5] == null ) {
            
            let has_boot = this.search_inventories_for_item(70); 
            if ( has_boot > -1 ) {
                // survive
                if ( this.player.position.y > this.setting_water_depth ) {
                    this.player.position.y = this.setting_water_depth;
                    this.player.lerp_end_pos.y = this.player.position.y;
                    this.snds["water"].play();
                }

            } else {
        
                // Water trap
                this.snds["water"].play();
                this.gameover("Dropped into water without flippers", 37 );
                this.player.position.y = -1;
                this.player.position.x = this.player.registered_position.x;
                this.player.position.z = this.player.registered_position.z;
                
            }
        } else if ( this.player.position.y < 0 ) {
            this.player.position.y = 0;
            this.player.lerp_end_pos.y = this.player.position.y;
        }


        // 38: Fire
        if ( this.removables[ tilecoord ] && this.removables[ tilecoord ].item_id == 38  ) {

            let has_boot = this.search_inventories_for_item(71); 
            if ( has_boot > -1 ) {
                // survive
            } else {
                this.snds["fire"].play();
                this.gameover("Killed by fire", 38 );
            }
        }


        // 99: Bomb
        if ( this.removables[ tilecoord ] && this.removables[ tilecoord ].item_id == 99  ) {
            
            this.threejs_scene.remove( this.removables[ tilecoord ] );
            delete this.removables[ tilecoord ];
            
            this.create_explosions_on_tile( tilecoord );
            this.gameover("Killed by a bomb", 99 );
            
            
        }


            


        // 39-42 Force floor
        
        // 39: left , 40: up , 41: right  , 42: down
        if ( tile_data_bg >= 39 && tile_data_bg <= 42  ) {

            let has_boot = this.search_inventories_for_item(72); 
            if ( has_boot > -1 ) {
                // survive
            } else {

                // CPCT STEP ON FORCE FLOOR
                
                let direction     = [-1,-32,1,32][ tile_data_bg - 39 ];
                let new_tilecoord = tilecoord + direction;
                
                if ( this.check_is_tile_passable_for_player( new_tilecoord, direction ) == true  ) {
                    // for consistency with monster,  2: progress, 6:direction, 7: new_tilecoord
                    this.player.lerp_progress   = 0;
                    this.player.lerp_start_pos  = this.tilecoord_to_position( tilecoord );
                    this.player.lerp_end_pos    = this.tilecoord_to_position( new_tilecoord );
                    this.player.direction       = direction;
                    this.player.tilecoord       = tilecoord;
                    this.player.new_tilecoord   = new_tilecoord;
                    this.player.speed           = this.setting_force_floor_sliding_speed;  
                    this.player.passed_tile_action_done = null;
                }

                
            }
        }
        
        // 43-47 Ice Floor
        // 43: center , 44: corners DR, 45: DL, 46: UR,  47: UL
        if ( tile_data_bg >= 43 && tile_data_bg <= 47 ) {

            let has_boot = this.search_inventories_for_item(73); 
            if ( has_boot > -1 ) {
                // survive
            } else { 

                    
                let direction = tilecoord - prev_tilecoord;
                
                let new_tilecoord = this.get_new_tilecoord_on_ice(  tilecoord, direction, tile_data_bg , 0 );
                let new_direction = new_tilecoord - tilecoord;
                
                
                this.player.lerp_progress   = 0;
                this.player.lerp_start_pos  = this.tilecoord_to_position( tilecoord );
                this.player.lerp_end_pos    = this.tilecoord_to_position( new_tilecoord );
                this.player.direction       = new_direction 
                this.player.new_tilecoord   = new_tilecoord;
                this.player.tilecoord       = tilecoord;
                this.player.speed           = this.setting_ice_sliding_speed;  
                this.player.passed_tile_action_done = null;
                
                
                
            }
        }

        

        // 48,49,80,81,82 Tile buttons
        if ( [48,49,80,81,82].indexOf( tile_data_item ) > -1 ) {
            this.tile_button_on_pressed( tilecoord , tile_data_item ) ;
        }

        // 84: Teleport 
        if ( tile_data_item == 84 ) {
            
            if ( this.src_and_target[ tilecoord ] ) {
        	    
                let target_coord = this.src_and_target[ tilecoord ] ;
                this.player.new_tilecoord = target_coord;
                this.snds["teleport"].play();

            }
        }

        // 129: Thief
        if ( tile_data_item == 129 ) {

            for ( let inventory_id = 4 ; inventory_id < 8 ; inventory_id++ ) {
                // Deplete inventory
                this.clear_inventories_footgears();
                this.snds["oof"].play();
            }
        }


        // 53 : recessed wall
        if ( tile_data_item == 53  ) {

            let x_tile = tilecoord % 32;
            let z_tile = (tilecoord / 32 ) >> 0; 
            
            // Create wall
            let tile = this.create_textured_block(
                x_tile,
                0, 
                z_tile,
                1,
                0.75,
                0.9 
            );
            this.creatables[ tilecoord ] = tile;
            tile.item_id = 1;
            this.snds["stone"].play();

        }

        // 11 Dirt on stepped
        if ( this.creatables[ tilecoord ] && this.creatables[ tilecoord ].item_id == 11 ) {

            this.creatables[ tilecoord ].item_id = 33;
            this.creatables[ tilecoord ].children[0].material = this.models["floor"].scene.children[0].material;

        }

        

        // 52 Trap on entered
        if ( tile_data_item == 52 ) {

            if ( this.is_trap_active( tilecoord ) == true ) {
                this.player.istrapped = 1;
                this.snds["oof"].play();

            }
        }   

        // 36 Hint 
        
        if ( this.hints[ tilecoord ] ) {
            
            this.txtHintContainer.setVisible(1);
            this.txtHint.setText( this.text_adjust( this.hints[tilecoord] , 85) );
            this.snds["buttonclick"].play();

            
        } else {
            this.txtHintContainer.setVisible(0);
        }

        // 34 Exit
        if ( tile_data_bg == 34 ) {
            this.victory( tilecoord );

        }
    }


    //------
    // PMB
    push_movable_block(  direction:number ) {
        
        let tilecoord       =  this.player.registered_position.z * 32 + this.player.registered_position.x ;
        let tile_data_bg    = this.current_level_obj[ this.current_level_obj_index["bg"] ].data[ tilecoord ];
        
        if ( this.movables[ tilecoord ]  )  {    

            let movable = this.movables[ tilecoord ];
            
            let new_tilecoord = tilecoord + direction;
            let new_direction = new_tilecoord - tilecoord;
            
            movable.item_id = 7;
            movable.lerp_progress = 0;
            movable.lerp_start_pos = this.tilecoord_to_position( tilecoord );
            movable.lerp_end_pos   = this.tilecoord_to_position( new_tilecoord );
            movable.direction = new_direction; 
            movable.tilecoord = tilecoord; 
            movable.new_tilecoord = new_tilecoord;
            movable.speed = this.setting_initial_speed * 2; 
            movable.passed_tile_action_done = null;
            
            // Should occupy the new tile immediately but dont do block_current_tile() yet until lerp finished.
            delete this.movables[ tilecoord ];
            this.movables[ new_tilecoord ] =  movable ;

            
                    
        }
    }

    //-------------
    // GENERAL PASSABLE 
    check_is_tile_passable_general( tilecoord:number , direction:number ) {

        let ret = true; 
        // standard wall (1) 
        if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord  ] == 1  )  {
            ret = false;
        
        
        // togglable wall
        } else if ( this.togglables[ tilecoord  ] && 
            this.togglables[ tilecoord ].item_id >= 50 && this.togglables[ tilecoord ].item_id <= 51 &&
            this.togglables[ tilecoord ].state == 1  )  {

           ret = false;
        

        // recessed wall
        } else if ( this.creatables[ tilecoord ] && this.creatables[ tilecoord ].item_id == 1 ) {
            ret = false
        

        // Clone machine 
        } else if ( this.current_level_obj[  this.current_level_obj_index["item"] ].data[  tilecoord  ] == 8  )  {
            ret = false;
        

        // Blue wall
        } else if ( this.removables[ tilecoord  ] && 
            this.removables[ tilecoord ].item_id >= 9 && this.removables[ tilecoord ].item_id <= 10  )  {
            ret = false;
        

        // Ice corner 
        } else if ( this.current_level_obj[  this.current_level_obj_index["bg"] ].data[  tilecoord  ] == 44 ) {
            if ( direction == 1 || direction == 32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["bg"] ].data[  tilecoord  ] == 45 ) {
            if ( direction == -1 || direction == 32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["bg"] ].data[  tilecoord  ] == 46 ) {
            if ( direction == 1 || direction == -32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["bg"] ].data[  tilecoord  ] == 47 ) {
            if ( direction == -1 || direction == -32 ) {
                ret = false;
            }


       

        // from other to thin wall 
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord  ] == 13  )  {
            if ( direction == 1 ) {
                ret = false;
            }   
        
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord  ] == 14  )  {
            if ( direction == 32 ) {
                ret = false;
            }   
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord  ] == 15  )  {
            if ( direction == -1 ) {
                ret = false;
            }   
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord  ] == 16  )  {
            if ( direction == -32 ) {
                ret = false;
            }  

        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord  ] == 17 ) {
            if ( direction == 1 || direction == 32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord  ] == 18 ) {
            if ( direction == -1 || direction == 32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord  ] == 19 ) {
            if ( direction == 1 || direction == -32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord  ] == 20 ) {
            if ( direction == -1 || direction == -32 ) {
                ret = false;
            }
        }
        




         // From ice corner to other tile also need to consider.
        // So we check from other tile's perspective
        if ( this.current_level_obj[  this.current_level_obj_index["bg"] ].data[  tilecoord - direction  ] == 44 ) {
            if ( direction == -1 || direction == -32 ) {

                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["bg"] ].data[  tilecoord - direction  ] == 45 ) {
            if ( direction ==  1 || direction == -32 ) {

                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["bg"] ].data[  tilecoord - direction ] == 46 ) {
            if ( direction == -1 || direction == 32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["bg"] ].data[  tilecoord - direction ] == 47 ) {
            if ( direction == 1 || direction == 32 ) {

                ret = false;
            }
        }


        // From thin wall to other
        if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord - direction  ] == 13  )  {
            if ( direction == -1 ) {
                ret = false;
            }   
        
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord - direction  ] == 14  )  {
            if ( direction == -32 ) {
                ret = false;
            }   
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord - direction  ] == 15  )  {
            if ( direction == 1 ) {
                ret = false;
            }   
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord - direction  ] == 16  )  {
            if ( direction == 32 ) {
                ret = false;
            }  

        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord - direction  ] == 17 ) {
            if ( direction == -1 || direction == -32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord - direction  ] == 18 ) {
            if ( direction == 1 || direction == -32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord - direction  ] == 19 ) {
            if ( direction == -1 || direction == 32 ) {
                ret = false;
            }
        } else if ( this.current_level_obj[  this.current_level_obj_index["fg"] ].data[  tilecoord - direction  ] == 20 ) {
            if ( direction == 1 || direction == 32 ) {
                ret = false;
            }
       
        }


        return ret;

    }


    //-------------
    tilecoord_to_position( tilecoord ):Vector3 {

        let tile_x = tilecoord % 32;
        let tile_z = ( tilecoord / 32 ) >> 0;
        let x =  tile_x  ;
        let z =  tile_z ;
        let y =  0;

        return new THREE.Vector3(x, y, z);
        
    }


    //-----------
    check_is_tile_passable_non_player( tilecoord:number , direction:number ) {

        let ret = true;

        if ( this.check_is_tile_passable_general( tilecoord , direction ) == false ) {

            ret = false;

        // lockpad (2-5) and crystal door(6)
        } else if ( this.removables[ tilecoord  ] && 
            this.removables[ tilecoord ].item_id >= 2 && this.removables[ tilecoord ].item_id <= 6  )  {
            ret = false;
                
        // sokoban lock door
        } else if ( this.removables[ tilecoord ] && this.removables[ tilecoord ].item_id == 21 ) {
            ret = false;        
        }    
        return ret;

    }

    //----
    // CHECK BLOCK PASSABLE
    check_is_tile_passable_for_movable_block( tilecoord:number ,  direction:number ) {

        let ret = true;
        
        if ( this.check_is_tile_passable_non_player( tilecoord , direction ) == false ) {
            ret = false;

        // Movable blocks vs movable blocks
        } else if ( this.movables[ tilecoord ] ) {
            ret = false;

        // Should not crush monster with blocks
        } else if ( this.monsters[ tilecoord ] ) {
            
            ret = false;

        // Dirt
        } else if ( this.creatables[ tilecoord ] && this.creatables[ tilecoord ].item_id == 11) {
            ret = false;
        }
        return ret;
    }


    //-------
    // CITPM

    check_is_tile_passable_for_monster( tilecoord:number , monster_type:number , direction:number ) {

        let ret = true;
        
        let tile_data_bg    = this.current_level_obj[ this.current_level_obj_index["bg"] ].data[ tilecoord ];
        let tile_data_item  = this.current_level_obj[ this.current_level_obj_index["item"] ].data[ tilecoord ];

        if ( this.check_is_tile_passable_non_player( tilecoord, direction ) == false ) {

            ret = false;

        } else if ( this.creatables[ tilecoord ] && this.creatables[ tilecoord ].item_id == 11 ) {
            
            ret = false;
        
        } else if ( tile_data_bg == 12 ) {
            
            ret = false;


        } else if ( this.monsters[ tilecoord ] ) {
            
            ret = false;
            
        } else if ( this.pickables[ tilecoord ] ) {

            ret = false;

        // recessed wall
        } else if ( tile_data_item == 53 ) {

            ret = false


        // exit
        } else if ( tile_data_bg == 34 ) {

            ret = false;
        
        // Movable blocks (7), 
        } else if ( this.movables[ tilecoord ] ) {
            ret = false;
        

        // For Fire. All monsters except fireball(101) treat it as wall
        } else if ( this.removables[ tilecoord ] && this.removables[tilecoord ].item_id == 38 ) {
            
            if ( monster_type != 101 ) {
                ret = false;
            }
        
        }
        
        return ret;
    }


    //-------
    // CHECK PLAYER PASSABLE
    check_is_tile_passable_for_player( tilecoord:number , direction:number ) {

        let ret = true;
        
        // player is trapped
        if ( this.player.istrapped == 1 ) {
            return false;
        }

        // Generic check
        if ( this.check_is_tile_passable_general( tilecoord , direction ) == false ) {

            ret = false;
            
        // Movable blocks (7), if there's a movable block, check if pushable or not.
        } else if ( this.movables[ tilecoord ] ) {
            
            if ( this.check_is_tile_passable_for_movable_block( tilecoord + direction , direction  ) == true ) {
               
            } else {
                // Cannot push into
                ret = false;
            }
        }

        // For lock, if got key then open otherwise block
        if ( this.removables[ tilecoord  ] && [2,3,4,5,6,21,9,10].indexOf( this.removables[ tilecoord ].item_id ) > -1 ) {

            ret = this.open_lock_if_bump_into_one( tilecoord );
            
        } 
                
        return ret;
    }


    //-----
    get_y_rot_by_direction( direction:number ) {
        
        if ( direction == -1 ) {
            return -Math.PI/2;
        } else if ( direction == -32 ) {
            return Math.PI;
        } else if ( direction == 1 ) {
            return Math.PI/2
        } else if ( direction == 32 ) {
            return 0
        }
        return 0;
    }

    //--------
    //bookmark7
    open_lock_if_bump_into_one( tilecoord:number ) {
        
        let ret = false;

        
        if ( this.removables[ tilecoord ] != null ) {
            
            let tile    = this.removables[ tilecoord ];
            let item_id = tile.item_id;

            
            // 2-5 padlock bumped
            if ( item_id >= 2 && item_id <= 5 ) {

                let key_id = item_id + 64;
                let inv_id = this.search_inventories_for_item( key_id );
                if ( inv_id > -1 ) {
                    
                    this.remove_item_from_inventories( key_id );
                    this.threejs_scene.remove( tile );
                    delete this.removables[ tilecoord ];
                    this.snds["switch"].play();

                    ret = true;
                } else {
                    this.snds["denied"].play();
                }
                

            // 6 crystal wall bumped
            } else if ( item_id == 6 ) {
                
                if ( this.chip_remaining <= 0 ) {

                    this.snds["success"].play();
                    this.threejs_scene.remove( tile );
                    delete this.removables[ tilecoord ];
                    ret = true;
                    
                } else {
                    this.snds["denied"].play();
                } 
            
            // 21 sokoban wall bumped
            } else if ( item_id == 21 ) {
                
                

            // 9 - 10: hidden wall bumped
            } else if ( item_id == 9 ) {

                tile.children[0].material = this.models["wall"].scene.children[0].material;
                
            } else if ( item_id == 10 ) {
                this.threejs_scene.remove( tile );
                delete this.removables[ tilecoord ];
                this.snds["buttonshort"].play();
                ret = true;

                
            }
        }
        return ret;
    }


    //--------
    move_player(  direction:number ) {

        if ( this.game_state != 0 ) {
            return;
        }

        // player's involuntary movement.
        if ( this.player.lerp_progress != null ) {
            return;
        }

        let cur_tilecoord   = this.player.registered_position.z * 32 + this.player.registered_position.x ;
        let new_tilecoord   = this.player.registered_position.z * 32 + this.player.registered_position.x + direction;
        
        if ( this.check_is_tile_passable_for_player( new_tilecoord , direction ) == true ) {
            
            this.player.lerp_progress   = 0;
            this.player.lerp_start_pos  = this.tilecoord_to_position( cur_tilecoord );
            this.player.lerp_start_pos.y = this.player.position.y;

            this.player.lerp_end_pos    = this.tilecoord_to_position( new_tilecoord );
            this.player.lerp_end_pos.y = this.player.position.y;
            
            this.player.direction       = direction;
            this.player.new_tilecoord   = new_tilecoord;
            this.player.tilecoord       = cur_tilecoord;
            this.player.speed           = this.setting_initial_speed; 
            
        } else {
            //this.open_lock_if_bump_into_one( new_tilecoord );
        }
    }


    //------------
    search_inventories_for_item( item_id ) {
        for ( let i = 0 ; i < this.inventories.length ; i++ ) {
            if ( this.inventories[i].item_id == item_id ) {
                return i;   
            }
        }
        return -1;
    }

    //---------
    add_item_to_inventories( item_id ) {
        let inv_id =  this.search_inventories_for_item( item_id );
        if ( inv_id == -1 ) {
            
            let imgc = this.add.container( this.inventories.length * 40 + 10 , 10 );
            let img = this.add.image( 0, 0 , 'tileset', item_id - 65 ).setOrigin(0,0).setScale(0.3,0.3);
            imgc.add(img);
            this.inventories.push( { item_id: item_id, count: 1, imgc: imgc } );

        } else {
            let inv_item = this.inventories[inv_id]
            inv_item.count += 1;
            let imgc = this.inventories[inv_id].imgc;
            if ( inv_item.txtCount == null ) {
                inv_item.txtCount = this.add.text( 30 , 40 , inv_item.count , {
                    font: '10px Inter',
                    fill: '#fff',
                }).setOrigin(1, 1);
                imgc.add( inv_item.txtCount ); 
            } else {
                inv_item.txtCount.setText( inv_item.count );
            }
                        
        }
    }

    

    //------
    rearrange_inventories_imgs() {
        for ( let i = 0 ; i < this.inventories.length ; i++ ) {
            let item = this.inventories[i];
            item.imgc.x = i * 40 + 10;
        }
    }

    //-----------
    remove_item_from_inventories( item_id ) {

        for ( let i = this.inventories.length - 1 ; i >= 0 ; i-- ) {
            
            let item = this.inventories[i];

            if ( item.item_id == item_id ) {
                if ( item.count > 1 ) {
                    item.count -= 1;
                    if ( item.count > 1 ) {
                        item.txtCount.setText( item.count );
                    } else {
                        item.txtCount.destroy();
                        item.txtCount = null;

                    }
                } else {
                    item.imgc.destroy();
                    this.inventories.splice(i,1 );
                }
                this.rearrange_inventories_imgs();
                break;
            }
        }
    }

    //----
    render_chip_remaining() {
        this.txtChipRemaining.setText("Crystals Remaining : " + this.chip_remaining );
    }

    //-----
    victory( v_tilecoord:number ) {

        for ( let i = this.static_tiles.length - 1 ; i >= 0 ; i-- ) {
            
            let tile        = this.static_tiles[i];
            let tilecoord   = this.static_tiles[i].tilecoord ;
            if ( tilecoord != v_tilecoord ) {
                this.threejs_scene.remove(tile);
                this.static_tiles.splice( i , 1 );
            } 
        }

        
        this.display_text_effect("GOOD JOB!", 40 );

        this.snds["victory"].play();
        this.txtNotification.setText("Congratulations. Press (E) to proceed to next level");
            
        this.clear_dynamic_objects();
        this.game_state = 3;
        this.txtContainerStatus.setVisible(0);

        

        document.dispatchEvent(new CustomEvent('submit', {detail: {score: this.level_index + 1 }}));

    }


    
    //-----
    // E on pressed
    next_level() {

        if ( this.game_state == 3 ) {

            this.loadingText.setVisible(1);
            this.txtNotification.setText( "Please wait a while... Generating level...");

            this.clear_static_objects();
            this.clear_inventories();
            
            this.level_index = ( this.level_index + 1 )  % this.levels.length ;
            this.load_level( );
            
               
        }
    }

    

    //----
    render_level_status() {

        this.txtLevel.setText("Level : " + (this.level_index + 1) );
        this.render_chip_remaining();
        this.txtContainerStatus.setVisible(1);

    }

    //------
    clone_monster( tilecoord:number , type:number, direction:number ) {

        if ( this.check_is_tile_passable_for_monster( tilecoord + direction, type , direction ) == true  ) {

            //console.log( "Cloned" + " " + tilecoord );
            this.create_monster( tilecoord + direction, type , direction);
        } else {
            //console.log("space occupied");
        }
    }

    //--------
    create_dirt( tilecoord:number , type:number ) {

        if ( this.creatables[ tilecoord ] == null ) {

            let x_tile  = tilecoord % 32;
            let z_tile  = (tilecoord / 32 ) >> 0;

            let tile = this.create_textured_block( 
                x_tile ,
                0, 
                z_tile , 
                type,
                1,
                1,
            );
            tile.item_id = type;
            this.creatables[ tilecoord ] = tile ;
        }

    }

    //---------
    create_monster( tilecoord:number, type:number , direction:number ) {

        //console.log("create monster", type, tilecoord , direction );

        let static_glbs = [ 97 , 98, 100, 101 , 102,  103, 104, 105, 106 ];
        let static_glbs_index = static_glbs.indexOf( type ) 
                        
        if ( static_glbs_index > -1  ) {

            let x_tile  = tilecoord % 32;
            let z_tile  = (tilecoord / 32 ) >> 0;
            let size    = [ 0.8, 1.2 , 0.9 , 1 , 0.7 ,    0.9,  0.8 , 0.7, 0.7 ][ static_glbs_index ]
            let y       = 0
            
            
            if ( this.monsters[ tilecoord ] == null ) {

                let tile = this.create_textured_block( 
                    x_tile,
                    y, 
                    z_tile,
                    type,
                    size,
                    size
                );
                
                if ( direction == null ) {
                    direction = 1;
                }

                tile.rotation.y = this.get_y_rot_by_direction(direction);
                tile.direction = direction;
                tile.item_id = type;
                tile.monster_id = tilecoord;
                this.monsters[ tilecoord ] = tile;
                this.check_monster_current_tile(  tilecoord , tilecoord - direction , "monster creation" );
                this.monster_next_move( tilecoord ); 
                
            }
        }
        
    }



    //------------
    get_left_direction( head_direction ) {

        // North
        if ( head_direction == -32 ) {
            return -1;

        // West
        } else if ( head_direction == -1 ) {
            return 32;
        
        // South
        } else if ( head_direction == 32 ) {
            return 1;
        
        // East
        } else if ( head_direction == 1 ) {
            return -32;
        }
        return -1;
    }


    //----------------------
    // Can be called by player, monster or movable block
    tile_button_on_pressed( tilecoord:number , tile_data_item:number ) {

        this.snds["buttonshort"].play();


        // 80: Red button
        if ( tile_data_item == 80 ) {
            if ( this.src_and_target[ tilecoord ] ) {
                let target_tilecoord         = this.src_and_target[ tilecoord ];
                let target_tile_data_item   = this.current_level_obj[ this.current_level_obj_index["item"] ].data[ target_tilecoord ];

                // activate clone 
                if ( target_tile_data_item == 8 && this.monsters[ target_tilecoord ] ) {
                    
                    //console.log("BBB", "tile_button_on_pressed", tilecoord );

                    this.clone_monster( 
                        target_tilecoord, 
                        this.monsters[ target_tilecoord ].item_id, 
                        this.monsters[ target_tilecoord ].direction  
                    );
                }
            }
        }

        // 48: Blue button,
        if ( tile_data_item == 48 ) {
            for ( let tilecoord in this.monsters ) {
                if ( this.monsters[tilecoord] && this.monsters[tilecoord].item_id == 98 ) {
                    this.monsters[ tilecoord ].direction = -this.monsters[ tilecoord ].direction;
                }
            }
        }

        // 49: Green button
        if ( tile_data_item == 49 ) {
            
            for ( let tilecoord in this.togglables ) {

                // Make sure it is 50-51: toggle door
                if ( this.togglables[ tilecoord ].item_id >= 50 && this.togglables[ tilecoord ].item_id <= 51 ) {

                    this.togglables[ tilecoord ].state = 1 - this.togglables[ tilecoord ].state;
                    let tile = this.togglables[ tilecoord ] ;
                    if ( this.togglables[ tilecoord ].state == 0 ) {
                        tile.position.y = -3;
                    } else {
                        tile.position.y = 0;
                    }
                }
            }
        }

        // 81: Yellow button 
        if ( tile_data_item == 81 ) {

            if ( this.src_and_target[ tilecoord ] ) {
                let target_tilecoord         = this.src_and_target[ tilecoord ];
                let target_tile_data_item   = this.current_level_obj[ this.current_level_obj_index["item"] ].data[ target_tilecoord ];

                // Release trap which has monster
                if ( target_tile_data_item == 52 && this.monsters[ target_tilecoord ] && this.monsters[ target_tilecoord].istrapped == 1 ) {
                    
                    this.monsters[ target_tilecoord].istrapped = null;
                    this.monster_next_move( target_tilecoord );
                }

                if ( target_tile_data_item == 52 && this.player.istrapped == 1 ) {
                    this.player.istrapped = null;
                }
            }
                
        }

        //82 Grey button
        if ( tile_data_item == 82 ) {
            
        }
        
    }
    

    //-------------------
    //bookmark5
    monster_next_move( tilecoord:number ) {

        //console.log( "monster_next_move", tilecoord );

        if ( this.monsters[ tilecoord ] ) {

            let monster = this.monsters[tilecoord];

            if ( monster.istrapped != 1 && monster.lerp_progress == null )  {

                // Initialize direction if not already.
                if ( monster.direction == null ) {

                    if ( monster.item_id == 102 || monster.item_id == 101 || monster.item_id == 104 ) {
                        monster.direction = -1;
                    } else {
                        monster.direction = -32;
                    }
                }
                
                
                // If on clone machine, need not to perform where to move next
                if ( this.current_level_obj[ this.current_level_obj_index["item"] ].data[ tilecoord ] == 8 ) {
                    return ;
                }
                
                let s_tile_x =  tilecoord % 32;
                let s_tile_z = (tilecoord / 32) >> 0;

                let sx = s_tile_x;
                let sy = monster.position.y; 
                let sz = s_tile_z;
                let e_tilecoord = tilecoord;
                
                let left_direction = this.get_left_direction( monster.direction );
                    
                //--------------------------------
                // 97 red spider 
                if ( monster.item_id == 97 ) {

                    if ( this.check_is_tile_passable_for_monster(  tilecoord + left_direction, monster.item_id , left_direction ) == true ) {

                        // left
                        e_tilecoord = tilecoord + left_direction;
                        monster.direction = left_direction;
                        
                    } else if ( this.check_is_tile_passable_for_monster( tilecoord + monster.direction, monster.item_id , monster.direction ) == true ) {

                        // forward
                        e_tilecoord = tilecoord + monster.direction;
                        
                    } else if ( this.check_is_tile_passable_for_monster( tilecoord - left_direction , monster.item_id, -left_direction ) == true ) {
                        
                        // right
                        e_tilecoord = tilecoord - left_direction;
                        monster.direction = -left_direction;
                    
                    } else if ( this.check_is_tile_passable_for_monster( tilecoord - monster.direction, monster.item_id , monster.direction ) == true ) {

                        // backward
                        e_tilecoord = tilecoord - monster.direction;
                        monster.direction = -monster.direction;
                    }
                    monster.speed = this.setting_initial_speed * 0.9;
                    
                    
                // 104 blue spider 
                } else if ( monster.item_id == 104 ) {

                    if ( this.check_is_tile_passable_for_monster(  tilecoord - left_direction, monster.item_id , -left_direction ) == true ) {

                        // right
                        e_tilecoord = tilecoord - left_direction;
                        monster.direction = -left_direction;
                        
                    } else if ( this.check_is_tile_passable_for_monster( tilecoord + monster.direction, monster.item_id , monster.direction ) == true ) {

                        // Forward
                        e_tilecoord = tilecoord + monster.direction;
                        
                    } else if ( this.check_is_tile_passable_for_monster( tilecoord + left_direction , monster.item_id, left_direction ) == true ) {
                        
                        // left
                        e_tilecoord = tilecoord + left_direction;
                        monster.direction = left_direction;
                    
                    } else if ( this.check_is_tile_passable_for_monster( tilecoord - monster.direction, monster.item_id , monster.direction ) == true ) {

                        // backward
                        e_tilecoord = tilecoord - monster.direction;
                        monster.direction = -monster.direction;
                    }
                    monster.speed = this.setting_initial_speed * 0.9;
                
                

                //--------------------------------
                // 98 blue tank
                } else if ( monster.item_id == 98 )  {

                    e_tilecoord = tilecoord;
                    if ( this.check_is_tile_passable_for_monster( tilecoord + monster.direction, monster.item_id , monster.direction ) == true ) {
                        // Up
                        e_tilecoord = tilecoord + monster.direction;
                    }
                    monster.speed = this.setting_initial_speed * 1.0;
                
                //----------------------------
                // 100 glider
                } else if ( monster.item_id == 100 ) {

                    if ( this.check_is_tile_passable_for_monster(  tilecoord + monster.direction, monster.item_id , monster.direction ) == true ) {
                        // Front
                        e_tilecoord = tilecoord + monster.direction;

                    } else if ( this.check_is_tile_passable_for_monster(  tilecoord + left_direction, monster.item_id, left_direction ) == true ) {

                        // left
                        e_tilecoord = tilecoord + left_direction;
                        monster.direction = left_direction;
                        
                    } else if ( this.check_is_tile_passable_for_monster(  tilecoord - left_direction, monster.item_id , -left_direction ) == true ) {
                        
                        // right
                        e_tilecoord = tilecoord - left_direction;
                        monster.direction = -left_direction;
                    
                    } else if ( this.check_is_tile_passable_for_monster(  tilecoord - monster.direction , monster.item_id, -monster.direction ) == true ) {

                        // back
                        e_tilecoord = tilecoord - monster.direction;
                        monster.direction = -monster.direction;
                    }
                    monster.speed = this.setting_initial_speed * 1.0;

                //-----------
                // 101 Fireball 
                } else if ( monster.item_id == 101 ) {

                    if ( this.check_is_tile_passable_for_monster(   tilecoord + monster.direction, monster.item_id , monster.direction ) == true ) {
                        // Front
                        e_tilecoord = tilecoord + monster.direction;

                    } else if ( this.check_is_tile_passable_for_monster(  tilecoord - left_direction, monster.item_id , -left_direction ) == true ) {
                        
                        // right
                        e_tilecoord = tilecoord - left_direction;
                        monster.direction = -left_direction;

                    } else if ( this.check_is_tile_passable_for_monster(  tilecoord + left_direction, monster.item_id, left_direction ) == true ) {

                        // left
                        e_tilecoord = tilecoord + left_direction;
                        monster.direction = left_direction;
                    
                    } else if ( this.check_is_tile_passable_for_monster(  tilecoord - monster.direction, monster.item_id , -monster.direction ) == true ) {

                        // back
                        e_tilecoord = tilecoord - monster.direction;
                        monster.direction = -monster.direction;
                    }

                    // speed
                    monster.speed = this.setting_initial_speed * 1.10;

                //--------------
                // 102 Pink ball
                } else if ( monster.item_id == 102 ) {

                    if ( this.check_is_tile_passable_for_monster(   tilecoord + monster.direction, monster.item_id, monster.direction ) == true ) {

                        // front
                        e_tilecoord = tilecoord + monster.direction;

                    } else if ( this.check_is_tile_passable_for_monster( tilecoord - monster.direction, monster.item_id, -monster.direction ) == true ) {

                        // back
                        e_tilecoord = tilecoord - monster.direction;
                        monster.direction = -monster.direction;
                    }
                    monster.speed = this.setting_initial_speed * 0.7;
                
                
                //-----------
                // 103 pacman
                // moves either vertically or horizontally toward player one square at a time, 
                // always taking the longer path, and vertically if tied
                } else if ( monster.item_id == 103 ) {
                    
                    let x_diff = this.player.registered_position.x - s_tile_x;
                    let z_diff = this.player.registered_position.z - s_tile_z;

                    let possible_moves:any[] = [];
                    if ( Math.abs( z_diff ) >= Math.abs( x_diff ) ) {
                        if ( z_diff != 0 ) {
                            possible_moves.push( z_diff > 0 ? 32: -32 );
                        }
                        if ( x_diff != 0 ) {
                            possible_moves.push( x_diff > 0 ?  1:  -1 );
                        }
                    } else {
                        if ( x_diff != 0 ) {
                            possible_moves.push( x_diff > 0 ?  1:  -1 );
                        }
                        if ( z_diff != 0 ) {
                            possible_moves.push( z_diff > 0 ? 32: -32 );
                        }
                    }
                    
                    for ( let i = 0 ; i < possible_moves.length ; i++ ) {
                        let direction = possible_moves[i];
                        if (  this.check_is_tile_passable_for_monster( tilecoord + direction, monster.item_id, direction ) == true ) {   
                            e_tilecoord = tilecoord + direction;
                            monster.direction = direction;
                            break; 
                        }
                    }
                    monster.speed = this.setting_initial_speed * 0.6;

                }

                
                    
                let e_tile_x =   e_tilecoord % 32;
                let e_tile_z = ( e_tilecoord / 32)  >> 0;
                let ex = e_tile_x;
                let ey = sy; 
                let ez = e_tile_z;

                monster.lerp_progress = 0;
                monster.lerp_start_pos = new THREE.Vector3( sx, sy, sz );
                monster.lerp_end_pos   = new THREE.Vector3( ex, ey, ez );
                
                
                monster.tilecoord = tilecoord;   
                monster.new_tilecoord = e_tilecoord

                //console.log("mnm", tilecoord, monster.new_tilecoord );

                // Take the new tilecoord 
                if ( e_tilecoord != tilecoord ) {

                    monster.passed_tile_action_done = null;
                    delete this.monsters[tilecoord];
                    this.monsters[e_tilecoord] = monster
                } else {
                    monster.passed_tile_action_done = 1;
                }
            }   
        }
    }

    //---
    clear_static_objects() {
        for ( let i = this.static_tiles.length - 1 ; i >= 0 ; i-- ) {
            let tile = this.static_tiles[i];
            this.threejs_scene.remove(tile);
            this.static_tiles.splice( i , 1 );
        }
    }


    //---
    clear_dynamic_objects() {

        this.chip_remaining = 0;
        this.player.position.y = 0;
        this.player.lerp_progress   = null;
        this.player.passed_tile_action_done = null;
        this.player.istrapped = null;
        

        for ( let tilecoord in this.pickables ) {
            let tile = this.pickables[tilecoord];
            this.threejs_scene.remove(tile);
            delete this.pickables[tilecoord];
        } 
        for ( let tilecoord in this.removables ) {
            let tile = this.removables[tilecoord];
            this.threejs_scene.remove(tile);
            delete this.removables[tilecoord];
        }
        for ( let tilecoord in this.movables ) {
            let tile = this.movables[tilecoord];
            this.threejs_scene.remove(tile);
            delete this.movables[tilecoord];
        }
        
        for ( let tilecoord in this.creatables ) {
            let tile = this.creatables[tilecoord];
            this.threejs_scene.remove(tile);
            delete this.creatables[tilecoord];
        }
        for ( let tilecoord in this.monsters ) {
            let tile = this.monsters[tilecoord];
            this.threejs_scene.remove(tile);
            delete this.monsters[tilecoord];
        }
        
        for ( let tilecoord in this.togglables ) {
            let tile = this.togglables[tilecoord];
            this.threejs_scene.remove(tile);
            delete this.togglables[tilecoord];
        }       
        for ( let src in this.src_and_target ) {
            delete this.src_and_target[src];
        }
        for ( let tilecoord in this.directions ) {
            delete this.directions[ tilecoord ] ;
        }
        for ( let tilecoord in this.hints ) {
            delete this.hints[ tilecoord ] ;
        }
        for ( let tilecoord in this.sokoban_holes ) {
            delete this.sokoban_holes[ tilecoord ];
        }
        for ( let tilecoord in this.exits ) {
            delete this.exits[ tilecoord ];
        }

        
    }



    //-------
    clear_inventories() {

        for ( let i = this.inventories.length - 1 ; i >= 0 ; i-- ) {
            
            let item = this.inventories[i];
            item.imgc.destroy();
            this.inventories.splice(i,1 );
        }
    }

    //-------
    clear_inventories_footgears() {

        for ( let i = this.inventories.length - 1 ; i >= 0 ; i-- ) {
            
            let item = this.inventories[i];
            if ( item.item_id >= 70 ) { 
                item.imgc.destroy();
                this.inventories.splice(i,1 );
            }
        }
        this.rearrange_inventories_imgs();

    }



    //----------------
    pickup_items() {

        let tilecoord = Math.round( this.player.registered_position.z * 32 + this.player.registered_position.x ) ;

        if ( this.pickables[ tilecoord   ] != null ) {
            // Pick up item if land on one.
            let tile     = this.pickables[ tilecoord  ];
            let item_id = tile.item_id;
            
            this.threejs_scene.remove( tile );
            delete this.pickables[ tilecoord  ] ;
            
            if ( item_id >= 66 && item_id <= 73 ) {

                this.snds[ "hit" ].play();
                this.add_item_to_inventories( item_id );
            
            } else if ( item_id == 65 ) {
                
                this.chip_remaining -= 1;
                this.snds[ "crystal" ].play();
                this.render_chip_remaining();

            }
            
        }
    }

    

    //----------
    player_pos( elapsed ) {
        
        // player
        if ( this.player.lerp_progress != null ) {
            
            this.player.lerp_progress += this.player.speed * elapsed * 0.1;
            if ( this.player.lerp_progress > 1.0 ) {
                this.player.lerp_progress = 1.0;
            }

            this.player.position.lerpVectors( this.player.lerp_start_pos,  this.player.lerp_end_pos ,  this.player.lerp_progress ) ;
            this.player.rotation.y = this.get_y_rot_by_direction( this.player.direction );

            //Animator.playSingleAnimation( _this.player , 'walk', false )
            this.player.mixer.clipAction( this.models["robot"].animations[2]).stop() ; 
            this.player.mixer.clipAction( this.models["robot"].animations[10]).play() ; 



            // UPDATE PLAYER

            // If to be entered tile is not ice or force floor, then can start check_player_current_tile() at lerp progress 0.5
            //  otherwise, we only do it at lerp progress of 0.99 for smoother animation.
            //   The reason for doing early at 0.5 is because when pushing block or encountering monster,
            //      the player doesn't need to wait until the full tile is entered.

            let passed_tile_lerp_threshold = 0.5;
            if ( [39,40,41,42,43,44,45,46,47,34].indexOf( this.current_level_obj[ this.current_level_obj_index["bg"] ].data[ this.player.new_tilecoord] ) > -1 ) { 
                passed_tile_lerp_threshold = 0.99;
            }


            if ( this.player.lerp_progress >= passed_tile_lerp_threshold && this.player.passed_tile_action_done == null ) {

                this.player.passed_tile_action_done = 1;
                this.player.registered_position.x =   this.player.new_tilecoord % 32;
                this.player.registered_position.z = ( this.player.new_tilecoord / 32 ) >> 0;  
                this.pickup_items();
                this.push_movable_block( this.player.direction );
                this.check_player_current_tile( this.player.tilecoord ); 
            }   

            if ( this.player.lerp_progress >= 0.5 ) {
                this.player.registered_position.x =   this.player.new_tilecoord % 32;
                this.player.registered_position.z = ( this.player.new_tilecoord / 32 ) >> 0;  
            }
            
            if (  this.player.lerp_progress >= 0.99 ) {
                
                this.player.lerp_progress   = null;
                this.player_align_avatar_to_player_pos_tilecoord();
                this.player.passed_tile_action_done = null;
            }
        } 


        // Forward always takes precedence
        let has_down = 0;
        if ( this.keystates[38] == 1 ) { 
            this.player.rotation.y = Math.PI;

            this.move_player(-32);
            has_down = 1;

        } else if ( this.keystates[37] == 1 ) {

            this.player.rotation.y = -Math.PI/2;
            this.move_player(-1);
            has_down = 1;
                
        } else if ( this.keystates[39]  == 1) {
            this.player.rotation.y = Math.PI/2;
            this.move_player(1);
            has_down = 1;
            
        } else if ( this.keystates[40]  == 1) {
            
            this.player.rotation.y = 0;
            this.move_player(32);
            has_down = 1;
            
        }
        
        if ( this.player.lerp_progress == null ) {
            this.player.mixer.clipAction( this.models["robot"].animations[2]).play() ; 
            this.player.mixer.clipAction( this.models["robot"].animations[10]).stop() ; 
        }


    }
    
    //-----
    camera_pos( elapsed  ) {

        this.threejs_camera.target_x = this.player.position.x + this.setting_camera_xoff;
        this.threejs_camera.target_z = this.player.position.z + this.setting_camera_range;
        
        this.threejs_camera.position.x += ( this.threejs_camera.target_x - this.threejs_camera.position.x ) * 0.075 * elapsed * 0.1;
        this.threejs_camera.position.z += ( this.threejs_camera.target_z - this.threejs_camera.position.z ) * 0.075 * elapsed * 0.1;
        
        // Light
        this.light.position.z = this.player.position.z - 10;
        this.light.target.position.set( 0, this.player.position.y, this.player.position.z );
        this.light.target.updateMatrixWorld();

    }

    

    //----
    smoke_pos( elapsed )  {

        for ( let i = this.smokes.length - 1; i >= 0 ; i-- ) {

            let smoke = this.smokes[i];
            if ( smoke.elapsed >= smoke.elapsed_threshold ) {
                
                smoke.elapsed = 0;
                smoke.frame_index = smoke.frame_index + 1;

                let frame_x = smoke.frame_index % 4;
                let frame_y = ( smoke.frame_index / 4 ) >> 0;

                this.setUV(  smoke.geometry.attributes.uv, 4,4, frame_y, frame_x );
                
                if ( smoke.frame_index >= smoke.frame_index_max ) {
                    this.smokes.splice(i, 1 );
                    this.recycle_bins.push( smoke );
                    this.threejs_scene.remove( smoke );
                }
                
            } else {
                smoke.elapsed += elapsed;
            }
        }
    }

    //-------
    movable_block_pos( elapsed ) {

        // movable blocks
        for ( let tilecoord in this.movables ) {
            
            let tile = this.movables[tilecoord];

            if ( tile.lerp_progress != null ) {
                
                tile.lerp_progress += tile.speed * elapsed * 0.1;

                if ( tile.lerp_progress > 1.0 ) {
                    tile.lerp_progress = 1.0;
                }
                tile.position.lerpVectors( tile.lerp_start_pos,  tile.lerp_end_pos ,  tile.lerp_progress ) ;
                
                // Reach destination
                if ( tile.lerp_progress >= 0.99 ) {
                    tile.lerp_progress = null ;

                    if ( tile.passed_tile_action_done == null  ) {
                        tile.passed_tile_action_done = 1;
                        this.check_movable_block_current_tile( tile.new_tilecoord, tile.tilecoord );
                        if ( this.snds["stone"].isPlaying == false ) {
                            this.snds["stone"].play();
                        }
                    }
                }
            }
        }
    }



    //-------
    monster_pos( elapsed ) {

        // Monster
        for ( let key in this.monsters ) {

            let tilecoord = parseInt(key);
            let monster   = this.monsters[tilecoord];
            
            if ( monster.lerp_progress != null ) {

                let is_on_clone_machine = 0;
                if ( this.current_level_obj[ this.current_level_obj_index["item"] ].data[ tilecoord ] == 8 ) {
                    is_on_clone_machine = 1;
                }

                // 97 red spider 
                // 98 bluetank
                // 100 glider
                // 101 fireball
                // 102 pink ball
                // 103 pacman
                // 104 blue spider

                if ( [ 97, 98, 100, 101, 102, 103, 104 ].indexOf( monster.item_id ) > -1 ) {

                    if ( monster.istrapped != 1 && is_on_clone_machine != 1 ) {

                        monster.lerp_progress += monster.speed * elapsed * 0.1;
                        if ( monster.lerp_progress > 1.0 ) {
                            monster.lerp_progress = 1.0;
                        }
                        monster.position.lerpVectors( monster.lerp_start_pos, monster.lerp_end_pos, monster.lerp_progress );
                        if ( monster.item_id == 103 ) {
                            monster.lookAt( this.player.position );
                        } else {
                            monster.rotation.y = this.get_y_rot_by_direction( monster.direction);
                        }

                        
                        if ( monster.lerp_progress <= 0.5 ) {
                            // if slerp progress <50% the monster is counted as still at current tile.
                            if ( this.player.registered_position.z * 32 + this.player.registered_position.x == monster.tilecoord ) {
                                this.gameover("Killed by a monster.", monster.item_id );
                            }
                        } else {
                            // if slerp progress >50 the monster is counted as at the destination tile
                            if ( this.player.registered_position.z * 32 + this.player.registered_position.x == monster.new_tilecoord ) {
                                this.gameover("Killed by a monster..", monster.item_id );
                            }
                        }

                        if ( monster.lerp_progress >= 0.99 ) {
                            
                            monster.lerp_progress = null;
                            
                            if ( monster.passed_tile_action_done == null ) {
                                monster.passed_tile_action_done = 1;
                                this.check_monster_current_tile(  monster.new_tilecoord , monster.tilecoord , "lerp_done");
                            }
                            this.monster_next_move( monster.new_tilecoord );
                            
                            
                        }
                    }
                        
                    

                } 
            }
        }
        
    }


    //------------
    update(time, elapsed ) {
        
        if ( [0,2,3].indexOf( this.game_state ) > -1 ) {
            this.text_effect_pos( elapsed );
            this.smoke_pos( elapsed );
        }
        if ( this.game_state == 0 ) {
            this.player_pos( elapsed );
            this.movable_block_pos( elapsed );
            this.monster_pos( elapsed );
            this.camera_pos( elapsed );
            this.player.mixer.update(elapsed * 0.00380);
        } 

        if ( [0,2,3].indexOf( this.game_state ) > -1 ) {
            this.threejs_renderer.render( this.threejs_scene, this.threejs_camera );
        }
    }
}

