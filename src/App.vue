<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent, watch } from 'vue';
import router from './router';
import { IsLoggedIn, MatrixService } from './services/matrix';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  setup() {
    watch(MatrixService.isBasicSetupDone, (isSetupDone) => {
      if(isSetupDone && !IsLoggedIn()) {
        router.push('/login');
      }
    })
  }
});
</script>

<style>
  .space-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .padding-15 {
    padding: 15px;
  }

  .ion-page {
    background: white
  }

  .ion-header {
    background: white;
    height: 66px;
    box-shadow: 0px 2px 6px 0px #ddd;
  }

  .default-icon-size {
    width: 25px;
    height: 25px;
  }

  .bold-max {
    font-weight: bold;
  }

  .bold-500 {
    font-weight: 500;
  }

  .back-button {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  .input {
    border: 1px solid #DDD;
    border-radius: 5px;
    --padding-start: 12px;
    --padding-end: 12px;
    text-align: left;
  }

  .margin-top-10 {
    margin-top: 10px;
  }
</style>