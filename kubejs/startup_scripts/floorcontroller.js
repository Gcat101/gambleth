// priority: 0

const $UUID = Java.loadClass("java.util.UUID")
const $Random = Java.loadClass("java.util.Random")
const $Set = Java.loadClass("java.util.Set")
const $Registries = Java.loadClass("net.minecraft.core.registries.Registries")
const $ResourceKey = Java.loadClass("net.minecraft.resources.ResourceKey")
const $MinecraftForge = Java.loadClass("net.minecraftforge.common.MinecraftForge")
const $LevelEvent$Load = Java.loadClass("net.minecraftforge.event.level.LevelEvent$Load")
const $MultiworldMod = Java.loadClass("me.isaiah.multiworld.MultiworldMod")
const $InfiniverseAPI = Java.loadClass("commoble.infiniverse.api.InfiniverseAPI")
const $InfiniverseMod = Java.loadClass("commoble.infiniverse.internal.InfiniverseMod")
const $QuietPacketDistributors = Java.loadClass("commoble.infiniverse.internal.QuietPacketDistributors")
const $UpdateDimensionsPacket = Java.loadClass("commoble.infiniverse.internal.UpdateDimensionsPacket")

const FLOOR_DIM_PREFIX = "floor"
const PROTO_DIM_ID = "gambleth:cobblewall"
const DUNGEON_STRUCTURE_ID = "gambleth:dungeon"

const POSSIBLE_TP_COORDS = [
    new Vec3i(-7, 14, -7),
    new Vec3i(8, 14, -7),
    new Vec3i(-7, 14, 8),
    new Vec3i(8, 14, 8)
]
const MAX_FORCELOAD_POS = 64
const TICKS_BEFORE_TITLE = 30
const FIRST_FLOOR = 1

let findSuitableSpawnPos = dim => {
    let tpCoords = new Vec3i(0, 2, 0)
    for (const c of POSSIBLE_TP_COORDS) {
        if (Utils.server.getLevel(dim).getBlock(Math.floor(c.x), Math.floor(c.y), Math.floor(c.z)).id == "minecraft:air") {
            tpCoords = c
            break
        }
    }
    return tpCoords
}

global.copyDim = (protoDimId, dimId) => {
    let protoDim = Utils.server.getLevel(protoDimId)
    let newDim = $MultiworldMod.create_world(
        dimId,
        Utils.server.registryAccess().registryOrThrow($Registries.DIMENSION_TYPE).getKey(protoDim.dimensionType()),
        protoDim.chunkSource.generator,
        protoDim.difficulty,
        new $Random().nextLong()
    )

    Utils.server.markWorldsDirty()
    $MinecraftForge.EVENT_BUS.post(new $LevelEvent$Load(newDim))
    $QuietPacketDistributors.sendToAll($InfiniverseMod.CHANNEL, new $UpdateDimensionsPacket($Set.of($ResourceKey.create($Registries.DIMENSION, dimId)), true))

    return newDim
}
global.tpPlayersToDim = dim => {
    let tpCoords = findSuitableSpawnPos(dim)
    Utils.server.playerList.players.forEach(p => {
        p.teleportTo(dim, tpCoords.x, tpCoords.y, tpCoords.z, p.yaw, p.pitch)
    })

    return tpCoords
}
global.tpPlayersToFloor = i => {
    let pData = Utils.server.persistentData
    let dimId = `gambleth:${FLOOR_DIM_PREFIX}_${i}_${Utils.server.persistentData.getUUID("currentRunID").toString()}`

    pData.putInt("currentFloor", i)
    let spawnCoords = global.tpPlayersToDim(dimId)
    pData.putBoolean("defeatingBoss", false)
    pData.putBoolean("bossDefeated", false)

    let maxRoomPos = new BlockPos(Math.floor(spawnCoords.x) + 7, 0, Math.floor(spawnCoords.z) + 7)
    let minRoomPos = maxRoomPos.offset(-15, 0, -15)

    Utils.server.scheduleInTicks(TICKS_BEFORE_TITLE, () => {
        Utils.server.runCommandSilent("title @a times 0s 1.5s 0.5s")
        Utils.server.runCommandSilent("title @a title " + Text.white("Floor ").append(Text.yellow(i.toString())).toJson())
        Utils.server.playerList.players.forEach(p => Utils.server.runCommandSilent(`execute at ${p.name.string} in ${dimId} run playsound minecraft:entity.experience_orb.pickup neutral ${p.name.string}`))

        global.openDoorsInRoom(Utils.server.getLevel(dimId), maxRoomPos, minRoomPos)
    })
}
global.tpPlayersToNextFloorAndPregen = () => {
    let floor = Utils.server.persistentData.getInt("currentFloor") + 1

    global.tpPlayersToFloor(floor)
    global.createFloor(floor + 1)

    global.startBackgroundMusicForAllPlayers("run")
}

global.createFloor = i => {
    let currentRunUUID = Utils.server.persistentData.contains("currentRunID") ? Utils.server.persistentData.getUUID("currentRunID").toString() : $UUID.randomUUID().toString()
    Utils.server.persistentData.putUUID("currentRunID", currentRunUUID)

    global.clearPreviousFloors(i)

    let dimId = `gambleth:${FLOOR_DIM_PREFIX}_${i}_${currentRunUUID}`
    global.copyDim(PROTO_DIM_ID, dimId)

    Utils.server.runCommandSilent(`execute in ${dimId} run forceload add -${MAX_FORCELOAD_POS} -${MAX_FORCELOAD_POS} ${MAX_FORCELOAD_POS} ${MAX_FORCELOAD_POS}`)
    Utils.server.runCommandSilent(`execute in ${dimId} run place structure ${DUNGEON_STRUCTURE_ID} 0 0 0`)

    let spawnCoords = findSuitableSpawnPos(dimId)
    let maxRoomPos = new BlockPos(Math.floor(spawnCoords.x) + 7, 0, Math.floor(spawnCoords.z) + 7)
    let minRoomPos = maxRoomPos.offset(-15, 0, -15)
    global.closeDoorsInRoom(Utils.server.getLevel(dimId), maxRoomPos, minRoomPos)
}
global.startRun = () => {
    let pData = Utils.server.persistentData
    pData.putUUID("currentRunID", $UUID.randomUUID().toString())

    global.createFloor(FIRST_FLOOR)
    global.tpPlayersToFloor(FIRST_FLOOR)

    global.createFloor(FIRST_FLOOR + 1)
    global.startBackgroundMusicForAllPlayers("run")

    Utils.server.playerList.players.forEach(p => p.sendData("set_fm_variable", {key: "inRun", value: "true"}))
    pData.putBoolean("generatingRun", false)
}
global.clearPreviousFloors = i => {
    Utils.server.registryAccess().registryOrThrow($Registries.DIMENSION).keySet()
        .filter(k => 
            k.namespace == "gambleth" &&
            k.path.startsWith(FLOOR_DIM_PREFIX + "_") &&
            (i < 2 || +k.path.replace(FLOOR_DIM_PREFIX + "_", "").split("_")[0] < i - 1)
        )
        .forEach(k => {
            Utils.server.runCommandSilent(`execute in ${k} run forceload remove all`)
            $InfiniverseAPI.get().markDimensionForUnregistration(Utils.server, $ResourceKey.create($Registries.DIMENSION, k))
        })
}