<template>
  <div class='board-space-bonuses'>
    <i v-for="(spaceBonus, idx) in bonus" :key="idx" :class="getClass(idx + 1, spaceBonus)" />
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {SpaceBonus} from '../SpaceBonus';

export default Vue.extend({
  name: 'bonus',
  props: {
    bonus: {
      type: Array as () => Array<SpaceBonus>,
    },
  },
  methods: {
    getClass(idx: number, bonus: SpaceBonus): string {
      let ret = 'board-space-bonus board-space-bonus--';
      if (bonus === SpaceBonus.TITANIUM) {
        ret += 'titanium';
      } else if (bonus === SpaceBonus.STEEL) {
        ret += 'steel';
      } else if (bonus === SpaceBonus.PLANT) {
        ret += 'plant';
      } else if (bonus === SpaceBonus.DRAW_CARD) {
        ret += 'card';
      } else if (bonus === SpaceBonus.HEAT) {
        ret += 'heat';
      } else if (bonus === SpaceBonus.OCEAN) {
        ret += 'bonusocean';
      }
      ret += ' board-space-bonus-pos--' + idx.toString();
      return ret;
    },
  },
});

</script>

