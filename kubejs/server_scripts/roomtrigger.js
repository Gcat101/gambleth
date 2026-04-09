// priority: 0

const ROOM_ENTITY_TAG = "roomEntity"
const SPAWNABLE_ENTITIES = {
    "1": [
        "minecraft:slime",
        "rats:rat",
        "alexsmobs:leafcutter_ant",
        "mowziesmobs:lantern"
    ],
    "5": [
        "minecraft:zombie",
        "minecraft:skeleton",
        "minecraft:magma_cube",
        "alexsmobs:guster",
        "mowziesmobs:foliaath"
    ],
    "15": [
        "minecraft:wither_skeleton",
        "minecraft:blaze",
        "alexsmobs:bluff",
        "mowziesmobs:umvuthana"
    ],
    "45": [
        "alexsmobs:centipede_head",
        "alexsmobs:warped_mosco",
        "alexsmobs:farseer"
    ]
}
const SPAWNABLE_BOSSES = {
    "1": [
        "slime",
        "rat",
        // "ant" // ! UNUSED
    ],
    "5": [
        "zombie",
        "skeleton",
        "magma_cube",
        "foliaath"
    ],
    "15": [
        "wither_skeleton",
        "blaze",
        "bluff",
        "umvuthana"
    ],
    "45": [
        "umvuthi",
        "ferrous_wroughtnaut",
        "frostmaw"
    ]
}


const TRIGGER_BLOCK_ID = "gambleth:room_trigger"
const NEXT_FLOOR_BLOCK_ID = "gambleth:next_floor_trigger"
const CLOSE_ROOM_BLOCK_ID = "minecraft:iron_bars"

const PARTICLE_BLOCK_ID = "minecraft:cobblestone"
const PARTICLE_COUNT = 100

const ROOM_SIZE = 16
const ROOM_HEIGHT = 8
const REWARD_ITEM_MAX_COUNT = 16
const LAST_FLOOR_WITH_EMPTY_ROOMS = 10

global.closeDoorsInRoom = (level, maxPos, minPos) => {
    let { server } = level
    let dim = level.dimension.toString()

    server.runCommandSilent(`execute in ${dim} run fill ${maxPos.x + 1} ${maxPos.y} ${maxPos.z} ${maxPos.x + 1} ${maxPos.y + (ROOM_HEIGHT - 1)} ${minPos.z} ${CLOSE_ROOM_BLOCK_ID} replace minecraft:air`)
    server.runCommandSilent(`execute in ${dim} run fill ${maxPos.x} ${maxPos.y} ${maxPos.z + 1} ${minPos.x} ${maxPos.y + (ROOM_HEIGHT - 1)} ${maxPos.z + 1} ${CLOSE_ROOM_BLOCK_ID} replace minecraft:air`)
    server.runCommandSilent(`execute in ${dim} run fill ${minPos.x - 1} ${minPos.y} ${minPos.z} ${minPos.x - 1} ${minPos.y + (ROOM_HEIGHT - 1)} ${maxPos.z} ${CLOSE_ROOM_BLOCK_ID} replace minecraft:air`)
    server.runCommandSilent(`execute in ${dim} run fill ${minPos.x} ${minPos.y} ${minPos.z - 1} ${maxPos.x} ${minPos.y + (ROOM_HEIGHT - 1)} ${minPos.z - 1} ${CLOSE_ROOM_BLOCK_ID} replace minecraft:air`)

    spawnDoorParticles(level, maxPos, minPos)
}
global.openDoorsInRoom = (level, maxPos, minPos) => {
    level.server.runCommandSilent(`execute in ${level.dimension.toString()} run fill ${maxPos.x + 1} ${maxPos.y} ${maxPos.z + 1} ${minPos.x - 1} ${minPos.y + (ROOM_HEIGHT - 1)} ${minPos.z - 1} minecraft:air replace ${CLOSE_ROOM_BLOCK_ID}`)
    spawnDoorParticles(level, maxPos, minPos)
}

