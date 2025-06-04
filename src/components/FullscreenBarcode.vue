<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-90"
      style="z-index: 1055;"
      @click.self="close">

      <button
          type="button"
          class="btn-close position-absolute end-0 top-0 m-3"
          style="z-index: 1060;"
          aria-label="Close enlarged barcode"
          @click.stop="close"></button>

      <div
        class="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center justify-content-center"
        style="max-width: 95vw; max-height: 95vh;">
          
            <!-- QR -->
            <qrcode-vue
                v-if="format === 'QR'"
                :value="number"
                :size="qrSize" />

            <!-- Barcode -->
            <svg
                v-else
                ref="fullscreenBarcodeEl"
                :width="svgWidth"
                :height="svgHeight"></svg>
      </div>
    </div>
  </teleport>
</template>

<script>
import QrcodeVue from 'qrcode.vue'
import JsBarcode from 'jsbarcode'

export default {
  name: 'FullscreenBarcode',
  components: { QrcodeVue },
  emits: ['close'],

  props: {
    number:  { type: String, required: true },
    format:  { type: String, required: true },
    visible: { type: Boolean, default: false }
  },

  data () {
    /* simple responsive sizing */
    const vw = window.innerWidth
    const vh = window.innerHeight
    return {
      qrSize:  Math.min(vw, vh) * 0.85,  // square
      svgWidth: vw * 0.9,
      svgHeight: vh * 0.3
    }
  },

  watch: {
    /* whenever it becomes visible → render barcode after DOM patched */
    visible (now) {
      if (now) this.$nextTick(this.draw)
    }
  },

  updated () {
    /* Esc key closes */
    window.addEventListener('keydown', this.onKey)

    if (this.visible) this.draw()
  },

  beforeUnmount () {
    window.removeEventListener('keydown', this.onKey)
  },

  methods: {
    draw () {
      if (this.format === 'QR') return          // QR code handled by component
      const el = this.$refs.fullscreenBarcodeEl
      if (!el) return
      el.innerHTML = ''
      JsBarcode(el, this.number, {
            format: this.format,
            displayValue: true,
            margin: 0,
            flat: false
        })
    },
    
    close () {
        this.$emit('close')
    },
    onKey (e) { if (e.key === 'Escape') this.close() }
  }
}
</script>

<style scoped>
/* optional: stop overscroll on iOS */
:host {
  overscroll-behavior: contain;
}
</style>