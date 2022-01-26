<template>
  <ion-page class="ion-page">
    <ion-header collapse="condense" class="space-between padding-15 ion-header">
        <ion-label >Ionic Matrix Skeleton</ion-label>
        <ion-icon class="default-icon-size" :icon="menu"></ion-icon>
    </ion-header>
    <ion-searchbar debounce="500"></ion-searchbar>
    <ion-content class="ion-content">
      <ion-list>
        <RecycleScroller
          class="scroller"
          :items="rooms"
          :item-size="80"
          :min-item-size="80"
        >
          <template #default="{ item }">
            <ion-item class="room-item" @click="goToRoom(item.room)">
              <ion-avatar slot="start">
                <ion-img :src="GetRoomAvatar(item.room)" />
              </ion-avatar>
              <ion-label>{{ item.room.name }}</ion-label>
              
            </ion-item>
          </template>
        </RecycleScroller>
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
import { RecycleScroller } from 'vue-virtual-scroller';

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
    IonIcon,
    RecycleScroller
  },
  setup() {
    const rooms = ref(Array<VirtualRoomObjInterface>());
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
      
    return {
      rooms,
      menu,
      GetRoomAccountData,
      goToRoom,
      GetRoomAvatar
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