let spawnDoorParticles = (level, maxPos, minPos) => {
    let { server } = level
    let dim = level.dimension.toString()

    server.runCommandSilent(`execute in ${dim} run particle minecraft:block ${PARTICLE_BLOCK_ID} ${minPos.x + Math.round((maxPos.x - minPos.x) / 2)}.0 ${maxPos.y} ${maxPos.z + 1} 1 0 0 1 ${PARTICLE_COUNT}`)
    server.runCommandSilent(`execute in ${dim} run particle minecraft:block ${PARTICLE_BLOCK_ID} ${minPos.x + Math.round((maxPos.x - minPos.x) / 2)}.0 ${minPos.y} ${minPos.z - 1} 1 0 0 1 ${PARTICLE_COUNT}`)
    server.runCommandSilent(`execute in ${dim} run particle minecraft:block ${PARTICLE_BLOCK_ID} ${maxPos.x + 1} ${maxPos.y} ${minPos.z + Math.round((maxPos.z - minPos.z) / 2)}.0 0 0 1 1 ${PARTICLE_COUNT}`)
    server.runCommandSilent(`execute in ${dim} run particle minecraft:block ${PARTICLE_BLOCK_ID} ${minPos.x - 1} ${minPos.y} ${minPos.z + Math.round((maxPos.z - minPos.z) / 2)}.0 0 0 1 1 ${PARTICLE_COUNT}`)
}
let spawnReward = (level, pos) => {
    let items = level.createEntity("minecraft:item")

    let floor = level.server.persistentData.getInt("currentFloor")
    let avgChipCount = Math.round(Math.sqrt(6 * floor))
    let chipCount = global.randomInt(
        Math.round(avgChipCount * 1/1.5),
        Math.round(avgChipCount * 1.5)
    )

    items.item = Item.of("gambleth:poker_chip_" + global.randomPick(global.chipColors)).withCount(chipCount)
    items.teleportTo(
        pos.x,
        pos.y - 1,
        pos.z
    )

    items.spawn()
    items.addMotion(0, 1, 0)
}

let completeRoom = (level, maxPos, minPos) => {
    let { server } = level

    let center = new BlockPos(
        minPos.x + Math.round((maxPos.x - minPos.x) / 2),
        maxPos.y,
        minPos.z + Math.round((maxPos.z - minPos.z) / 2)
    )
    let pData = level.server.persistentData
    let dim = level.dimension.toString()

    global.openDoorsInRoom(level, maxPos, minPos)
    if (pData.contains("defeatingBoss") && pData.getBoolean("defeatingBoss")) {
        let anchor = global.randomPick(global.getSurvivorsOtherThanPlayer(server, p))
        server.playerList.players.filter(p => p.isSpectator()).forEach(p => p.teleportTo(anchor.x, anchor.y, anchor.z))

        server.runCommandSilent(`execute in ${dim} run fill ${center.x - 1} ${center.y - 1} ${center.z - 1} ${center.x} ${center.y - 1} ${center.z - 1} minecraft:iron_trapdoor[half=top,open=true,facing=south]`)
        server.runCommandSilent(`execute in ${dim} run fill ${center.x - 1} ${center.y - 1} ${center.z} ${center.x} ${center.y - 1} ${center.z} minecraft:iron_trapdoor[half=top,open=true,facing=north]`)
        server.runCommandSilent(`execute in ${dim} run fill ${center.x - 1} ${center.y - 2} ${center.z - 1} ${center.x} ${center.y - 2} ${center.z} gambleth:next_floor_trigger`)

        server.runCommandSilent(`execute in ${dim} run particle minecraft:block ${PARTICLE_BLOCK_ID} ${center.x}.0 ${minPos.y} ${center.z}.0 0.5 0 0.5 1 ${PARTICLE_COUNT}`)

        pData.putBoolean("defeatingBoss", false)
        pData.putBoolean("bossDefeated", true)
    } else {
        server.runCommandSilent(`execute in ${dim} run fill ${center.x - 1} ${center.y - 1} ${center.z - 1} ${center.x} ${center.y - 1} ${center.z} minecraft:glowstone`)
        spawnReward(level, center)
    }
}

