<template>
  <div :class="getClass()">
    <div class="event-party event-party--top" :class="partyNameClass(globalEvent.revealed)" v-i18n>{{ globalEvent.revealed }}</div>
    <div class="event-party event-party--bottom" :class="partyNameClass(globalEvent.current)" v-i18n>{{ globalEvent.current }}</div>
    <div class="event-content"><div class="event-text" v-i18n>{{ globalEvent.description }}</div></div>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {GlobalEventModel} from '../models/TurmoilModel';

export default Vue.extend({
  name: 'global-event',
  props: {
    globalEvent: {
      type: Object as () => GlobalEventModel,
    },
    type: {
      type: String,
    },
  },
  methods: {
    partyNameClass(partyName: string): string {
      if (partyName === undefined) {
        return '';
      }
      return 'event-party--' + partyName.toLowerCase().split(' ').join('_');
    },
    getClass(): string {
      const common = 'global-event';
      switch (this.type) {
      case 'coming':
        return common + ' global-event--coming';
      case 'current':
        return common + ' global-event--current';
      default:
        return common;
      }
    },
  },
});

</script>
