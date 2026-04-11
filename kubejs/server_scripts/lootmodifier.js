// priority: 0

const LOOT_CHEST_TABLE_ID = "gambleth:loot_chest"
const MAIN_ITEM_PLACEHOLDER = "minecraft:brick"
const SIDE_ITEM_PLACEHOLDER = "minecraft:nether_brick"

const WEAPON_TYPES = ["sword", "axe", "battle_axe", "mace"]
const ARMOR_TYPES = ["helmet", "chestplate", "leggings", "boots"]
const POTION_FORMS = ["potion", "splash_potion", "lingering_potion", "tipped_arrow"]

let addLootItem = (player, arr, item, predicate) => {
    if (predicate && !predicate(player)) return arr
    arr.push(item)
    return arr
}
let addItemsOfMaterial = (player, types, arr, material, predicate) => {
    if (predicate && !predicate(player)) return arr
    types.forEach(t => {
        if (!$ForgeRegistries.ITEMS.containsKey(`${material}_${t}`)) return

        let entry = Item.of(`${material}_${t}`)
        arr.push(entry)
    })
    return arr
}
let addWeaponsOfMaterial = (player, arr, material, predicate) => addItemsOfMaterial(player, WEAPON_TYPES, arr, material, predicate)
let addArmorOfMaterial = (player, arr, material, predicate) => addItemsOfMaterial(player, ARMOR_TYPES, arr, material, predicate)
let addPotionsOfType = (player, arr, type, predicate) => {
    if (predicate && !predicate(player)) return arr

    POTION_FORMS.forEach(t => {
        if (t == "tipped_arrow" && !bowPredicate(player)) return
        arr.push(Item.of(`minecraft:${t}`, t == "tipped_arrow" ? global.randomInt(1, 5) : 1, `{Potion: "${type}"}`))

        let longId = `${type.split(":")[0]}:long_${type.split(":")[1]}`
        if ($ForgeRegistries.POTIONS.containsKey(longId)) arr.push(Item.of(`minecraft:${t}`, `{Potion: "${longId}"}`))
    })

    return arr
}

let unlockPerdicate = unlockId => player => {
    let pData = player.server.persistentData
    return pData.contains("unlocks") && global.tagToStringList(pData.getList("unlocks", 8)).indexOf(unlockId) > -1
}
let floorPerdicate = floor => player => {
    let pData = player.server.persistentData
    return pData.getInt("currentFloor") >= floor
}
let itemsPredicate = items => player => {
    let result = false
    for (let i = 0; i < items.length; i++) {
        result = player.inventory.countItem(Item.of(items[i]).item) > 0
        if (result) break
    }
    return result
}
let bowPredicate = itemsPredicate(["minecraft:bow", "minecraft:crossbow"])
let gunPredicate = itemsPredicate(Ingredient.of("#gunswithoutroses:gun").itemIds)

let addWeaponsWithUnlock = (player, arr, material, predicate) => addWeaponsOfMaterial(player, arr, material, p => unlockPerdicate(material + "_weapons")(p) && (!predicate || predicate(p)))
let addArmorWithUnlock = (player, arr, material, predicate) => addArmorOfMaterial(player, arr, material, p => unlockPerdicate(material + "_armor")(p) && (!predicate || predicate(p)))
let addPotionsWithUnlock = (player, arr, type, predicate) => addPotionsOfType(player, arr, type, p => unlockPerdicate(type + "_potions")(p) && (!predicate || predicate(p)))
let addLootItemWithUnlock = (player, arr, item, predicate) => addLootItem(player, arr, item, p => unlockPerdicate(item + "_loot")(p) && (!predicate || predicate(p)))

LootJS.modifiers(event => {
    event
        .addLootTableModifier(/^.*:entities\/.*/)
        .removeLoot(/.*/)
    event
        .addLootTableModifier("gambleth:loot_chest")
        .addLoot(MAIN_ITEM_PLACEHOLDER)
        .addLoot(SIDE_ITEM_PLACEHOLDER)
})
EntityEvents.spawned("experience_orb", event => event.cancel())

