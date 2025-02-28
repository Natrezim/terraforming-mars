<template>
    <div class="cards-filter">
        <h2 v-i18n>Cards to exclude from the game</h2>
        <div class="cards-filter-results-cont" v-if="selectedCardNames.length">
            <div class="cards-filter-result" v-for="cardName in selectedCardNames" v-bind:key="cardName">
                <label>{{ cardName }}<i class="create-game-expansion-icon expansion-icon-prelude" title="This card is prelude" v-if="isPrelude(cardName)"></i></label>
                <Button size="small" type="close" :onClick="_=>removeCard(cardName)" />
            </div>
        </div>
        <div class="cards-filter-input">
            <div>
                <input class="form-input" :placeholder="$t('Start typing the card name to exclude')" v-model="searchTerm" />
            </div>
            <div class="cards-filter-suggest" v-if="foundCardNames.length">
                <div class="cards-filter-suggest-item" v-for="cardName in foundCardNames" v-bind:key="cardName">
                    <a href="#" v-on:click.prevent="addCard(cardName)">
                      {{ cardName }}
                      <i class="create-game-expansion-icon expansion-icon-prelude" title="This card is prelude" v-if="isPrelude(cardName)"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {CardName} from '../../CardName';
import {ALL_PRELUDE_CARD_NAMES, ALL_PROJECT_CARD_NAMES} from '../../cards/AllCards';
import {TranslateMixin} from '../TranslateMixin';
import Button from '../common/Button.vue';

const allItems: Array<CardName> = ALL_PROJECT_CARD_NAMES.concat(ALL_PRELUDE_CARD_NAMES).sort();

interface CardsFilterModel {
    selectedCardNames: Array<CardName>;
    foundCardNames: Array<CardName>;
    searchTerm: string;
}

export default Vue.extend({
  name: 'CardsFilter',
  props: {},
  data() {
    return {
      selectedCardNames: [],
      foundCardNames: [],
      searchTerm: '',
    } as CardsFilterModel;
  },
  components: {Button},
  methods: {
    ...TranslateMixin.methods,
    isPrelude(cardName: CardName) {
      return ALL_PRELUDE_CARD_NAMES.includes(cardName);
    },
    removeCard(cardNameToRemove: CardName) {
      this.selectedCardNames = this.selectedCardNames.filter((curCardName) => curCardName !== cardNameToRemove).sort();
    },
    addCard(cardNameToAdd: CardName) {
      if (this.selectedCardNames.includes(cardNameToAdd)) return;
      this.selectedCardNames.push(cardNameToAdd);
      this.selectedCardNames.sort();
      this.searchTerm = '';
    },
  },
  watch: {
    selectedCardNames(value) {
      this.$emit('cards-list-changed', value);
    },
    searchTerm(value: string) {
      if (value === '') {
        this.foundCardNames = [];
        return;
      }
      if (value.indexOf(',') !== -1) {
        const cardNames = new Set(value.split(',').map((c) => c.trim()));
        for (const item of allItems) {
          if (cardNames.has(item)) {
            this.addCard(item);
          }
        }
        return;
      }
      const newCardNames = allItems.filter(
        (candidate: CardName) => ! this.selectedCardNames.includes(candidate) && candidate.toLowerCase().indexOf(value.toLowerCase()) !== -1,
      ).sort();
      this.foundCardNames = newCardNames.slice(0, 5);
    },
  },
});
</script>
