<template>
  <ion-page>
    <ion-tabs @ionTabsWillChange="beforeTabChange" @ionTabsDidChange="afterTabChange">
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="rooms" href="/rooms">
          <ion-icon :icon="chatbox"></ion-icon>
          <ion-label>Chat</ion-label>
          <ion-badge class="tabs-badge">6</ion-badge>
        </ion-tab-button>
        <ion-tab-button tab="rooms" href="/rooms">
          <ion-icon class="add-action-btn" @click="openMainActions" :icon="addCircle"></ion-icon>
        </ion-tab-button>
        <ion-tab-button tab="gallery" href="/gallery">
          <ion-icon :icon="image"></ion-icon>
          <ion-label>Gallery</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
      <ion-router-outlet></ion-router-outlet>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import { LoggerService } from '@/services/logger';
import { actionSheetController, IonBadge, IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { addCircle, chatbox, close, image, videocam } from 'ionicons/icons';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Home',
  components: {
    IonTabBar,
    IonTabButton,
    IonPage,
    IonLabel,
    IonTabs,
    IonIcon,
    IonBadge,
    IonRouterOutlet
  },
  setup() {
    const beforeTabChange = () => {
      // do something before tab change
    }
    const afterTabChange = () => {
      // do something after tab change
    }
    const openMainActions = async () => {
      const actionSheet = await actionSheetController
        .create({
          header: 'New',
          cssClass: 'my-custom-class',
          buttons: [
            {
              text: 'Chat',
              icon: chatbox,
              handler: () => {
                LoggerService.info('Chat clicked')
              },
            },
            {
              text: 'Clip',
              icon: videocam,
              handler: () => {
                LoggerService.info('Clip clicked')
              },
            },
            {
              text: 'Album',
              icon: image,
              handler: () => {
                LoggerService.info('Album clicked')
              },
            },
            {
              text: 'Cancel',
              icon: close,
              role: 'cancel',
              handler: () => {
                LoggerService.info('Cancel clicked')
              },
            },
          ],
        });
      await actionSheet.present();

      const { role } = await actionSheet.onDidDismiss();
      LoggerService.info('onDidDismiss resolved with role', role);
    }

    return {
      chatbox,
      image,
      addCircle,
      beforeTabChange,
      afterTabChange,
      openMainActions
    }
  }
});
</script>

<style scoped>
.tabs-badge {
  background-color: red;
}

.add-action-btn {
  width: 60px;
  height: 60px;
}
</style>