<template>
    <div class="card-extra-content-container">
      <div v-if="lifeFound(card)" class="little-green-men" />
      <div v-if="isMiningTileOnMetal(card,'steel')" class="mined-metal mined-steel" />
      <div v-if="isMiningTileOnMetal(card,'titanium')" class="mined-metal mined-titanium" />
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {CardModel} from '../../models/CardModel';
import {CardName} from '../../CardName';
import {Resources} from '../../Resources';

export default Vue.extend({
  name: 'CardExtraContent',
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  methods: {
    lifeFound(card: CardModel): boolean {
      return card.name === CardName.SEARCH_FOR_LIFE && card.resources !== undefined && card.resources > 0;
    },
    isMiningTileOnMetal(card: CardModel, metal: string): boolean {
      const miningCard = [CardName.MINING_RIGHTS, CardName.MINING_AREA, CardName.MINING_RIGHTS_ARES, CardName.MINING_AREA_ARES];
      if (miningCard.includes(card.name)) {
        if (metal === Resources.TITANIUM) {
          return card.bonusResource === Resources.TITANIUM;
        } else if (metal === Resources.STEEL) {
          return card.bonusResource === Resources.STEEL;
        }
      }
      return false;
    },
    miningTileOnTitanium(card: CardModel): boolean {
      return card.name === CardName.SEARCH_FOR_LIFE && card.resources !== undefined && card.resources > 0;
    },
  },
});

</script>

