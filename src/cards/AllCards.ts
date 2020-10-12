import { CardManifest } from "./CardManifest";
import { COLONIES_CARD_MANIFEST } from "./colonies/ColoniesCardManifest";
import { PRELUDE_CARD_MANIFEST } from "./prelude/PreludeCardManifest";
import { PROMO_CARD_MANIFEST } from "./promo/PromoCardManifest";
import { BASE_CARD_MANIFEST, CORP_ERA_CARD_MANIFEST } from "./StandardCardManifests";
import { TURMOIL_CARD_MANIFEST } from "./turmoil/TurmoilCardManifest";
import { VENUS_CARD_MANIFEST } from "./venusNext/VenusCardManifest";

export const ALL_CARD_MANIFESTS: Array<CardManifest> = [
    BASE_CARD_MANIFEST,
    CORP_ERA_CARD_MANIFEST,
    PROMO_CARD_MANIFEST,
    VENUS_CARD_MANIFEST,
    COLONIES_CARD_MANIFEST,
    PRELUDE_CARD_MANIFEST,
    TURMOIL_CARD_MANIFEST,
    COLONIES_CARD_MANIFEST,
];

export const ALL_PROJECT_DECKS = ALL_CARD_MANIFESTS.map(deck => deck.projectCards);
export const ALL_CORPORATION_DECKS = ALL_CARD_MANIFESTS.map(deck => deck.corporationCards);
export const ALL_PRELUDE_DECKS = ALL_CARD_MANIFESTS.map(deck => deck.preludeCards);