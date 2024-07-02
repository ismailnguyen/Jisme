<template>
  <div class="row">
    <div class="accordion">
      <div
      class="accordion-item"
      v-for="(activity, i) in sortedActivities"
      :key="i">
        <h2 class="accordion-header ">
          <button
            class="accordion-button"
            :class="activity.isExpanded ? '' : 'collapsed'"
            @click="activity.isExpanded = !!activity.isExpanded ? !activity.isExpanded : true"
            type="button">
            <div>
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">{{ capitalizeFirstLetter(activity.action) }}</h5>
                <small>{{ toDaysAgo(activity.activity_date) }}</small>
              </div>
              <p class="mb-1">{{ activity.location }}</p>
              <p class="mb-1"><small>{{ extractClient(activity.agent) }}</small></p>
            </div>
          </button>
        </h2>
        <div class="accordion-collapse" :class="!!activity.isExpanded ? 'show' : 'collapse'">
          <div class="accordion-body">
              <small>{{ activity.ip }} ({{ activity.referer }})</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import parser from "ua-parser-js";

import { mapState } from "pinia";
import { useUserStore } from "@/store";

export default {
  computed: {
    ...mapState(useUserStore, ['user']),
    sortedActivities() {
      return (
        this.user &&
        this.user.activities &&
        this.user.activities.sort(
          (a, b) => new Date(b.activity_date) - new Date(a.activity_date)
        )
      );
    },
  },
  methods: {
    capitalizeFirstLetter(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    },

    toDaysAgo: function (dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return "Today";
      }

      if (days === 1) {
        return "Yesterday";
      }

      return days + " days ago";
    },

    extractClient: function (agent) {
      if (!agent) {
        return "Unknown";
      }
      const parsedAgent = parser(agent);

      const browser = parsedAgent.browser.name;
      const device = parsedAgent.device;

      return `${browser.charAt(0).toUpperCase()}${browser.slice(1)} ${
        parsedAgent.os.name
      } (${device.vendor} ${device.model})`;
    },
  },
};
</script>
