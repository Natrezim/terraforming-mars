<template>
    <div :class="formatCssClass()" :key="componentKey">
      <PlayerInfo v-show="isExpanded()" :player="player.thisPlayer" :playerView="player" actionLabel="" :playerIndex="0" :hideZeroTags="true"/>
      <div class="top-bar-collapser" v-on:click="toggleBar()">
        <img src="/assets/arrows_left.png">
      </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {PlayerViewModel} from '../models/PlayerModel';
import PlayerInfo from './overview/PlayerInfo.vue';
import {PreferencesManager} from './PreferencesManager';

export default Vue.extend({
  name: 'top-bar',
  props: {
    player: {
      type: Object as () => PlayerViewModel,
    },
  },
  components: {
    PlayerInfo,
  },
  data() {
    return {
      componentKey: 0,
    };
  },
  methods: {
    forceRerender() {
      this.componentKey += 1;
    },
    toggleBar() {
      PreferencesManager.save('hide_top_bar', this.isExpanded(), true);
      this.forceRerender();
    },
    isExpanded(): boolean {
      return !PreferencesManager.loadBoolean('hide_top_bar');
    },
    formatCssClass(): string {
      const cssClasses = ['top-bar'];
      if ( ! this.isExpanded()) {
        cssClasses.push('top-bar-collapsed');
      }
      return cssClasses.join(' ');
    },
  },
});
</script>

