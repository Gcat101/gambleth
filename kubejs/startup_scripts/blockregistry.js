// priority: 0

const $BooleanProperty = Java.loadClass('net.minecraft.world.level.block.state.properties.BooleanProperty')
const $Direction = Java.loadClass("net.minecraft.core.Direction")
const $FrontAndTop = Java.loadClass("net.minecraft.core.FrontAndTop")

const ROOM_SIGNIFIER_DATA_KEY = "roomSignifiers"
const SIGNIFIER_FAIL_STRUCTURE = "gambleth:wall_room"

let registerSlotMachine = (event, id) => {
    event.create(`gambleth:${id}_slot_machine_bottom`)
        .tag("gambleth:slot_machine")
        .textureAll(`gambleth:block/${id}_slot_machine`)
    event.create(`gambleth:${id}_slot_machine_top`, "cardinal")
        .tag("gambleth:slot_machine")
        .property(BlockProperties.LIT)
        .defaultState(c => c.set(BlockProperties.LIT, false))
        .texture("front", "gambleth:block/slot_machine_front_on")
        .texture("side", `gambleth:block/${id}_slot_machine`)
}

let replaceSignifierWithJigsaw = (entity, pool, targetName, turnsInto) => {
    let { level, block, blockPos } = entity
    let facing = $Direction.byName(block.properties.facing)
    let jigPos = blockPos.relative(facing.opposite).offset(0, -1, 0)

    block.set("air")

    let jigState = Blocks.JIGSAW.defaultBlockState()
    jigState = jigState.setValue(BlockProperties.ORIENTATION, $FrontAndTop.fromFrontAndTop(facing, $Direction.UP))

    level.setBlock(jigPos, jigState, 3)
    let jigsaw = level.getBlock(jigPos).entity

    jigsaw.deserializeNBT({name: "minecraft:empty", pool: pool, final_state: turnsInto, target: targetName})
    jigsaw.generate(level, 1, false)
}
global._signifierPlaceFail = entity => replaceSignifierWithJigsaw(entity, "gambleth:walls", "gambleth:room_connector", "minecraft:cobblestone")

StartupEvents.registry("block", event => {
    event.create("gambleth:room_trigger")
        .noCollision()
        .property($BooleanProperty.create("endroom"))
        .model("minecraft:block/air")
    event.create("gambleth:next_floor_trigger")
        .model("minecraft:block/black_concrete")

    registerSlotMachine(event, "inventory")
    registerSlotMachine(event, "weapons")
    registerSlotMachine(event, "armor")
    registerSlotMachine(event, "potions")
    registerSlotMachine(event, "loot")
    registerSlotMachine(event, "win")

    // ! UNUSED
    event.create("gambleth:unique_room_signifier", "cardinal")
        .texture("front", "minecraft:block/red_concrete")
        .blockEntity(e => e.serverTick(entity => {
            let pData = entity.level.server.persistentData
            if (!pData.contains(ROOM_SIGNIFIER_DATA_KEY)) pData.put(ROOM_SIGNIFIER_DATA_KEY, {})

            let signifierId = entity.serializeNBT().getCompound("data").getString("signifierId")
            let { blockPos } = entity
            let roomSignifiers = pData.getCompound(ROOM_SIGNIFIER_DATA_KEY)

            if (!roomSignifiers.contains(signifierId)) {
                roomSignifiers.put(signifierId, {x: blockPos.x, y: blockPos.y, z: blockPos.z})
                return
            }

            let checkPos = roomSignifiers.getCompound(signifierId)
            if (
                checkPos.getInt("x") == blockPos.x &&
                checkPos.getInt("y") == blockPos.y &&
                checkPos.getInt("z") == blockPos.z
            ) return

            global._signifierPlaceFail(entity)
        }))
})

StartupEvents.registry("painting_variant", event => {
    event.create("gambleth:white_pharaoh").height(32).width(32).tag("minecraft:placeable")
    event.create("gambleth:findme").height(16).width(16).tag("minecraft:placeable")
})