<script setup>
    // can't be used directly on the template
    const app_name = __APP_NAME__
    const version = __APP_VERSION__
</script>

<template>
  <div class="row">
    <Loader v-show="isLoading" />

    <div class="accordion">
      <div class="accordion-item accordion-item--without-body">
        <h2 class="accordion-header ">
          <button
            class="accordion-button"
            type="button">
            <div>
              <div class="fw-medium">
                <i class="fa fa-info" aria-hidden="true"></i>
                App name
              </div>
              <span class="fw-lighter">
                {{ app_name }}
              </span>
            </div>
          </button>
        </h2>
      </div>

      <div class="accordion-item accordion-item--without-body">
        <h2 class="accordion-header ">
          <button
            class="accordion-button"
            type="button">
            <div>
              <div class="fw-medium">
                <i class="fa fa-hashtag" aria-hidden="true"></i>
                Version
              </div>
              <span class="fw-lighter">
                v. {{ version }}
              </span>
            </div>
          </button>
        </h2>
      </div>

      <div class="accordion-item accordion-item--without-body">
        <h2 class="accordion-header ">
          <button
            class="accordion-button"
            type="button">
            <div>
              <div class="fw-medium">
                <i class="fa fa-code" aria-hidden="true"></i>
                Source code
              </div>
              <span class="fw-lighter">
                github.com/jisme
              </span>
            </div>
          </button>
        </h2>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useUiStore, useAlertStore, useUserStore } from "@/store";
import Loader from "../Loader.vue";

export default {
  components: {
    Loader,
  },
  data() {
    return {
      isLoading: false,
      fieldAttrs: {
        username: {
          isExpanded: false,
        },
        avatar: {
          isExpanded: false,
        }
      },
    };
  },
  computed: {
    ...mapState(useUserStore, ["user"]),
    ...mapState(useUiStore, ["SIDEBAR"]),
  },
  methods: {
    ...mapActions(useUserStore, ["update"]),

    ...mapActions(useAlertStore, ["openAlert"]),

    ...mapActions(useUiStore, ["closeSidebar"]),

    onSave: async function () {
      this.isLoading = true;

      try {
        await this.update();

        this.isLoading = false;
        this.openAlert("Saved!", "", "success");
      } catch (error) {
        this.isLoading = false;
      }
    },
  },
};
</script>
