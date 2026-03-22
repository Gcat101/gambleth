// priority: 100

const $StructureTemplateManager = Java.loadClass("net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplateManager")
const $StructurePlaceSettings = Java.loadClass("net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings")

const CHIP_TOAST_ITEM_TAG = "gambleth:poker_chip_stacked"
const MUSIC_UPDATE_TICK_COUNT = 4200

global.randomInt = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min))
global.randomFloat = (min, max) => Math.random() * (max - min) + min
global.randomPick = arr => arr[global.randomInt(0, arr.length)]
global.tagToStringList = tag => {
    let list = []
    for (let i = 0; i < tag.size(); i++) list.push(tag.getString(i))
    return list
}

global.getSurvivorsOtherThanPlayer = (server, player) => server.playerList.players.filter(p => (
    p.name.string != player.name.string &&
    !p.isSpectator() && !p.isCreative()
))
global.killEVERYONE = server => server.playerList.players.forEach(p => {
    p.setGameMode("adventure")
    p.kill()

    server.persistentData.remove("currentRunID")
})
global.showToastToAll = (server, toast) => {
    server.playerList.players.forEach(p => {
        p.notify(toast)
    })
}
global.showChipCountToast = server => {
    let chipToast = new Notification()
    chipToast.text = Text.string("Chip Count:\n").bold().append(Text.yellow(server.persistentData.getInt("chipCount").toString()).bold(false))
    chipToast.itemIcon = Item.of(CHIP_TOAST_ITEM_TAG)
    chipToast.backgroundColor = Color.BLACK
    chipToast.borderColor = Color.GRAY

    global.showToastToAll(server, chipToast)
}

global.startBackgroundMusic = (player, type, dimensionToCheck) => {
    if (dimensionToCheck == null) dimensionToCheck = player.level.dimension.toString()
    if (dimensionToCheck != player.level.dimension.toString()) return

    player.server.runCommandSilent(`execute in ${dimensionToCheck} run stopsound ${player.name.string} music`)
    player.server.runCommandSilent(`execute in ${dimensionToCheck} at ${player.name.string} run playsound gambleth:music.${type} music ${player.name.string}`)
    player.server.scheduleInTicks(MUSIC_UPDATE_TICK_COUNT, () => global.startBackgroundMusic(player, type, dimensionToCheck))
}
global.startBackgroundMusicForAllPlayers = type => Utils.server.playerList.players.forEach(p => global.startBackgroundMusic(p, type))

global.chipColors = [
    "red",
    "orange",
    "green",
    "blue"
]