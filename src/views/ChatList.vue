<template>
  <ion-page class="ion-page">
    <ion-header collapse="condense" class="space-between padding-15 ion-header">
        <ion-label >Ionic Matrix Skeleton</ion-label>
        <ion-icon class="default-icon-size" :icon="menu"></ion-icon>
    </ion-header>
    <ion-searchbar debounce="500" @input="search"></ion-searchbar>
    <ion-content class="ion-content" @vnode-updated="updated">
      <ion-spinner class="center-spinner" name="crescent" v-if="loadingRooms || !uiRendered"></ion-spinner>
      <ion-list>
        <ion-item v-for="room of rooms" class="room-item" :key="room.roomId" @click="goToRoom(room)">
          <ion-avatar slot="start">
            <ion-img :src="GetRoomAvatar(room)" />
          </ion-avatar>
          <ion-label class="room-name">{{ room.name }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { GetRoomAvatar } from '@/helpers/matrix';
import router from '@/router';
import { GetRoomAccountData, GetRooms, MatrixService } from '@/services/matrix';
import { ActiveItemsStore } from '@/store/active';
import { IonAvatar, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonSearchbar } from '@ionic/vue';
import { menu } from 'ionicons/icons';
import { Room } from 'matrix-js-sdk';
import { defineComponent, nextTick, ref, watch } from 'vue';

export default defineComponent({
  name: 'Home',
  components: {
    IonImg,
    IonContent,
    IonItem,
    IonLabel,
    IonAvatar,
    IonList,
    IonPage,
    IonHeader,
    IonSearchbar,
    IonIcon
  },
  setup() {
    const rooms = ref(Array<Room>());
    const loadingRooms = ref(true);
    const uiRendered = ref(false);

    const updated = () => {
      if(!loadingRooms.value) {
        nextTick(() => {
          uiRendered.value = true;
        });
      }
    };
    
    if(MatrixService.firstSyncDone.value) {
      rooms.value = GetRooms();
      loadingRooms.value = false;
    } else {
      watch(MatrixService.firstSyncDone, (isSynced) => {
        if(isSynced) {
          rooms.value = GetRooms();
          loadingRooms.value = false;
        }
      });
    }

    const goToRoom = (room: Room) => {
      ActiveItemsStore.room.value = room;
      router.push(`/chat/${ActiveItemsStore.room.value.roomId}`);
    };

    const search = (event: any) => {
      const items = document.querySelectorAll('ion-item');
      requestAnimationFrame(() => {
        items.forEach((item) => {
          const shouldShow = (item.querySelector('.room-name')?.textContent || '').toLowerCase().includes(event.target.value);
          item.style.display = shouldShow ? 'block' : 'none';
        });
      });
    }
      
    return {
      rooms,
      menu,
      GetRoomAccountData,
      goToRoom,
      GetRoomAvatar,
      search,
      loadingRooms,
      uiRendered,
      updated
    }
  }
});
</script>

<style scoped lang="scss">
#container {
  padding: 15px;
}

.ion-content {
  background: white;

  .room-item {
    height: 80px;
  }
}
</style>