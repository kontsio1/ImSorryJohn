export function johnTakeDmg(scene, dmg, dir) {
    const heartsArr = scene.hud.list

    if(!scene.john.isDead && scene.john.activeHp > 0)
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

        const previousHp = scene.john.activeHp
        const nextHp = Math.max(previousHp - dmg, 0)
        scene.john.activeHp = nextHp

        for (let hp = previousHp - 1; hp >= nextHp; hp--) {
            heartsArr[hp].setTexture('heart_empty')
            heartsArr[hp].anims.stop()
        }
    }
}