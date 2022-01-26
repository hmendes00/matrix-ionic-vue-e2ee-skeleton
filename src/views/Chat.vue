<template>
  <ion-page class="ion-page">
    <ion-header collapse="condense" class="ion-header space-between padding-15">
        <div class="avatar-wrapper">
          <ion-icon @click="back" class="back-button" :icon="arrowBack"></ion-icon>
          <ion-avatar class="room-avatar">
            <ion-img :src="GetRoomAvatar(room)"></ion-img>
          </ion-avatar>
          <ion-label v-if="room" class="room-name">{{ room.name }}</ion-label>
          <ion-label v-else class="room-name">------</ion-label>
        </div>
        <ion-icon class="default-icon-size" :icon="ellipsisVertical"></ion-icon>
    </ion-header>
    <ion-content :class="{'no-scroll': isLoadingMore }" class="chat-conversation-wrapper" :scroll-events="true" @ionScrollEnd="scrolledToTop" @ionScroll="trackScroll">
      <ion-spinner class="chat-spinner" name="crescent" v-if="!isReady"></ion-spinner>
      <div class="chat-conversation" :class="{'no-scroll': isLoadingMore }" v-show="isReady">
        <ion-item class="message-item" v-for="(item,index) of roomEvents" :key="index" lines="none">
          <div class="message-wrapper" :class="{'my-message': IsMyMessage(item)}">
            <ion-avatar class="user-avatar" v-if="!IsMyMessage(item)">
              <ion-img :src="GetSenderAvatar(item)"></ion-img>
            </ion-avatar>
            <div class="balloon-wrapper">
              <div class="message-balloon" :class="{'my-balloon': IsMyMessage(item)}">
                <ion-text v-if="item.getContent().msgtype === 'm.text'">{{ item.getContent().body }}</ion-text>
                <inp-image @click="openModal(item)" v-if="item.getContent().msgtype === 'm.image'" :mxUrl="item.getContent().url ? item.getContent().url : item.getContent().file.url" :file="item.getContent().file" class="is-image" />
              </div>
              <ion-label class="message-time" v-if="!sameTimeAndSender(item, index)">{{GetEventTime(item)}}</ion-label>
            </div>
          </div>
        </ion-item>
      </div>
    </ion-content>
    <ion-footer class="padding-15 send-area">
      <ion-icon class="attach-icon default-icon-size" :icon="attach" @click="fileChooser"></ion-icon>
      <ion-input id="message-input" v-bind:value="textModel" @change="changeText" class="send-message input"></ion-input>
      <ion-icon class="send-icon" :icon="paperPlane" @click="sendMessage"></ion-icon>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { OpenImagePicker } from '@/helpers/attachments';