PlayerEvents.tick(event => {
    let { player, level, server } = event
    let { persistentData } = server
    let { block } = player

    if (block.offset(0, -1, 0).id == NEXT_FLOOR_BLOCK_ID) {
        if (persistentData.contains("currentRunID")) global.tpPlayersToNextFloorAndPregen()
        else if (!persistentData.contains("generatingRun") || !persistentData.getBoolean("generatingRun")) {
            persistentData.putBoolean("generatingRun", true)
            player.tell(Text.white("Generating a new run, this might take a bit...").bold())

            if (persistentData.contains("dialogStages") && persistentData.getCompound("dialogStages")) {
                let dialogStages = persistentData.getCompound("dialogStages")
                Object.keys(dialogStages).forEach(npc => {
                    if (dialogStages.getInt(npc) == 0) dialogStages.putInt(npc, 1)
                })
            }

            global.startRun()
        }
    
        return
    }

    if (player.creative || player.spectator || block.id != TRIGGER_BLOCK_ID) return
    let dim = level.dimension.toString()
    let floor = server.persistentData.getInt("currentFloor")
    let skipRoom = false

    let boss = (block.properties.endroom == "true" && (!persistentData.contains("bossDefeated") || !persistentData.getBoolean("bossDefeated")))
    if (boss) persistentData.putBoolean("defeatingBoss", true)
    else {
        let emptyRoomChance = (-floor/((LAST_FLOOR_WITH_EMPTY_ROOMS - 1)*2)) + (0.5 + (1/((LAST_FLOOR_WITH_EMPTY_ROOMS - 1)*2)))
        skipRoom = Math.random() < emptyRoomChance
    }
    
    let posCorner = block
    while(posCorner.offset(1, 0, 0).id == TRIGGER_BLOCK_ID) posCorner = posCorner.offset(1, 0, 0)
    while(posCorner.offset(0, 0, 1).id == TRIGGER_BLOCK_ID) posCorner = posCorner.offset(0, 0, 1)
    let negCorner = posCorner.offset(-(ROOM_SIZE - 1), 0, -(ROOM_SIZE - 1))

    if (!skipRoom) {
        global.closeDoorsInRoom(level, posCorner.pos, negCorner.pos)
        server.playerList.players.filter(p => p.name.string != player.name.string).forEach(p => p.teleportTo(player.x, player.y, player.z))
    }
    server.runCommandSilent(`execute in ${dim} run fill ${posCorner.pos.x} ${posCorner.pos.y} ${posCorner.pos.z} ${negCorner.pos.x} ${negCorner.pos.y} ${negCorner.pos.z} minecraft:air replace ${TRIGGER_BLOCK_ID}`)
    if (skipRoom) return

    let minEnemyCount = 1 + Math.floor(floor / 5)
    let maxEnemyCount = 3 + Math.floor(floor / 2)

    // TESTING
    // minEnemyCount = 20
    // maxEnemyCount = 20

    let enemyCount = boss ? 1 : (floor < 250 ? global.randomInt(Math.min(minEnemyCount, 10), Math.min(maxEnemyCount, 25)) : global.randomInt(minEnemyCount, maxEnemyCount))
    if (!boss) {
        let possibleEntities = []
        Object.keys(SPAWNABLE_ENTITIES).forEach(minf => {
            if (+(minf) > floor) return
            SPAWNABLE_ENTITIES[minf].forEach(e => possibleEntities.push(e))
        })

        for (let i = 0; i < enemyCount; i++) {
            let e = level.createEntity(global.randomPick(possibleEntities))
            let ePos = new Vec3i(
                global.randomFloat(negCorner.x + 1, posCorner.x - 1),
                posCorner.y,
                global.randomFloat(negCorner.z + 1, posCorner.z - 1),
            )

            e.teleportTo(
                ePos.x,
                ePos.y,
                ePos.z
            )
            e.tags.push(ROOM_ENTITY_TAG)
            e.spawn()

            server.runCommandSilent(`execute in ${dim} run particle minecraft:block ${PARTICLE_BLOCK_ID} ${ePos.x} ${ePos.y} ${ePos.z} 0.5 0 0.5 1 ${PARTICLE_COUNT}`)
        }
    }
    else {
        let bossPool = []
        for (let bossTier = 0; bossTier < Object.keys(SPAWNABLE_BOSSES).length; bossTier++) {
            let bossminf = Object.keys(SPAWNABLE_BOSSES)[bossTier]
            if (+(bossminf) > floor) break
            for (let i = 0; i < Math.pow(2, bossTier + 1); i++) SPAWNABLE_BOSSES[bossminf].forEach(b => bossPool.push(`gambleth:${b}`)) 
        }
        
        server.runCommandSilent(`execute in ${dim} run apoth spawn_boss ${negCorner.x + Math.round((posCorner.x - negCorner.x) / 2)}.0 ${posCorner.y} ${negCorner.z + Math.round((posCorner.z - negCorner.z) / 2)}.0 ${global.randomPick(bossPool)}`)
    }

    persistentData.put("roomCorners", {
        "max": {
            "x": posCorner.pos.x,
            "y": posCorner.pos.y,
            "z": posCorner.pos.z
        },
        "min": {
            "x": negCorner.pos.x,
            "y": negCorner.pos.y,
            "z": negCorner.pos.z
        }
    })
    persistentData.putInt("enemiesLeftInRoom", enemyCount)
})
EntityEvents.death(event => {
    let { entity, server, level } = event
    if (!entity.tags.contains(ROOM_ENTITY_TAG) && (
        !entity.nbt.getCompound("ForgeData").contains("apoth.rarity") ||
        !entity.nbt.getCompound("ForgeData").getInt("apoth.boss")
    )) return

    let entitiesLeft = server.persistentData.getInt("enemiesLeftInRoom") - 1
    server.persistentData.putInt("enemiesLeftInRoom", entitiesLeft)

    let corners = server.persistentData.getCompound("roomCorners")
    let maxPos = corners.getCompound("max")
    let minPos = corners.getCompound("min")

    if (entitiesLeft <= 0) completeRoom(level, new BlockPos(maxPos.getInt("x"), maxPos.getInt("y"), maxPos.getInt("z")), new BlockPos(minPos.getInt("x"), minPos.getInt("y"), minPos.getInt("z")))
})