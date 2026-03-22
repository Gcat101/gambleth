// priority: 0

const $BooleanProperty = Java.loadClass("net.minecraft.world.level.block.state.properties.BooleanProperty")
const $ForgeRegistries = Java.loadClass("net.minecraftforge.registries.ForgeRegistries")

const SLOT_MACHINE_TIME = 60
const CHIPS_TO_PLAY = {
    "inventory": 500,
    "weapons": 250,
    "armor": 300,
    "potions": 150,
    "loot": 250,
    "win": 250000
}
const OUTCOMES = {
    "weapons": {
        // Stone and wooden weapons available by default
        "minecraft:golden": 80,
        "minecraft:iron": 50,
        "minecraft:diamond": 30,
        "minecraft:netherite": 20,

        "armorplus:coal": 80,
        "armorplus:redstone": 70,
        "armorplus:emerald": 30,
        "armorplus:obsidian": 25,
        "armorplus:infused_lava": 20,
        "armorplus:guardian": 15,
        "armorplus:super_star": 10,
        "armorplus:ender_dragon": 5,
        "armorplus:slayer": 1
    },
    "armor": {
        // Leather armor available by default
        "minecraft:golden": 80,
        "minecraft:iron": 50,
        "minecraft:diamond": 30,
        "minecraft:netherite": 10,

        "armorplus:coal": 80,
        "armorplus:redstone": 70,
        "armorplus:emerald": 30,
        "armorplus:obsidian": 25,
        "armorplus:infused_lava": 20,
        "armorplus:guardian": 15,
        "armorplus:super_star": 10,
        "armorplus:ender_dragon": 5,
        "armorplus:slayer": 1,

        "armorplus:chicken": 90,
        "armorplus:slime": 60,
        "armorplus:ardite": 70,
        "armorplus:cobalt": 70,
        "armorplus:knight_slime": 50,
        "armorplus:pig_iron": 50,
        "armorplus:manyullyn": 25,
        "armorplus:frost": 50,
        "armorplus:frost_lava": 30
    },
    "potions": {
        "minecraft:healing": 100,
        "minecraft:strong_healing": 80,

        "minecraft:harming": 100,
        "minecraft:strong_harming": 80,

        "minecraft:poison": 70,
        "minecraft:strong_poison": 60,

        "minecraft:regeneration": 70,
        "minecraft:strong_regeneration": 60,

        "minecraft:strength": 70,
        "minecraft:strong_strength": 60,

        "minecraft:swiftness": 70,
        "minecraft:strong_swiftness": 60,
        "alexsmobs:speed_iii": 40,

        "minecraft:leaping": 50,
        "minecraft:strong_leaping": 40,

        "apotheosis:resistance": 50,
        "apotheosis:strong_resistance": 40,

        "alexsmobs:knockback_resistance": 50,
        "alexsmobs:strong_knockback_resistance": 40,

        "alexsmobs:sundering": 50,
        "alexsmobs:strong_sundering": 40,
        
        "minecraft:slow_falling": 50,
        "minecraft:strong_slow_falling": 40,

        "apotheosis:flying": 1
    },
    "loot": {
        "minecraft:bow": 100,
        "minecraft:crossbow": 80,
        "minecraft:trident": 50,

        "minecraft:golden_apple": 50,
        "minecraft:enchanted_golden_apple": 1,

        "gunswithoutroses:gold_gun": 70,
        "gunswithoutroses:iron_gun": 50,
        "gunswithoutroses:blaze_gun": 30,
        "gunswithoutroses:diamond_shotgun": 15,
        "gunswithoutroses:diamond_sniper": 15,
        "gunswithoutroses:diamond_gatling": 15,

        "supplementaries:bomb": 90,
        "supplementaries:bomb_blue": 50
    }
}

const MAX_SLOT_COUNT = 36
const MIN_SLOT_COUNT = 2

