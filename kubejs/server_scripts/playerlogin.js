// priority: 0

const STARTING_WORLD = "gambleth:cobblewall"
const STARTING_STRUCTURE = "gambleth:casino"

const SPAWN_COORDS = new BlockPos(12, 14, 6)
let tpPlayerToSpawn = (p, s) => s.runCommandSilent(`execute in ${STARTING_WORLD} run tp ${p.name.string} ${SPAWN_COORDS.x} ${SPAWN_COORDS.y} ${SPAWN_COORDS.z} 180 0`)

PlayerEvents.loggedIn(event => {
    let { player, server } = event
    let pData = server.persistentData

    player.mergeNbt({ForgeData: {PlayerPersisted: {rats_griefing_warning: true}}})
    server.runCommandSilent("gamerule mobGriefing false")
    
    server.runCommandSilent(`execute in ${STARTING_WORLD} run spawnpoint ${player.name.string} ${SPAWN_COORDS.x} ${SPAWN_COORDS.y} ${SPAWN_COORDS.z} 180`)

    if (pData.contains("currentRunID") && !server.singleplayer) {
        let survivors = global.getSurvivorsOtherThanPlayer(server, player)
        if (!survivors.length) {
            global.killEVERYONE(server)
            return
        }

        let anchor = global.randomPick(survivors)
        player.setGameMode("spectator")
        player.teleportTo(anchor.level.dimension, anchor.x, anchor.y, anchor.z, anchor.yaw, anchor.pitch)
        global.startBackgroundMusic(player, "run")
    } else if (!pData.contains("currentRunID")) {
        if (!player.tags.contains("spawned")) player.paint({close_eyes: {type: "rectangle", draw: "always", x: 0, y: 0, w: "$screenW", h: "$screenH", color: "#010101"}})
        
        if (player.level.dimension.toString() != STARTING_WORLD && player.level.dimension.toString() != "minecraft:overworld") player.kill()
        if (!player.creative) player.setGameMode("adventure")
        if (pData.contains("firstStructureSpawned") && pData.getBoolean("firstStructureSpawned")) tpPlayerToSpawn(player, server)

        if (player.tags.contains("spawned")) global.startBackgroundMusic(player, "hub")
        else {
            server.scheduleInTicks(20, () => {
                server.runCommand(`execute in ${STARTING_WORLD} run dialog @e[type=easy_npc:humanoid,nbt={SkinData:{Name:"G_cat101"}},limit=1] show ${player.name.string} gcat_welcome`)
                global.startBackgroundMusic(player, "hub")
            })
            player.tags.add("spawned")
        }
    }

    if (!pData.contains("firstStructureSpawned") || !pData.getBoolean("firstStructureSpawned")) {
        server.runCommandSilent(`execute in ${STARTING_WORLD} run forceload add -16 -16 16 16`)
        server.runCommandSilent(`execute in ${STARTING_WORLD} run place template ${STARTING_STRUCTURE} 0 0 0`)

        pData.putBoolean("firstStructureSpawned", true)
        server.scheduleInTicks(10, () => tpPlayerToSpawn(player, server))
    }
})
PlayerEvents.respawned(event => {
    global.startBackgroundMusic(event.player, "hub")
})