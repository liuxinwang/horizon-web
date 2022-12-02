<template>
  <div>
    <h4 :style="{ marginBottom: '10px' }">{{ title }}</h4>
    <v-chart :forceFit="true" :height="height" :data="data" :scale="scale">
      <v-tooltip />
      <v-axis />
      <v-legend />
      <v-smooth-line position="time*utilization" color="metric" shape="smooth" />
      <!-- <v-point position="time*utilization" color="metric" shape="circle" /> -->
    </v-chart>
  </div>
</template>

<script>

export default {
  name: 'SmoothLine',
  props: {
    title: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
    scale: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      height: 300
    }
  }
}
</script>
