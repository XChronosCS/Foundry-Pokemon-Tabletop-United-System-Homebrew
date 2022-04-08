import Component from '../../api/front-end/lib/component.js';
import { pokeball_sound_paths } from '../../combat/effects/pokeball_effects.js';
import { sendMoveMessage } from '../../actor/pokemon-sheet-gen8.js';
import { CoatIcon, FullActionIcon, ShiftActionIcon, BlastIcon, BlessingIcon, BurstIcon, LineIcon, MeleeIcon, SelfIcon, RangeIcon, TriggerIcon, FieldIcon, SwiftActionIcon, HealingIcon, FriendlyIcon, SonicIcon, InterruptIcon, ShieldIcon, SocialIcon, FiveStrikeIcon, DoubleStrikeIcon, GroundsourceIcon, SmiteIcon, ExhaustIcon, PassIcon, SetupIcon, IllusionIcon } from '../constants.js';

export const ui_sound_paths = {
    "button": "systems/ptu/sounds/ui_sounds/ui_button.wav",
    "flip": "systems/ptu/sounds/ui_sounds/ui_cardflip.wav",
    "check_on": "systems/ptu/sounds/ui_sounds/ui_checkbox_on.wav",
    "check_off": "systems/ptu/sounds/ui_sounds/ui_checkbox_off.wav",
    "pokedex_scan": "systems/ptu/sounds/ui_sounds/ui_pokedex_ding.wav",
    "warning": "systems/ptu/sounds/ui_sounds/ui_warning.wav",
};

export default class MenuComponent extends Component {
    constructor(store) {
        super({
            store,
            element: $('#menu-component')
        })
        this._hidden = false;
    }

    /**
     * React to state changes and render the component's HTML
     *
     * @returns {void}
     */
    async render() {
        if (!this.state.actor) return;


        const dividerIcon = "<img class='divider-image' src='systems/ptu/images/icons/Divider.png' style='border:none; width:200px;'>"
        let output = dividerIcon;
        this.struggles_list = await this._getStruggles(this.state.actor, this.state.targetedActors);

        switch (this.state.menuOption) {
            case "struggle":
                output += await renderTemplate("/systems/ptu/module/sidebar/components/menu-component.hbs", {
                    menu: "struggle",
                    struggles: this.struggles_list
                })
                break;
            case "pokeball":
                if (this.state.actor.type == "pokemon") return this.store.dispatch('changeMenuOption', "none");

                output += await renderTemplate("/systems/ptu/module/sidebar/components/menu-component.hbs", {
                    menu: "pokeball",
                    ball: await this._getTrainerPokeballArray(this.state.actor)
                })
                break;
            case "maneuver":

                break;
            default:
                output += await renderTemplate("/systems/ptu/module/sidebar/components/menu-component.hbs", {
                    menu: "none"
                })
                break;
        }

        this.element.html(output);

        this.element.children('#menu-buttons').children('.menu-item').on("click", (event) => {
            event.preventDefault();
            const type = event.currentTarget.dataset.type;

            switch (type) {
                case "struggle":
                    if (this.state.menuOption == type) {
                        this.store.dispatch('changeMenuOption', "none");
                        if(game.settings.get("ptu", "PlayUISounds")) AudioHelper.play({ src: ui_sound_paths["check_off"], volume: (game.settings.get("core", "globalInterfaceVolume")), autoplay: true, loop: false }, false);
                    }
                    else {
                        this.store.dispatch('changeMenuOption', type);
                        if(game.settings.get("ptu", "PlayUISounds")) AudioHelper.play({ src: ui_sound_paths["check_on"], volume: (game.settings.get("core", "globalInterfaceVolume")), autoplay: true, loop: false }, false);
                    }
                    break;
                case "pokeball":
                    if (this.state.menuOption == type) {
                        this.store.dispatch('changeMenuOption', "none");
                        if(game.settings.get("ptu", "PlayUISounds")) 
                        {
                            AudioHelper.play({ src: pokeball_sound_paths["menu_close"], volume: (game.settings.get("core", "globalInterfaceVolume")), autoplay: true, loop: false }, false);
                            AudioHelper.play({ src: ui_sound_paths["check_off"], volume: (game.settings.get("core", "globalInterfaceVolume")), autoplay: true, loop: false }, false);
                        }
                    }
                    else {
                        this.store.dispatch('changeMenuOption', type);
                        if(game.settings.get("ptu", "PlayUISounds")) 
                        {
                            AudioHelper.play({ src: pokeball_sound_paths["menu_open"], volume: (game.settings.get("core", "globalInterfaceVolume")), autoplay: true, loop: false }, false);
                            AudioHelper.play({ src: ui_sound_paths["check_on"], volume: (game.settings.get("core", "globalInterfaceVolume")), autoplay: true, loop: false }, false);
                        }
                    }
                    break;
                case "maneuver":
                    if (this.state.menuOption == type) {
                        this.store.dispatch('changeMenuOption', "none");
                        if(game.settings.get("ptu", "PlayUISounds")) AudioHelper.play({ src: ui_sound_paths["check_off"], volume: (game.settings.get("core", "globalInterfaceVolume")), autoplay: true, loop: false }, false);
                    }
                    else {
                        this.store.dispatch('changeMenuOption', type);
                        if(game.settings.get("ptu", "PlayUISounds")) AudioHelper.play({ src: ui_sound_paths["check_on"], volume: (game.settings.get("core", "globalInterfaceVolume")), autoplay: true, loop: false }, false);
                    }
                    break;
                case "rest":
                    // Render rest pop-up
                    break;
            }
        })

        this.element.children('#menu-content').children('.pokeball-item').on("click", (event) => {
            const { entityId, ballName, ownerId } = event.target.dataset;

            const owner = game.actors.get(ownerId);
            game.ptu.ThrowPokeball(owner, game.user?.targets?.first(), owner?.items.get(entityId));
        })

        for (const move of this.struggles_list ?? []) {
            $(`.movemaster-button[data-button="${move._id}"]`).on("mousedown", (event) => {
                // Handle on move click here, for now just log that button is clicked
                switch(event.which) {
                    case 3: // Right click
                        sendMoveMessage({
                            speaker: ChatMessage.getSpeaker({
                                actor: this.state.actor
                            }),
                            moveName: move.name,
                            move: move.data,
                        })
                        break;
                    case 1: // Left click
                    case 2: // Middle click
                    default: // anything else??
                        this.state.actor.executeMove(move._id, {passingInMove:true, passedInMove:move})
                }
            })
        }

        this.element.children(".divider-image").on("click", () => {
            if (this._hidden) {
                this.element.children(":not(.divider-image)").fadeIn();
                this._hidden = false;
            }
            else {
                this.element.children(":not(.divider-image)").fadeOut();
                this._hidden = true;
            }
        })
    }