import { EventFilterType, GetEventTime, GetRoomAvatar, GetSenderAvatar, IsAcceptedEventType, IsMyMessage, LoadPreviousMessages, SendImage, SendMessage, UploadContent } from '@/helpers/matrix';
import router from '@/router';
import { LoggerService } from '@/services/logger';
import { GetClient, MatrixService } from '@/services/matrix';
import { SyncService } from '@/services/sync';
import { ActiveItemsStore } from '@/store/active';
import { IonAvatar, IonContent, IonFooter, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonPage, IonSpinner, IonText, modalController } from '@ionic/vue';
import axios from 'axios';
import { arrowBack, attach, ellipsisVertical, paperPlane } from 'ionicons/icons';
import { MatrixEvent, Room } from 'matrix-js-sdk';
import { defineComponent, onUnmounted, onUpdated, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import InpImage from '../components/Image.vue';
import ModalImage from '../components/ModalImage.vue';


export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonItem,
    IonLabel,
    IonPage,
    IonHeader,
    IonIcon,
    InpImage,
    IonText,
    IonInput,
    IonFooter,
    IonImg,
    IonAvatar,
    IonSpinner
  },
  setup() {
    const isReady = ref(false);
    let isFirstScroll = true;
    let lastScrollTop = -1;
    const isLoadingMore = ref(false);
    let shouldLoadMore = false;
    SyncService.shouldUpdateClient.value = false;

    const getContent = () => document.querySelector('.chat-conversation');

    const scrollToBottom = () => {
      setTimeout(() => {
        getContent()?.scrollIntoView({behavior: isFirstScroll ? 'auto' : 'smooth', block: 'end', inline: 'nearest'});
        isFirstScroll = false;
      }, 250)
    }

    const trackScroll = (e) => {
      lastScrollTop = e.detail.scrollTop;
    }
    
    const room: Ref<Room|null> = ref(null);
    const roomEvents: Ref<MatrixEvent[]> = ref([]);
    let previousHeight = 0;
    let stillHasEvents = true;

    const scrolledToTop = async (e) => {
      if(!room.value) {
        return;
      }
      if(lastScrollTop === 0 && stillHasEvents) {
        previousHeight = getContent()!.clientHeight;
        stillHasEvents = await LoadPreviousMessages(room.value!.roomId);
        shouldLoadMore = stillHasEvents;
      }
    }
    watch(room, async () => {
      if(room.value) {
       await LoadPreviousMessages(room.value.roomId);
       isReady.value = true; // ready only all events have been decrypted
      }
    })

    watch(SyncService.shouldUpdateClient, (shouldUpdateClient) => {
      if(shouldUpdateClient) {
        if(shouldLoadMore) {
          isLoadingMore.value = true;
        }
        console.log('loading items');
        roomEvents.value =  room.value?.timeline.filter((event) => IsAcceptedEventType(event, EventFilterType.Chat)) || [];
        console.log('events', roomEvents.value);
        SyncService.shouldUpdateClient.value = false;
        if(!isLoadingMore.value) {
          scrollToBottom();
        } else {
          setTimeout(() => {
            (document.querySelector('.chat-conversation-wrapper') as any).scrollToPoint(0, getContent()!.clientHeight - previousHeight);
          }, 0);
          shouldLoadMore = false;
          isLoadingMore.value = false;
        }
      }
    })

    const sameTimeAndSender = (event: MatrixEvent, index: number) => {
      const nextEvent = roomEvents.value[index + 1];
      if(!nextEvent) {
        return false;
      }

      if(event.getSender() !== nextEvent.getSender()) {
        return false;
      }

      if(event.getDate()?.toDateString() !== nextEvent.getDate()?.toDateString()) {
        return false;
      }
      
      if(Math.abs(event.getTs() - nextEvent.getTs()) > 50000) {
        return false;
      }

      return true;
    }

    const openModal = async (event) => {
      const modal = await modalController.create({
        component: ModalImage, //Modal is name of the component to render inside ionic modal
        componentProps: {
          event
        }
      });
      return modal.present();
    };

    let textModel = '';

    const fileChooser = () => {
      OpenImagePicker().then(async (image) => {
        if(!image || !image.webPath) {
          LoggerService.error('Could not upload image this time. Path returned is empty');
          return;
        }
        const imageResponse = await axios.get(image.webPath, { responseType: 'arraybuffer' });
        const imageType = imageResponse.headers['content-type'];
        try {
          if(!room.value) {
            return;
          }
          const uploadResponse = await UploadContent(imageResponse.data, {
            rawResponse: false,
            type: imageType,
            onlyContentUri: false
          });

          const mxUrl = uploadResponse.content_uri;

          SendImage(room.value.roomId, mxUrl, { mimetype: image.format }, textModel || 'Check this out');
        } catch (error) {
          LoggerService.error('Could not send image this time.', error);
        }
      })
    };

    const back = () => {
      router.push('/home');
    }

    const sendMessage = () => {
      if(!room.value) {
        return;
      }

      SendMessage(room.value.roomId, textModel);

      const el = (document.getElementById('message-input') as any);
      el.value = '';
      el.setFocus()
    }

    const changeText = (e: any) => {
      if(!e.target) {
        return;
      }

      textModel = e.target.value;
    }

    const updateChatRoom = () => {
      
      const route = useRoute();
      const { roomId } = route.params;
      if(!ActiveItemsStore.room.value) {
        watch(MatrixService.firstSyncDone, (isSynced) => {
          if(isSynced) {
            ActiveItemsStore.room.value = GetClient().getRoom(roomId as string);
            room.value = ActiveItemsStore.room.value;
            SyncService.shouldUpdateClient.value = true;
          }
        })
      } else if (ActiveItemsStore.room.value.roomId === roomId && !room.value){
        room.value = ActiveItemsStore.room.value;
        SyncService.shouldUpdateClient.value = true;
      } else if (ActiveItemsStore.room.value.roomId !== roomId) { //switching rooms
        room.value = GetClient().getRoom(roomId as string);
        SyncService.shouldUpdateClient.value = true;
      }
    }

    onUpdated(() => updateChatRoom());
    onUnmounted(() => {
      console.log('unmounted')
      isReady.value = false;
      roomEvents.value = [];
      SyncService.shouldUpdateClient.value = false;
    })
    
    return {
      roomEvents,
      ellipsisVertical,
      paperPlane,
      room,
      arrowBack,
      back,
      IsMyMessage,
      GetSenderAvatar,
      GetRoomAvatar,
      GetEventTime,
      sameTimeAndSender,
      openModal,
      isReady,
      textModel,
      sendMessage,
      changeText,
      attach,
      fileChooser,
      scrolledToTop,
      trackScroll,
      isLoadingMore
    }
  }
});
</script>

<style scoped lang="scss">
.avatar-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-avatar, .user-avatar {
  width: 36px;
  height: 36px;
}

.room-name {
  margin-left: 5px;
}
.is-image {
    width: 200px;
    height: 200px;
    object-fit: contain;
    object-position: center;
}

.send-message {
  width: 90%
}

.ion-header {
  background: white;
}

.send-area {
  display: flex;
  justify-content: center;
  align-items: center;
}

.send-icon {
  margin-left: 10px;
  width: 20px;
  height: 20px;
}

.attach-icon {
  margin-right: 10px;
}

.chat-conversation {
  min-height: 100%;
  overflow-y: auto;
}

.chat-conversation-wrapper {
  --background: none;
  background: url(/assets/default-background.png) no-repeat center center / cover;

  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;  
  scrollbar-width: none;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }

  .chat-spinner {
    position: fixed;
    top: 50%;
    left: 50%;
    /* bring your own prefixes */
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
  }

}

.message-item {
  --background: none;
  --padding-start: 0;
  --padding-end: 0;
}

.message-wrapper {
  display: flex;
  width: 100%;
  padding: 5px 5px 5px 15px;
}

.my-message {
  justify-content: flex-end;
}

.no-scroll {
  overflow: hidden;
  --overflow: hidden;
}

.message-balloon {
  background: white;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 0px 8px 0px #ddd;
}

.my-balloon {
  background: #333;
  color: white;
}

.user-avatar {
  margin-right: 10px;
}

.message-time {
  font-size: 12px;
  text-align: right;
  margin: 2px;
  color: #666;
}

</style>