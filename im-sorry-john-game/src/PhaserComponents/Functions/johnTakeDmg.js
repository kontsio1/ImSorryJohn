import Phaser from "phaser";

export function johnTakeDmg(scene, dmg, dir) {
    const heartsArr = scene.hud.list
    if(!scene.john.isDead)
    {
        scene.john.isIdle = false
        scene.john.setVelocity(dir.x, dir.y)
        scene.john.setTint(0xff0000) 
        scene.time.addEvent({
            delay:100,
            callback:()=>{
                scene.john.isIdle = true
                scene.john.clearTint()
            }
        })
        scene.john.activeHp -= 1
        heartsArr[scene.john.activeHp].setTexture('heart_empty')
        heartsArr[scene.john.activeHp].anims.stop()
    }
}