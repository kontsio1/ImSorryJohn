import Phaser from 'phaser';
import {useEffect} from 'react'
import { MainMenu } from './Scenes/MainMenu';
import { Level1 } from './Scenes/Level1';

export const GameHolder = () => {
    useEffect(()=>{
        const goMainMenu = new MainMenu()
        const goLevel1 = new Level1()

        const config = {
            type: Phaser.AUTO,
            title: "I'm sorry John",
            parent: 'game-container',
            width: window.innerWidth, //change this later
            height: window.innerHeight,
            pixelArt: true,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: {y:0},
                    debug: true,
                },
            },
            scene: [goMainMenu, goLevel1],
            scale: {
                zoom: 1
            }
        }
        new Phaser.Game(config)
    })
    //UseEffect-end

    return(
        <div id='game-container'>
            {/* Phaser renders here */}
        </div>
    )
}