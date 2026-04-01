
import {Game, CANVAS} from 'phaser';
import { globalGameData } from './GlobalGameData';

import {MyGame} from './scenes/MyGame';
import {Start} from './scenes/Start';


let gameInstance;
let version     = "v1.0.0";
let game_name   = "Crystal Maze"
let game_id     = 140001

//--------------
const getQueryParams = function () {

    const params = {};
    window.location.search.substring(1).split('&').forEach(function (param) {
        const pair = param.split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    });
    return params;
}


//--------------
const _0x3525ef = async function (message) {
    const msgBuffer = new TextEncoder().encode(message );
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

//--------------
const setVisitor = async () => {
    
    let server_host = "https://myvercel-puce.vercel.app/api"; 
    let url         = server_host + "/insert_visitor";
    let realm       = "https://play.decentraland.org"; 
    let useraddr    = getDevicePlayerId();
    let username    = "visitor";

    let signature   = await _0x3525ef( useraddr + realm );
    
    let body = {
        useraddr	 : useraddr,
        username     : username,
        scene_id     : game_id,
        signature 	 : signature,
        realm        : realm
    }
    
    let fetchopt = {
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(body),
        method: 'POST'
    };
    let _this = this;
    try {
        let resp = await fetch(url, fetchopt ).then(response => response.text())
        console.log("sent request to URL", url , "SUCCESS", resp );
        
    } catch(err) {
        console.log("error to do", url, fetchopt, err );
    }

}




//-------------------
const getDevicePlayerId = () => {
  // Try to get the stored ID first
  let id = localStorage.getItem("playerId");

  if (!id) {
    // Generate new UUID for this device/browser
    id = crypto.randomUUID();
    localStorage.setItem("playerId", id);
  }
  return id;
}




//-------------------------------
const submitHighScore = async (score, p_game_id ) => {
    
    let server_host = "https://myvercel-puce.vercel.app/api"; 
    let url = server_host + "/insert_highscore";
    
    let realm       = "https://play.decentraland.org"; 
    let useraddr    = getDevicePlayerId();
    let username    = "visitor";
    let signature =  await _0x3525ef( useraddr + realm + score )
    
    let body = {
        username	: username,
        useraddr	: useraddr,
        score   	: score,
        game_id 	: p_game_id,
        game    	: game_name,
        signature 	: signature,
        realm       : realm
    }
        
    let fetchopt = {
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(body),
        method: 'POST'
    };
    let _this = this;
    try {
        let resp = await fetch(url, fetchopt ).then(response => response.text())
        console.log("sent request to URL", url , "SUCCESS", resp );
        
    } catch(err) {
        console.log("error to do", url, fetchopt, err );
    }
    
}






//-------------------------------
const main = () => {
    
    let config = {
        type: Phaser.CANVAS,
        width: 900,
        height: 900 ,
        canvas: document.getElementById('game-container'),
        backgroundColor: '#000000',
        transparent: true,
        scale: {
            expandParent: true,
            mode: Phaser.Scale.ScaleModes.FIT,
            autoCenter: Phaser.Scale.Center.NO_CENTER,
        },
        scene: [  Start, MyGame ],
        version: version,
        input: {
            activePointers: 2,   // Allow up to 2 pointers
        }            

    };
    


    const queryParams = getQueryParams()
    gameInstance = new Game(config);
    
    let unlocked_level = localStorage.getItem("unlocked_level");
    if (!unlocked_level) {
        unlocked_level = 0;
    }
    globalGameData.unlocked_level = unlocked_level;


    //--------------
    document.addEventListener('submit', async (e) => {
        
        if ( e.detail.score  > globalGameData.unlocked_level ) {
            globalGameData.unlocked_level = e.detail.score;
            localStorage.setItem("unlocked_level", globalGameData.unlocked_level );
        }
        submitHighScore(e.detail.score, game_id );
        
    })
    
    setVisitor()
}




//-------------------------------
document.addEventListener('DOMContentLoaded', () => {
    main();
});

