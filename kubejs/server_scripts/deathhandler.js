// priority: 0

const $DamageTypes = Java.loadClass("net.minecraft.world.damagesource.DamageTypes")

const MAX_SPECTATOR_Y = 16
const MIN_SPECTATOR_Y = -8

EntityEvents.death("player", event => {
    let { player, server } = event
    if (player.tags.contains("skip_death_logic")) return

    player.sendData("set_fm_variable", {key: "inRun", value: "false"})
    Utils.server.runCommandSilent(`clear ${player.name.string}`)

    if (global.getSurvivorsOtherThanPlayer(server, player).length) {
        player.health = player.maxHealth
        player.setGameMode("spectator")
        event.cancel()
    } else global.killEVERYONE(server)
})
EntityEvents.hurt("player", event => {
    if (event.source.is($DamageTypes.FALL)) event.cancel()
})