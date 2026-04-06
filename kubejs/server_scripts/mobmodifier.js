// priority: 0

const $Player = Java.loadClass("net.minecraft.world.entity.player.Player")
const $Attributes = Java.loadClass("net.minecraft.world.entity.ai.attributes.Attributes")
const $InteractionHand = Java.loadClass("net.minecraft.world.InteractionHand")

const AUTO_AGGRO_ON_PLAYER = [
    "rats:rat",
    "alexsmobs:leafcutter_ant"
]

const DEFAULT_MIN_SCALE = 0.75
const DEFAULT_MAX_SCALE = 1.25
const CUSTOM_SCALES = {
    "rats:rat": [1.5, 2],
    "alexsmobs:leafcutter_ant": [0.75, 1],

    "minecraft:blaze": [1.75, 2.5],
    "alexsmobs:bluff": [1.75, 2.5],
    "alexsmobs:warped_mosco": [0.25, 0.5]
}

const CUSTOM_HEALTH = {
    "rats:rat": 2,
    "mowziesmobs:lantern": 6,

    "minecraft:magma_cube": 25,
    "mowziesmobs:umvuthana": 35,

    "alexsmobs:farseer": 50,
    "alexsmobs:warped_mosco": 50,
}
const CUSTOM_ATTRIBUTES = {
    "rats:rat": {
        "minecraft:generic.movement_speed": .2
    }
}

EntityEvents.spawned(event => {
    let { entity, server } = event
    let { type } = entity

    let boss = entity.nbt.getCompound("ForgeData").contains("apoth.rarity") && entity.nbt.getCompound("ForgeData").getInt("apoth.boss")
    if (!entity.tags.contains("roomEntity") && !boss) {
        if (type == "minecraft:slime" || type == "minecraft:magma_cube") event.cancel()
        return
    }

    let customScale = Object.keys(CUSTOM_SCALES).indexOf(type) >= 0
    let minScale = customScale ? CUSTOM_SCALES[type][0] : DEFAULT_MIN_SCALE
    let maxScale = customScale ? CUSTOM_SCALES[type][1] : DEFAULT_MAX_SCALE
    server.schedule(10, () => server.runCommandSilent(`scale set pehkui:base ${global.randomFloat(minScale, maxScale) * (boss ? 1.5 : 1)} ${entity.stringUuid}`))

    if (Object.keys(CUSTOM_HEALTH).indexOf(type) >= 0) {
        let health = CUSTOM_HEALTH[type]
        entity.getAttribute($Attributes.MAX_HEALTH).setBaseValue(health)
        if (!boss) entity.health = health
    }
    if (Object.keys(CUSTOM_ATTRIBUTES).indexOf(type) >= 0) {
        let attrs = CUSTOM_ATTRIBUTES[type]
        Object.keys(attrs).forEach(a => entity.getAttribute($ForgeRegistries.ATTRIBUTES.getValue(a)).setBaseValue(attrs[a]))
    }

    switch (type) {
        case "rats:rat":
            entity.mergeNbt({ColorVariant: "rats:" + global.randomPick(["brown", "green", "blue", "black"])})
            break
        case "mowziesmobs:lantern":
            server.schedule(10, () => server.runCommandSilent(`scale set pehkui:hitbox_height 2 ${entity.stringUuid}`))
            break
        case "alexsmobs:leafcutter_ant":
            server.schedule(10, () => server.runCommandSilent(`scale set pehkui:hitbox_height 16 ${entity.stringUuid}`))
            break
        case "minecraft:slime":
            entity.mergeNbt({Size: global.randomInt(0, 3)})
            break
        case "minecraft:magma_cube":
            entity.mergeNbt({Size: global.randomInt(0, 3)})
            break
        case "minecraft:skeleton":
            if (Math.random() < .75) entity.setItemInHand($InteractionHand.MAIN_HAND, Item.of("minecraft:bow"))
            break
        case "mowziesmobs:foliaath":
            server.schedule(10, () => server.runCommandSilent(`scale set pehkui:hitbox_width 5 ${entity.stringUuid}`))
            break
    }
})

AUTO_AGGRO_ON_PLAYER.forEach(e => {
    EntityJSEvents.addGoals(e, event => {
        event.nearestAttackableTarget(1, $Player, 5, false, false, () => true)
    })
})

PlayerEvents.tick(event => {
    if (event.player.isOnFire) event.player.extinguish()
})