BlockEvents.rightClicked(event => {
    let { block, level, player, server } = event
    let dim = level.dimension.toString()
    if (player.shiftKeyDown || block.properties.lit == "true" || !block.hasTag("gambleth:slot_machine")) return

    let type = new ResourceLocation(block.id).path.split("_")[0]
    let chipCount = server.persistentData.contains("chipCount") ? server.persistentData.getInt("chipCount") : 0
    if (!player.creative && chipCount < CHIPS_TO_PLAY[type]) return

    player.swing()
    server.persistentData.putInt("chipCount", chipCount - (CHIPS_TO_PLAY[type] * +(!player.creative)))
    global.showChipCountToast(server)

    let isBottomBlock = block.id.endsWith("_bottom")
    let blockToLightPos = isBottomBlock ? block.pos.offset(0, 1, 0) : block.pos

    let blockToLight = level.getBlock(blockToLightPos)
    let lampBlock = blockToLight.offset(0, 1, 0)
    level.setBlock(blockToLight, blockToLight.blockState.cycle(BlockProperties.LIT), 3)
    level.setBlock(lampBlock, lampBlock.blockState.cycle(BlockProperties.LIT), 3)

    server.runCommandSilent(`execute in ${dim} run playsound gambleth:block.slot_machine_process block @a ${blockToLightPos.x} ${blockToLightPos.y} ${blockToLightPos.z}`)
    server.scheduleInTicks(SLOT_MACHINE_TIME, () => {
        let rand = Math.random()
        let successfullAttempt = false

        switch (type) {
            case "inventory":
                let currSlotCount = (MIN_SLOT_COUNT + player.getAttribute("tinyinv:slots").baseValue)

                let increaseSlotCount = rand < (-(1/(MAX_SLOT_COUNT - MIN_SLOT_COUNT)) * currSlotCount + (MAX_SLOT_COUNT/(MAX_SLOT_COUNT - MIN_SLOT_COUNT))) // 1 at 2, 0 at 36, linear
                let decreaseSlotCount = (!increaseSlotCount) && (rand < ((1/(2*(MAX_SLOT_COUNT - MIN_SLOT_COUNT))) * currSlotCount - (1/(MAX_SLOT_COUNT - MIN_SLOT_COUNT)))) // 0 at 2, 0.5 at 36, linear

                let newSlotCount = currSlotCount
                if (increaseSlotCount) newSlotCount += 1
                else if (decreaseSlotCount) newSlotCount -= 1
                else break

                successfullAttempt = true
                player.getAttribute("tinyinv:slots").setBaseValue(newSlotCount - MIN_SLOT_COUNT)

                let invToast = new Notification()
                invToast.itemIcon = Item.of("diamond_pickaxe")
                invToast.text = Text.white("New Slot Count:\n").bold().append(Text.yellow(`${newSlotCount}`).bold(false))
                invToast.backgroundColor = Color.BLACK
                invToast.borderColor = Color.GRAY

                player.notify(invToast)
                break
            case "win":
                if (rand < .5) break
                successfullAttempt = true

                server.scheduleInTicks(20, () => {
                    let npc = level.getEntities().filter(e => e.type == "easy_npc:humanoid" && e.nbt.getCompound("SkinData").getString("Name") == "G_cat101").get(0)
                    server.playerList.players.forEach(p => {
                        server.runCommandSilent(`execute in ${dim} run dialog ${npc.stringUuid} show ${p.name.string} gcat_goodbye`) // TODO: show credits screen
                    })
                })
                
                break
        
            default:
                let pData = server.persistentData
                if (!pData.contains("unlocks")) pData.put("unlocks", [])
                let unlocks = global.tagToStringList(pData.getList("unlocks", 8))

                let typeOutcomes = OUTCOMES[type]
                let choices = []

                let fullW = 0
                Object.keys(typeOutcomes).forEach(o => {
                    fullW += typeOutcomes[o]
                    for (let i = 0; i < typeOutcomes[o]; i++) choices.push(o)
                })
                for (let j = 0; j < Math.floor(fullW/4); j++) choices.push("")

                choices = choices.filter(c => !c || unlocks.indexOf(`${c}_${type}`) < 0)

                let choice = global.randomPick(choices)
                if (!choice) break

                successfullAttempt = true
                unlocks.push(`${choice}_${type}`)
                pData.put("unlocks", unlocks)

                let typeName = type
                let name = choice.split(":")[1]
                name = name.charAt(0).toUpperCase() + name.slice(1)
                name = name.replace(/_/g, " ")

                let icon = Item.of("air")
                switch (type) {
                    case "weapons":
                        icon = Item.of(`${choice}_sword`)
                        break
                    case "armor":
                        icon = Item.of(`${choice}_chestplate`)
                        break
                    case "loot":
                        icon = Item.of(choice)
                        name = Item.of(choice).hoverName.string
                        typeName = ""
                        break
                    case "potions":
                        icon = Item.of(`potion`, `{Potion:"${choice}"}`)

                        let effect = $ForgeRegistries.POTIONS.getValue(choice).effects[0]
                        name = Text.translate(effect.descriptionId).string
                        if (effect.amplifier > 0) {
                            name += " "
                            for (let k = 0; k <= effect.amplifier; k++) name += "I"
                        }

                        break
                }

                let unlockToast = new Notification()
                unlockToast.itemIcon = icon
                unlockToast.text = Text.yellow(`${name}${typeName ? " " + typeName : ""}`).bold().append(Text.white(` will now\nappear in the basement!`).bold(false))
                unlockToast.backgroundColor = Color.BLACK
                unlockToast.borderColor = Color.GRAY

                global.showToastToAll(server, unlockToast)
                break
        }

        server.runCommandSilent(`execute in ${dim} run playsound gambleth:block.slot_machine_${successfullAttempt ? "success" : "fail"} block @a ${blockToLightPos.x} ${blockToLightPos.y} ${blockToLightPos.z}`)

        blockToLight = level.getBlock(blockToLightPos)
        lampBlock = blockToLight.offset(0, 1, 0)
        level.setBlock(blockToLight, blockToLight.blockState.cycle(BlockProperties.LIT), 3)
        level.setBlock(lampBlock, lampBlock.blockState.cycle(BlockProperties.LIT), 3)
    })
})