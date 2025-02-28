<script lang="ts">
import Vue from 'vue';
import Button from './common/Button.vue';

import {HowToPay} from '../inputs/HowToPay';
import Card from './card/Card.vue';
import {CardFinder} from '../CardFinder';
import {CardModel} from '../models/CardModel';
import {CardOrderStorage} from './CardOrderStorage';
import {PaymentWidgetMixin, SelectHowToPayForProjectCardModel} from './PaymentWidgetMixin';
import {PlayerInputModel} from '../models/PlayerInputModel';
import {PlayerViewModel, PublicPlayerModel} from '../models/PlayerModel';
import {PreferencesManager} from './PreferencesManager';
import {Tags} from '../cards/Tags';
import {TranslateMixin} from './TranslateMixin';
import {Units} from '../Units';

export default Vue.extend({
  name: 'SelectHowToPayForProjectCard',
  props: {
    player: {
      type: Object as () => PlayerViewModel,
    },
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
  computed: {
    thisPlayer: function(): PublicPlayerModel {
      return this.player.thisPlayer;
    },
  },
  data(): SelectHowToPayForProjectCardModel {
    let card: CardModel | undefined;
    let cards: Array<CardModel> = [];
    if (this.playerinput !== undefined &&
            this.playerinput.cards !== undefined &&
            this.playerinput.cards.length > 0) {
      cards = CardOrderStorage.getOrdered(
        CardOrderStorage.getCardOrder(this.player.id),
        this.playerinput.cards,
      );
      card = cards[0];
    }
    if (card === undefined) {
      throw new Error('no card provided in player input');
    }
    return {
      cardName: card.name,
      card: card,
      cards: cards,
      cost: 0,
      tags: [],
      heat: 0,
      megaCredits: 0,
      steel: 0,
      titanium: 0,
      microbes: 0,
      science: 0,
      floaters: 0,
      warning: undefined,
      available: Units.of({}),
    };
  },
  components: {
    Card,
    Button,
  },
  mounted() {
    Vue.nextTick(() => {
      this.$data.card = this.getCard();
      this.$data.cost = this.$data.card.calculatedCost;
      this.$data.tags = this.getCardTags(),
      this.$data.megaCredits = (this as unknown as typeof PaymentWidgetMixin.methods).getMegaCreditsMax();

      this.setDefaultValues();
    });
  },
  methods: {
    ...PaymentWidgetMixin.methods,
    ...TranslateMixin.methods,
    getCard() {
      const card = this.cards.find((c) => c.name === this.cardName); // this.player.cardsInHand.concat(this.player.selfReplicatingRobotsCards).find((c) => c.name === this.cardName);
      if (card === undefined) {
        throw new Error(`card not found ${this.cardName}`);
      }
      return card;
    },
    getCardTags() {
      const card = new CardFinder().getProjectCardByName(this.cardName);
      if (card === undefined) {
        throw new Error(`card not found ${this.cardName}`);
      }
      return card.tags;
    },
    setDefaultValues() {
      this.microbes = 0;
      this.floaters = 0;
      this.science = 0;
      this.steel = 0;
      this.titanium = 0;
      this.heat = 0;

      let megacreditBalance = Math.max(this.cost - this.thisPlayer.megaCredits, 0);

      // Calcualtes the optimal number of units to use given the unit value.
      //
      // It reads `megacreditBalance` as the remaining balance, and deducts the
      // consumed balance as part of this method.
      //
      // It returns the number of units consumed from availableUnits to make that
      const deductUnits = function(
        availableUnits: number | undefined,
        unitValue: number,
        overpay: boolean = true): number {
        if (availableUnits === undefined || availableUnits === 0) {
          return 0;
        }
        // The number of units required to sell to meet the balance.
        const _tmp = megacreditBalance / unitValue;
        const balanceAsUnits = overpay ? Math.ceil(_tmp) : Math.floor(_tmp);
        const contributingUnits = Math.min(availableUnits, balanceAsUnits);

        megacreditBalance -= contributingUnits * unitValue;
        return contributingUnits;
      };

      // This function help save some money at the end
      const saveOverSpendingUnits = function(
        spendingUnits: number | undefined,
        unitValue: number): number {
        if (spendingUnits === undefined || spendingUnits === 0 || megacreditBalance === 0) {
          return 0;
        }
        // Calculate the unit of resource we can save and still pay enough
        const overSpendingAsUnits = Math.floor(Math.abs(megacreditBalance) / unitValue);
        const toSaveUnits = Math.min(spendingUnits, overSpendingAsUnits);

        megacreditBalance += toSaveUnits * unitValue;
        return toSaveUnits;
      };

      if (megacreditBalance > 0 && this.canUseMicrobes()) {
        this.microbes = deductUnits(this.playerinput.microbes, 2);
      }

      if (megacreditBalance > 0 && this.canUseFloaters()) {
        this.floaters = deductUnits(this.playerinput.floaters, 3);
      }

      if (megacreditBalance > 0 && this.canUseScience()) {
        this.science = deductUnits(this.playerinput.science, 1);
      }

      this.available.steel = Math.max(this.thisPlayer.steel - this.card.reserveUnits.steel, 0);
      if (megacreditBalance > 0 && this.canUseSteel()) {
        this.steel = deductUnits(this.available.steel, this.thisPlayer.steelValue, true);
      }

      this.available.titanium = Math.max(this.thisPlayer.titanium - this.card.reserveUnits.titanium, 0);
      if (megacreditBalance > 0 && this.canUseTitanium()) {
        this.titanium = deductUnits(this.available.titanium, this.thisPlayer.titaniumValue, true);
      }

      this.available.heat = Math.max(this.thisPlayer.heat - this.card.reserveUnits.heat, 0);
      if (megacreditBalance > 0 && this.canUseHeat()) {
        this.heat = deductUnits(this.available.heat, 1);
      }

      // If we are overspending
      if (megacreditBalance < 0) {
        // Try to spend less resource if possible, in the reverse order of the payment (also from high to low)
        // We need not try to save heat since heat is paid last at value 1. We will never overspend in heat.
        // We do not need to save Ti either because Ti is paid last before heat. If we overspend, it is because of Ti.
        // We cannot reduce the amount of Ti and still pay enough.
        this.steel -= saveOverSpendingUnits(this.steel, this.thisPlayer.steelValue);
        this.floaters -= saveOverSpendingUnits(this.floaters, 3);
        this.microbes -= saveOverSpendingUnits(this.microbes, 2);
        this.science -= saveOverSpendingUnits(this.science, 1);
        this.megaCredits -= saveOverSpendingUnits(this.megaCredits, 1);
      }
    },
    canUseHeat(): boolean {
      return this.playerinput.canUseHeat === true && this.thisPlayer.heat > 0;
    },
    canUseSteel() {
      if (this.card !== undefined && this.available.steel > 0) {
        if (this.tags.find((tag) => tag === Tags.BUILDING) !== undefined) {
          return true;
        }
      }
      return false;
    },
    canUseTitanium() {
      if (this.card !== undefined && this.available.titanium > 0) {
        if (this.tags.find((tag) => tag === Tags.SPACE) !== undefined) {
          return true;
        }
      }
      return false;
    },
    canUseMicrobes() {
      // FYI Microbes are limited to the Psychrophiles card, which allows spending microbes for Plant cards.
      if (this.card !== undefined && this.playerinput.microbes !== undefined && this.playerinput.microbes > 0) {
        if (this.tags.find((tag) => tag === Tags.PLANT) !== undefined) {
          return true;
        }
      }
      return false;
    },
    canUseFloaters() {
      // FYI Floaters are limited to the DIRIGIBLES card.
      if (this.card !== undefined && this.playerinput.floaters !== undefined && this.playerinput.floaters > 0) {
        if (this.tags.find((tag) => tag === Tags.VENUS) !== undefined) {
          return true;
        }
      }
      return false;
    },
    canUseScience() {
      // FYI Science Resources are limited to the Luna Archive card, which allows spending its science resources for Moon cards.
      if (this.card !== undefined && (this.playerinput.science ?? 0) > 0) {
        if (this.tags.find((tag) => tag === Tags.MOON) !== undefined) {
          return true;
        }
      }
      return false;
    },
    cardChanged() {
      this.card = this.getCard();
      this.cost = this.card.calculatedCost || 0;
      this.tags = this.getCardTags();

      this.megaCredits = (this as unknown as typeof PaymentWidgetMixin.methods).getMegaCreditsMax();

      this.setDefaultValues();
    },
    hasWarning(): boolean {
      return this.warning !== undefined;
    },
    hasCardWarning(): boolean {
      return this.card !== undefined && this.card.warning !== undefined;
    },
    showReserveSteelWarning(): boolean {
      return this.card?.reserveUnits?.steel > 0 && this.canUseSteel();
    },
    showReserveTitaniumWarning(): boolean {
      return this.card?.reserveUnits?.titanium > 0 && this.canUseTitanium();
    },
    showReserveHeatWarning(): boolean {
      return this.card?.reserveUnits?.heat > 0 && this.canUseHeat();
    },
    saveData() {
      const htp: HowToPay = {
        heat: this.heat,
        megaCredits: this.megaCredits,
        steel: this.steel,
        titanium: this.titanium,
        microbes: this.microbes,
        floaters: this.floaters,
        science: this.science,
      };
      if (htp.megaCredits > this.thisPlayer.megaCredits) {
        this.warning = 'You don\'t have that many M€';
        return;
      }
      if (this.playerinput.microbes !== undefined && htp.microbes > this.playerinput.microbes) {
        this.warning = 'You don\'t have enough microbes';
        return;
      }
      if (this.playerinput.floaters !== undefined && htp.floaters > this.playerinput.floaters) {
        this.warning = 'You don\'t have enough floaters';
        return;
      }
      if (this.playerinput.science !== undefined && htp.science > this.playerinput.science) {
        this.warning = 'You don\'t have enough science resources';
        return;
      }
      if (htp.heat > this.thisPlayer.heat) {
        this.warning = 'You don\'t have enough heat';
        return;
      }
      if (htp.titanium > this.thisPlayer.titanium) {
        this.warning = 'You don\'t have enough titanium';
        return;
      }
      if (htp.steel > this.thisPlayer.steel) {
        this.warning = 'You don\'t have enough steel';
        return;
      }

      const totalSpentAmt =
        (3 * htp.floaters) +
        (2 * htp.microbes) +
        htp.science +
        htp.heat +
        htp.megaCredits +
        (htp.steel * this.thisPlayer.steelValue) +
        (htp.titanium * this.thisPlayer.titaniumValue);

      if (totalSpentAmt < this.cost) {
        this.warning = 'Haven\'t spent enough';
        return;
      }

      if (totalSpentAmt > this.cost) {
        const diff = totalSpentAmt - this.cost;
        if (htp.titanium && diff >= this.thisPlayer.titaniumValue) {
          this.warning = 'You cannot overspend titanium';
          return;
        }
        if (htp.steel && diff >= this.thisPlayer.steelValue) {
          this.warning = 'You cannot overspend steel';
          return;
        }
        if (htp.floaters && diff >= 3) {
          this.warning = 'You cannot overspend floaters';
          return;
        }
        if (htp.microbes && diff >= 2) {
          this.warning = 'You cannot overspend microbes';
          return;
        }
        if (htp.science && diff >= 1) {
          this.warning = 'You cannot overspend science resources';
          return;
        }
        if (htp.heat && diff >= 1) {
          this.warning = 'You cannot overspend heat';
          return;
        }
        if (htp.megaCredits && diff >= 1) {
          this.warning = 'You cannot overspend megaCredits';
          return;
        }
      }

      const showAlert = PreferencesManager.load('show_alerts') === '1';

      if (totalSpentAmt > this.cost && showAlert) {
        const diff = totalSpentAmt - this.cost;

        if (confirm('Warning: You are overpaying by ' + diff + ' M€')) {
          this.onsave([[
            this.card.name,
            JSON.stringify(htp),
          ]]);
        } else {
          this.warning = 'Please adjust payment amount';
          return;
        }
      } else {
        this.onsave([[
          this.card.name,
          JSON.stringify(htp),
        ]]);
      }
    },
  },
});
</script>
<template>
<div class="payments_cont">

  <div v-if="showtitle === true">{{ $t(playerinput.title) }}</div>

  <label v-for="availableCard in cards" class="payments_cards" :key="availableCard.name">
    <input class="hidden" type="radio" v-model="cardName" v-on:change="cardChanged()" :value="availableCard.name" />
    <Card class="cardbox" :card="availableCard" />
  </label>

  <section v-trim-whitespace>
    <div v-if="hasCardWarning()" class="card-warning">{{ $t(card.warning) }}</div>

    <h3 class="payments_title" v-i18n>How to pay?</h3>

    <div class="payments_type input-group" v-if="canUseSteel()">
      <i class="resource_icon resource_icon--steel payments_type_icon" title="Pay by Steel"></i>
      <Button type="minus" :onClick="_=>reduceValue('steel', 1)" />
      <input class="form-input form-inline payments_input" v-model.number="steel" />
      <Button type="plus" :onClick="_=>addValue('steel', 1, this.available.steel)" />
      <Button type="max" :onClick="_=>setMaxValue('steel', this.available.steel)" title="MAX" />
    </div>
    <div v-if="showReserveSteelWarning()" class="card-warning" v-i18n>
    (Some steel is unavailable here in reserve for the project card.)
    </div>

    <div class="payments_type input-group" v-if="canUseTitanium()">
      <i class="resource_icon resource_icon--titanium payments_type_icon" :title="$t('Pay by Titanium')"></i>
      <Button type="minus" :onClick="_=>reduceValue('titanium', 1)" />
      <input class="form-input form-inline payments_input" v-model.number="titanium" />
      <Button type="plus" :onClick="_=>addValue('titanium', 1, this.available.titanium)" />
      <Button type="max" :onClick="_=>setMaxValue('titanium', this.available.titanium)" title="MAX" />
    </div>
    <div v-if="showReserveTitaniumWarning()" class="card-warning" v-i18n>
    (Some titanium is unavailable here in reserve for the project card.)
    </div>

    <div class="payments_type input-group" v-if="canUseHeat()">
      <i class="resource_icon resource_icon--heat payments_type_icon" :title="$t('Pay by Heat')"></i>
      <Button type="minus" :onClick="_=>reduceValue('heat', 1)" />
      <input class="form-input form-inline payments_input" v-model.number="heat" />
      <Button type="plus" :onClick="_=>addValue('heat', 1, this.available.heat)" />
      <Button type="max" :onClick="_=>setMaxValue('heat', this.available.heat)" title="MAX" />
    </div>
    <div v-if="showReserveHeatWarning()" class="card-warning" v-i18n>
    (Some heat is unavailable here in reserve for the project card.)
    </div>

    <div class="payments_type input-group" v-if="canUseMicrobes()">
      <i class="resource_icon resource_icon--microbe payments_type_icon" :title="$t('Pay by Microbes')"></i>
      <Button type="minus" :onClick="_=>reduceValue('microbes', 1)" />
      <input class="form-input form-inline payments_input" v-model.number="microbes" />
      <Button type="plus" :onClick="_=>addValue('microbes', 1)" />
      <Button type="max" :onClick="_=>setMaxValue('microbes')" title="MAX" />
    </div>

    <div class="payments_type input-group" v-if="canUseFloaters()">
      <i class="resource_icon resource_icon--floater payments_type_icon" :title="$t('Pay by Floaters')"></i>
      <Button type="minus" :onClick="_=>reduceValue('floaters', 1)" />
      <input class="form-input form-inline payments_input" v-model.number="floaters" />
      <Button type="plus" :onClick="_=>addValue('floaters', 1)" />
      <Button type="max" :onClick="_=>setMaxValue('floaters')" title="MAX" />
    </div>

    <div class="payments_type input-group" v-if="canUseScience()">
      <i class="resource_icon resource_icon--science payments_type_icon" :title="$t('Pay by Science Resources')"></i>
      <Button type="minus" :onClick="_=>reduceValue('science', 1)" />
      <input class="form-input form-inline payments_input" v-model.number="science" />
      <Button type="plus" :onClick="_=>addValue('science', 1)" />
      <Button type="max" :onClick="_=>setMaxValue('science')" title="MAX" />
    </div>

    <div class="payments_type input-group">
      <i class="resource_icon resource_icon--megacredits payments_type_icon" :title="$t('Pay by Megacredits')"></i>
      <Button type="minus" :onClick="_=>reduceValue('megaCredits', 1)" />
      <input class="form-input form-inline payments_input" v-model.number="megaCredits" />
      <Button type="plus" :onClick="_=>addValue('megaCredits', 1)" />
    </div>

    <div v-if="hasWarning()" class="tm-warning">
      <label class="label label-error">{{ $t(warning) }}</label>
    </div>

    <div v-if="showsave === true" class="payments_save">
      <Button size="big" :onClick="saveData" :title="playerinput.buttonLabel" />
    </div>
  </section>
</div>
</template>
