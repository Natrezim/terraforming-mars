<script lang="ts">
import Vue from 'vue';
import PlayerInfo from './PlayerInfo.vue';
import OverviewSettings from './OverviewSettings.vue';
import OtherPlayer from '../OtherPlayer.vue';
import {PlayerViewModel, PublicPlayerModel} from '../../models/PlayerModel';
import {ActionLabel} from './ActionLabel';
import {Phase} from '../../Phase';
import {Color} from '../../Color';

const SHOW_NEXT_LABEL_MIN = 2;

export const getCurrentPlayerIndex = (
  currentPlayerColor: Color,
  players: Array<PublicPlayerModel>,
): number => {
  let currentPlayerIndex: number = 0;
  players.forEach((p: PublicPlayerModel, index: number) => {
    if (p.color === currentPlayerColor) {
      currentPlayerIndex = index;
    }
  });
  return currentPlayerIndex;
};

export default Vue.extend({
  name: 'PlayersOverview',
  props: {
    player: {
      type: Object as () => PlayerViewModel,
    },
  },
  components: {
    'player-info': PlayerInfo,
    'overview-settings': OverviewSettings,
    'other-player': OtherPlayer,
  },
  data() {
    return {};
  },
  methods: {
    hasPlayers(): boolean {
      return this.player.players.length > 0;
    },
    getPlayerOnFocus(): PublicPlayerModel {
      return this.player.players.filter(
        (p: PublicPlayerModel) => p.color === this.player.thisPlayer.color,
      )[0];
    },
    getIsFirstForGen(player: PublicPlayerModel): boolean {
      return getCurrentPlayerIndex(player.color, this.player.players) === 0;
    },
    getPlayersInOrder(): Array<PublicPlayerModel> {
      const players = this.player.players;
      let result: Array<PublicPlayerModel> = [];
      let currentPlayerOffset: number = 0;
      const currentPlayerIndex: number = getCurrentPlayerIndex(
        this.player.thisPlayer.color,
        this.player.players,
      );

      // shift the array by putting the player on focus at the tail
      currentPlayerOffset = currentPlayerIndex + 1;
      result = players
        .slice(currentPlayerOffset)
        .concat(players.slice(0, currentPlayerOffset));
      // return all but the focused user
      return result.slice(0, -1);
    },
    getActionLabel(player: PublicPlayerModel): string {
      if (this.player.game.phase === Phase.DRAFTING) {
        if (player.needsToDraft) {
          return ActionLabel.DRAFTING;
        } else {
          return ActionLabel.NONE;
        }
      } else if (this.player.game.phase === Phase.RESEARCH) {
        if (player.needsToResearch) {
          return ActionLabel.RESEARCHING;
        } else {
          return ActionLabel.NONE;
        }
      }
      if (this.player.game.passedPlayers.includes(player.color)) {
        return ActionLabel.PASSED;
      }
      if (player.isActive) return ActionLabel.ACTIVE;
      const notPassedPlayers = this.player.players.filter(
        (p: PublicPlayerModel) => !this.player.game.passedPlayers.includes(p.color),
      );

      const currentPlayerIndex: number = getCurrentPlayerIndex(
        player.color,
        notPassedPlayers,
      );
      const prevPlayerIndex =
                currentPlayerIndex === 0 ?
                  notPassedPlayers.length - 1 :
                  currentPlayerIndex - 1;
      const isNext = notPassedPlayers[prevPlayerIndex].isActive;

      if (isNext && this.player.players.length > SHOW_NEXT_LABEL_MIN) {
        return ActionLabel.NEXT;
      }

      return ActionLabel.NONE;
    },
  },
});
</script>

<template>
        <div class="players-overview" v-if="hasPlayers()">
            <overview-settings />
            <div class="other_player" v-if="player.players.length > 1">
                <div v-for="(otherPlayer, index) in getPlayersInOrder()" :key="otherPlayer.id">
                    <other-player v-if="otherPlayer.id !== player.id" :player="otherPlayer" :playerIndex="index"/>
                </div>
            </div>
            <player-info v-for="(p, index) in getPlayersInOrder()"
              :player="p"
              :key="p.id"
              :playerView="player"
              :firstForGen="getIsFirstForGen(p)"
              :actionLabel="getActionLabel(p)"
              :playerIndex="index"/>
            <div v-if="player.players.length > 1" class="player-divider" />
            <player-info
              :player="getPlayerOnFocus()"
              :key="player.id"
              :playerView="player"
              :firstForGen="getIsFirstForGen(player.thisPlayer)"
              :actionLabel="getActionLabel(player.thisPlayer)"
              :playerIndex="-1"/>
        </div>
</template>