PlayerEvents.chestOpened(event => {
    let { inventory, level, player } = event
    
    let pos = player.pick(5, 0, false).blockPos
    if (level.getBlock(pos).entity.serializeNBT().getString("LootTable") != LOOT_CHEST_TABLE_ID) return

    let mainItems = []

    mainItems = addWeaponsOfMaterial(player, mainItems, "minecraft:wooden")
    mainItems = addWeaponsOfMaterial(player, mainItems, "minecraft:stone", floorPerdicate(4))
    mainItems = addArmorOfMaterial(player, mainItems, "minecraft:leather")

    mainItems = addWeaponsWithUnlock(player, mainItems, "minecraft:golden")
    mainItems = addWeaponsWithUnlock(player, mainItems, "minecraft:iron", floorPerdicate(7))
    mainItems = addWeaponsWithUnlock(player, mainItems, "minecraft:diamond", floorPerdicate(15))
    mainItems = addWeaponsWithUnlock(player, mainItems, "minecraft:netherite", floorPerdicate(30))

    mainItems = addWeaponsWithUnlock(player, mainItems, "armorplus:coal", floorPerdicate(2))
    mainItems = addWeaponsWithUnlock(player, mainItems, "armorplus:redstone", floorPerdicate(4))
    mainItems = addWeaponsWithUnlock(player, mainItems, "armorplus:emerald", floorPerdicate(10))
    mainItems = addWeaponsWithUnlock(player, mainItems, "armorplus:obsidian", floorPerdicate(10))
    mainItems = addWeaponsWithUnlock(player, mainItems, "armorplus:infused_lava", floorPerdicate(10))
    mainItems = addWeaponsWithUnlock(player, mainItems, "armorplus:guardian", floorPerdicate(20))
    mainItems = addWeaponsWithUnlock(player, mainItems, "armorplus:super_star", floorPerdicate(20))
    mainItems = addWeaponsWithUnlock(player, mainItems, "armorplus:ender_dragon", floorPerdicate(25))
    mainItems = addWeaponsWithUnlock(player, mainItems, "armorplus:slayer", floorPerdicate(35))

    mainItems = addArmorWithUnlock(player, mainItems, "minecraft:golden")
    mainItems = addArmorWithUnlock(player, mainItems, "minecraft:iron", floorPerdicate(7))
    mainItems = addArmorWithUnlock(player, mainItems, "minecraft:diamond", floorPerdicate(15))
    mainItems = addArmorWithUnlock(player, mainItems, "minecraft:netherite", floorPerdicate(30))

    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:coal", floorPerdicate(2))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:redstone", floorPerdicate(4))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:emerald", floorPerdicate(10))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:obsidian", floorPerdicate(10))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:infused_lava", floorPerdicate(10))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:guardian", floorPerdicate(20))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:super_star", floorPerdicate(20))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:ender_dragon", floorPerdicate(25))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:slayer", floorPerdicate(35))

    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:chicken")
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:slime", floorPerdicate(4))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:ardite", floorPerdicate(2))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:cobalt", floorPerdicate(2))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:knight_slime", floorPerdicate(10))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:pig_iron", floorPerdicate(10))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:manyullyn", floorPerdicate(15))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:frost", floorPerdicate(5))
    mainItems = addArmorWithUnlock(player, mainItems, "armorplus:frost_lava", floorPerdicate(10))

    mainItems = addLootItemWithUnlock(player, mainItems, "minecraft:bow")
    mainItems = addLootItemWithUnlock(player, mainItems, "minecraft:crossbow", floorPerdicate(10))
    mainItems = addLootItemWithUnlock(player, mainItems, "minecraft:shield", floorPerdicate(3))
    mainItems = addLootItemWithUnlock(player, mainItems, "minecraft:trident", floorPerdicate(10))

    mainItems = addLootItemWithUnlock(player, mainItems, "gunswithoutroses:gold_gun", floorPerdicate(5))
    mainItems = addLootItemWithUnlock(player, mainItems, "gunswithoutroses:iron_gun", floorPerdicate(5))
    mainItems = addLootItemWithUnlock(player, mainItems, "gunswithoutroses:blaze_gun", floorPerdicate(10))
    mainItems = addLootItemWithUnlock(player, mainItems, "gunswithoutroses:diamond_shotgun", floorPerdicate(20))
    mainItems = addLootItemWithUnlock(player, mainItems, "gunswithoutroses:diamond_sniper", floorPerdicate(20))
    mainItems = addLootItemWithUnlock(player, mainItems, "gunswithoutroses:diamond_gatling", floorPerdicate(20))

    let sideItems = [
        Item.of("minecraft:apple", global.randomInt(1, 9))
    ]

    if (unlockPerdicate("minecraft:enchanted_golden_apple_loot")(player)) {
        if (unlockPerdicate("minecraft:golden_apple_loot")(player) && floorPerdicate(5)(player)) sideItems.push(Item.of("minecraft:golden_apple", global.randomInt(1, 9)))
        if (floorPerdicate(10)(player)) sideItems.push(Item.of("minecraft:enchanted_golden_apple", global.randomInt(1, 5)))
    }
    else if (unlockPerdicate("minecraft:golden_apple_loot")(player) && floorPerdicate(5)(player)) sideItems.push(Item.of("minecraft:golden_apple", global.randomInt(1, 5)))

    if (bowPredicate(player)) sideItems.push(Item.of("minecraft:arrow", global.randomInt(1, 9)))
    if (gunPredicate(player)) sideItems.push(Item.of(global.randomPick(Ingredient.of("#gunswithoutroses:bullet").itemIds), global.randomInt(1, 9)))

    if (unlockPerdicate("supplementaries:bomb_blue_loot")(player)) {
        if (unlockPerdicate("supplementaries:bomb_loot")(player)) sideItems.push(Item.of("supplementaries:bomb", global.randomInt(1, 9)))
        sideItems.push(Item.of("supplementaries:bomb_blue", global.randomInt(1, 5)))
    }
    else if (unlockPerdicate("supplementaries:bomb_loot")(player)) sideItems.push(Item.of("supplementaries:bomb", global.randomInt(1, 5)))

    let potions = []
    potions = addPotionsWithUnlock(player, potions, "minecraft:healing")
    potions = addPotionsWithUnlock(player, potions, "minecraft:strong_healing")
    potions = addPotionsWithUnlock(player, potions, "minecraft:harming")
    potions = addPotionsWithUnlock(player, potions, "minecraft:strong_harming")
    potions = addPotionsWithUnlock(player, potions, "minecraft:poison", floorPerdicate(5))
    potions = addPotionsWithUnlock(player, potions, "minecraft:strong_poison", floorPerdicate(5))
    potions = addPotionsWithUnlock(player, potions, "minecraft:regeneration", floorPerdicate(5))
    potions = addPotionsWithUnlock(player, potions, "minecraft:strong_regeneration", floorPerdicate(5))
    potions = addPotionsWithUnlock(player, potions, "minecraft:swiftness", floorPerdicate(5))
    potions = addPotionsWithUnlock(player, potions, "minecraft:strong_swiftness", floorPerdicate(5))
    potions = addPotionsWithUnlock(player, potions, "alexsmobs:speed_iii", floorPerdicate(10))
    potions = addPotionsWithUnlock(player, potions, "minecraft:leaping", floorPerdicate(5))
    potions = addPotionsWithUnlock(player, potions, "minecraft:strong_leaping", floorPerdicate(5))
    potions = addPotionsWithUnlock(player, potions, "apotheosis:resistance", floorPerdicate(10))
    potions = addPotionsWithUnlock(player, potions, "apotheosis:strong_resistance", floorPerdicate(10))
    potions = addPotionsWithUnlock(player, potions, "alexsmobs:knockback_resistance", floorPerdicate(10))
    potions = addPotionsWithUnlock(player, potions, "alexsmobs:strong_knockback_resistance", floorPerdicate(10))
    potions = addPotionsWithUnlock(player, potions, "alexsmobs:sundering", floorPerdicate(10))
    potions = addPotionsWithUnlock(player, potions, "alexsmobs:strong_sundering", floorPerdicate(10))
    potions = addPotionsWithUnlock(player, potions, "minecraft:slow_falling", floorPerdicate(10))
    potions = addPotionsWithUnlock(player, potions, "minecraft:strong_slow_falling", floorPerdicate(10))
    potions = addPotionsWithUnlock(player, potions, "apotheosis:flying", floorPerdicate(45))
    if (potions.length > 0) sideItems.push(global.randomPick(potions))

    if (inventory.countItem(Item.of(MAIN_ITEM_PLACEHOLDER).item) > 0) inventory.setItem(inventory.find(Ingredient.of(MAIN_ITEM_PLACEHOLDER)), global.randomPick(mainItems))
    if (inventory.countItem(Item.of(SIDE_ITEM_PLACEHOLDER).item) > 0) inventory.setItem(inventory.find(Ingredient.of(SIDE_ITEM_PLACEHOLDER)), global.randomPick(sideItems))
})
// /setblock 15 14 17 minecraft:chest{LootTable:"gambleth:loot_chest"}