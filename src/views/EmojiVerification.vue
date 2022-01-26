<template>
  <ion-page>
    <ion-header collapse="condense" class="space-between padding-15">
        <ion-label class="bold-max">Verify other login</ion-label>
    </ion-header>
    <ion-content class="ion-padding bold-500">
      <ion-text>Confirm the emoji below are displayed on both sessions, in the same order:</ion-text>
      <div class="emoji-wrapper">
        <ion-item  lines="none" class="emoji-item" v-for="(item,index) in this.list" :key="index">
          <div class="item-content">
            <ion-label class="emoji">{{ item.emoji }}</ion-label>
            <ion-label>{{ item.label }}</ion-label>
          </div>
        </ion-item>
      </div>
      <div class="confirm-area">
        <ion-button color="danger" @click="submitMatch(false)">They don't match</ion-button>
        <ion-button color="success" @click="submitMatch(true)">They match</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import router from '@/router';
import { CryptoService } from '@/services/crypto';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonPage, IonText } from '@ionic/vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonItem,
    IonText,
    IonLabel,
    IonPage,
    IonHeader,
    IonButton
  },
  setup() {
    const list = ref(new Array<{emoji: string; label: string}>());
    
    return {
      list
    }
  },
  async created() {
    const verification = await CryptoService.verificationChallengeObj.then((verification) => verification);
    
    if(!verification || !verification.challenge.length) {
      router.push('/home');
      return;
    }
    
    const emojis = verification.challenge.map((emoji) => {
      return {
        emoji: emoji[0],
        label: emoji[1]
      }
    });
    
    this.list = emojis;
  },
  methods: {
    async submitMatch(emojisMatch: boolean) {
      const verification = await CryptoService.verificationChallengeObj.then((verification) => verification);
      verification?.handleResult(emojisMatch);
      router.push('/home');

    },


  }
});
</script>

<style scoped>
  .emoji-wrapper, .confirm-area {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
  }

  .confirm-area {
    justify-content: space-around;
  }

  .emoji-item {
    min-width: 120px;
    max-width: 120px;
    height: 85px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .emoji {
    font-size: 30px;
  }
</style>