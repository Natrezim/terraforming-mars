<template>
  <button v-on:click.prevent="onClick" :class="getOuterClass()" :disabled="getDisabled()" v-i18n>
    <span v-if="getInnerClass() !== ''" :class="getInnerClass()"></span>
    <span v-else>{{this.title}}</span>
  </button>
</template>

<script lang="ts">

import Vue from 'vue';

export default Vue.extend({
  name: 'Button',
  props: {
    title: {
      type: String,
      required: false,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    align: {
      type: String,
      validator: (align) => ['right', 'left', 'center'].includes(align),
      required: false,
      default: 'center',
    },
    size: {
      type: String,
      default: 'normal',
      validator: (item) =>
        ['tiny', 'small', 'normal', 'big', 'jumbo'].includes(item),
    },
    disableOnServerBusy: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: 'normal',
      validator: (item) =>
        [
          'normal',
          'action',
          'max',
          'success',
          'error',
          'submit',
          'close',
          'back',
          'minus',
          'plus',
        ].includes(item),
    },
    onClick: {
      type: Function,
      default: () => {},
    },
  },
  methods: {
    getOuterClass(): string {
      const classes: Array<string> = ['btn'];

      // size
      if (this.size === 'tiny') {
        classes.push('btn-tiny');
      } else if (this.size === 'small') {
        classes.push('btn-sm');
      } else if (this.size === 'big') {
        classes.push('btn-lg');
      }
      // type
      if (this.type === 'max') {
        classes.push('btn-max'); // #TODO max_button?
      } else if (this.type === 'plus') {
        classes.push('btn-plus');
      } else if (this.type === 'minus') {
        classes.push('btn-minus');
      } else if (this.type === 'success') {
        classes.push('btn-success');
      } else if (this.type === 'error') {
        classes.push('btn-error'); // #TODO this is never red since .btn is always on top, needs discussion
      } else if (this.type === 'action') {
        classes.push('btn-action');
      } else if (this.type === 'submit') {
        classes.push('btn-submit');
      }

      // align
      if (this.align === 'left') {
        classes.push('float-left');
      } else if (this.align === 'right') {
        classes.push('float-right');
      }

      // disabled
      if (this.disableOnServerBusy) {
        if ((this.$root as any).isServerSideRequestInProgress) {
          classes.push('loading');
        }
      }

      return classes.join(' ');
    },
    getDisabled(): boolean {
      if (this.disableOnServerBusy) {
        return (
          this.disabled ||
                    (this.$root as any).isServerSideRequestInProgress
        );
      }
      return this.disabled;
    },
    getInnerClass(): string {
      switch (this.type) {
      case 'close':
        return 'icon icon-cross';
      case 'back':
        return 'icon icon-back';
      case 'plus':
        return 'icon icon-plus';
      case 'minus':
        return 'icon icon-minus';
      }
      return '';
    },
  },
});

</script>

