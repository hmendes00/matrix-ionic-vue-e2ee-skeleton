<template>
  <ion-page class="ion-page">
    <ion-header collapse="condense" class="space-between padding-15 ion-header">
        <ion-label >Ionic Matrix Skeleton</ion-label>
        <ion-icon class="default-icon-size" :icon="menu"></ion-icon>
    </ion-header>
    <ion-searchbar debounce="500" @input="search"></ion-searchbar>
    <ion-content class="ion-content">
      <ion-list>
        <ion-item v-for="item of rooms" class="room-item" :key="item.room.roomId" @click="goToRoom(item.room)">
          <ion-avatar slot="start">
            <ion-img :src="GetRoomAvatar(item.room)" />
          </ion-avatar>
          <ion-label class="room-name">{{ item.room.name }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { GetRoomAvatar } from '@/helpers/matrix';
import router from '@/router';
import { GetRoomAccountData, GetVirtualRooms, MatrixService, VirtualRoomObjInterface } from '@/services/matrix';
import { ActiveItemsStore } from '@/store/active';
import { IonAvatar, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonSearchbar } from '@ionic/vue';
import { menu } from 'ionicons/icons';
import { Room } from 'matrix-js-sdk';
import { defineComponent, ref, watch } from 'vue';

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
    const rooms = ref(Array<VirtualRoomObjInterface>());
    const searchedRooms = ref('');
    if(MatrixService.firstSyncDone.value) {
      rooms.value = GetVirtualRooms();
    } else {
      watch(MatrixService.firstSyncDone, (isSynced) => {
        if(isSynced) {
          rooms.value = GetVirtualRooms();
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
      searchedRooms
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