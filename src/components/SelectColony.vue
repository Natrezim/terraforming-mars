<template>
  <div class="wf-component wf-component--select-card">
    <div v-if="showtitle === true" class="nofloat wf-component-title">{{ $t(playerinput.title) }}</div>
    <label v-for="colony in (playerinput.coloniesModel || [])" class="cardbox" :key="colony.name">
      <input type="radio" v-model="selectedColony" :value="colony.name" />
      <colony :colony="colony"></colony>
    </label>
    <div v-if="showsave === true" class="nofloat">
      <Button :onClick="saveData" :title="playerinput.buttonLabel" :disabled="!canSave()"/>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Colony from './Colony.vue';
import Button from '../components/common/Button.vue';
import {PlayerInputModel} from '../models/PlayerInputModel';
import {TranslateMixin} from './TranslateMixin';

export default Vue.extend({
  name: 'SelectColony',
  props: {
    playerinput: {
      type: Object as () => PlayerInputModel,
    },
    onsave: {
      type: Function as unknown as () => (out: Array<Array<string>>) => void,
    },
    showsave: {
      type: Boolean,
    },
    showtitle: {
      type: Boolean,
    },
  },
  data() {
    return {
      selectedColony: undefined as string | undefined,
    };
  },
  components: {
    'colony': Colony,
    Button,
  },
  methods: {
    ...TranslateMixin.methods,
    canSave() {
      return this.selectedColony !== undefined;
    },
    saveData() {
      const result: string[][] = [];
      result.push([]);
      if (this.canSave()) {
        result[0].push(this.selectedColony ?? '');
      }
      this.onsave(result);
    },
  },
});
</script>