    _onDragStart(event) {
        const dragData = {
            type: 'Actor',
            id: event.target?.dataset?.entityId
        }
        event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    _onHoverIn(event) {
        event.preventDefault();
        if (!canvas.ready) return;
        const li = event.target;
        const actorId = li.dataset.entityId
        const tokens = game.actors.get(actorId).getActiveTokens(true);
        if (tokens && tokens[0]?.isVisible) {
            if (!tokens[0]._controlled) tokens[0]._onHoverIn(event);
            this._highlighted = tokens[0];
        }
    }
    _onHoverOut(event) {
        event.preventDefault();
        if (this._highlighted) this._highlighted._onHoverOut(event);
        this._highlighted = null;
    }
    _onClick(event) {
        event.preventDefault();

        const li = event.target;
        const actorId = li.dataset.entityId
        const actor = game.actors.get(actorId)
        const token = actor?.getActiveTokens(true)[0];
        if (!actor?.testUserPermission(game.user, "OBSERVED")) return;
        const now = Date.now();

        // Handle double-left click to open sheet
        const dt = now - this._clickTime;
        this._clickTime = now;
        if (dt <= 250) return actor?.sheet.render(true);

        // Control and pan to Token object
        if (token) {
            token.control({ releaseOthers: true });
            return canvas.animatePan({ x: token.data.x, y: token.data.y });
        }
    }

    _calculateColor(health) {
        const healthPercentage = (health.value / health.max);

        if (healthPercentage >= 1) {
            return "green";
        }
        if (healthPercentage > 0.75) {
            return "lime";
        }
        if (healthPercentage > 0.50) {
            return "orange";
        }
        if (healthPercentage > 0.25) {
            return "red";
        }
        if (healthPercentage > 0) {
            return "darkred";
        }
        return "black";
    }

    async _getStruggles(actor, targetIds) {
        if (!actor) return;

        const struggleAc = actor.data.data.skills.combat.value >= 5 ? 3 : 4;
        const struggleDb = actor.data.data.skills.combat.value >= 5 ? 5 : 4;

        const struggleCapabilities = {
            "firestarter": { "type": "Fire" },
            "fountain": { "type": "Water" },
            "freezer": { "type": "Ice" },
            "guster": { "type": "Flying" },
            "materializer": { "type": "Rock" },
            "telekinetic": { "type": "Normal" },
            "zapper": { "type": "Electric" }
        };
        const isTelekinetic = (typeof actor.itemTypes.capability.find(x => x.name.includes("Telekinetic")) != "undefined");//actor.itemTypes.capability.includes("Telekinetic");

        let range = (isTelekinetic ? actor.data.data.skills.focus.value.total+", 1 Target" : "Melee" + ", 1 Target");
        let rangeIconsHtml = this._getRangeIcons(range);

        let effectiveness = 1;

        if (targetIds.length == 0) {
            effectiveness = -1;
        }
        if (targetIds.length == 1) {
            effectiveness = this.store.getTarget(targetIds[0]).data.data.effectiveness?.All["Normal"] ?? 1;
        }
        if (targetIds.length > 1) { // TODO: Maybe add a way to display multiple effectiveness borders?
            effectiveness = -1;
        }

        const struggles = [{
            name: "Struggle",
            data:{
                name: "Struggle",
                type: "Normal",
                category: "Physical",
                ac: struggleAc,
                damageBase: struggleDb,
                frequency:"At-Will",
                range: range,
                rangeIconsHtml: rangeIconsHtml,
                effectiveness: effectiveness,
                data:{
                    name: "Struggle",
                    type: "Normal",
                    category: "Physical",
                    ac: struggleAc,
                    damageBase: struggleDb,
                    frequency:"At-Will",
                    range: range,
                    rangeIconsHtml: rangeIconsHtml,
                    effectiveness: effectiveness
                }
            },
            _id:"StrugglePhysical"
        }];

        for (const item of actor.itemTypes.capability) {
            const capability = struggleCapabilities[item.name.toLowerCase()];
            if (!capability) continue;

            if (targetIds.length == 1) {
                effectiveness = this.store.getTarget(targetIds[0]).data.data.effectiveness?.All[capability.type] ?? 1;
            }

            struggles.push({
                name: item.name,
                data:{
                    name: item.name,
                    type: capability.type,
                    ac: struggleAc,
                    damageBase: struggleDb,
                    category: "Physical",
                    frequency:"At-Will",
                    range: range,
                    rangeIconsHtml: rangeIconsHtml,
                    effectiveness: effectiveness,
                    data:{
                        name: item.name,
                        type: capability.type,
                        ac: struggleAc,
                        damageBase: struggleDb,
                        category: "Physical",
                        frequency:"At-Will",
                        range: range,
                        rangeIconsHtml: rangeIconsHtml,
                        effectiveness: effectiveness
                    }
                },
                _id:item.name+"Physical"
            });
            struggles.push({
                name: item.name,
                data:{
                    name: item.name,
                    type: capability.type,
                    ac: struggleAc,
                    damageBase: struggleDb,
                    category: "Special",
                    frequency:"At-Will",
                    range: range,
                    rangeIconsHtml: rangeIconsHtml,
                    effectiveness: effectiveness,
                    data:{
                        name: item.name,
                        type: capability.type,
                        ac: struggleAc,
                        damageBase: struggleDb,
                        category: "Special",
                        frequency:"At-Will",
                        range: range,
                        rangeIconsHtml: rangeIconsHtml,
                        effectiveness: effectiveness
                    }
                },
                _id:item.name+"Special"
            })
        }

        return struggles;
    }

    async _getTrainerPokeballArray(actor) {
        return actor.items.filter(item => item.type == "item" && item.data.data.category.toLowerCase() == "pokeballs").map(item => {
            return {
                name: item.name,
                id: item.id,
                owner: actor.id,
                img: item.img,
                amount: item.data.data.quantity
            }
        });
    }


    _getRangeIcons(rangeText, actionType = "Standard") {
        if(!rangeText) return;
        const range = rangeText.toLowerCase().split(",").map(x => x.trim());

        let o = "";
        for(const r of range.slice(0, -1)) {
            const x = getIcon(r);
            if(x) o += `<span>${x}</span>`;
        }
        const x = getIcon(range[range.length-1]);
        if(x) o += `<span>${x}</span>`;

        function getIcon(range) {
            if(!range) return;
            switch (true) {
                case range.includes("see effect"): return range;
                case range.includes("blessing"): return BlessingIcon; 
                case range.includes("self"): return SelfIcon;
                case range.includes("burst"): return BurstIcon + range.slice(range.indexOf("burst")+"burst".length).split(',')[0].trim();
                case range.includes("line"): return LineIcon + range.slice(range.indexOf("line")+"line".length).split(',')[0].trim();
                case range.includes("close blast"): return MeleeIcon + BlastIcon + range.slice(range.indexOf("close blast")+"close blast".length).split(',')[0].trim();
                case range.includes("ranged blast"): return BlastIcon + range.slice(range.indexOf("ranged blast")+"ranged blast".length).split(',')[0].trim();
                case range.includes("melee"): return MeleeIcon;
                case range.includes("trigger"): return TriggerIcon;
                case range.includes("field"): return FieldIcon;
                case range.includes("swift action"): return SwiftActionIcon;
                case range.includes("full action"): return FullActionIcon;
                case range.includes("shift"): return ShiftActionIcon;
                case range.includes("healing"): return HealingIcon;
                case range.includes("friendly"): return FriendlyIcon;
                case range.includes("sonic"): return SonicIcon;
                case range.includes("interrupt"): return InterruptIcon;
                case range.includes("shield"): return ShieldIcon;
                case range.includes("social"): return SocialIcon;
                case range.includes("five strike"): 
                case range.includes("fivestrike"): return FiveStrikeIcon;
                case range.includes("double strike"): 
                case range.includes("doublestrike"): return DoubleStrikeIcon;
                case range.includes("groundsource"): return GroundsourceIcon;
                case range.includes("smite"): return SmiteIcon;
                case range.includes("exhaust"): return ExhaustIcon;
                case range.includes("pass"): return PassIcon;
                case range.includes("set-up"): return SetupIcon;
                case range.includes("illusion"): return IllusionIcon;
                case range.includes("coat"): return CoatIcon;
                case !isNaN(Number(range)): return RangeIcon + range.split(',')[0].trim()
                default: {
                    if(range.includes("1 target")) return "";
                    return `${range}`;
                }
            }
        }
        
        return o;
    }
}