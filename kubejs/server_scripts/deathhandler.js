// priority: 0

const $DamageTypes = Java.loadClass("net.minecraft.world.damagesource.DamageTypes")

const MAX_SPECTATOR_Y = 16
const MIN_SPECTATOR_Y = -8

EntityEvents.death("player", event => {
    let { player, server } = event

    player.sendData("set_fm_variable", {key: "inRun", value: "false"})
    player.inventory.clear()

    if (global.getSurvivorsOtherThanPlayer(server, player).length) {
        player.health = player.maxHealth
        player.setGameMode("spectator")
        event.cancel()
    } else global.killEVERYONE(server)
})
EntityEvents.hurt("player", event => {
    if (event.source.is($DamageTypes.FALL)) event.cancel()
})
PlayerEvents.respawned(event => global.startBackgroundMusic(event.player, "hub"))