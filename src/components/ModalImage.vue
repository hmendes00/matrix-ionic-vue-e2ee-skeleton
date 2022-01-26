<template>
  <ion-header>
    <ion-toolbar>
      <ion-icon class="default-icon-size" @click="closeModal" :icon="close"></ion-icon>
      <ion-title>{{ event.getContent().body }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <inp-image v-if="event.getContent().msgtype === 'm.image'" :mxUrl="event.getContent().url ? event.getContent().url : event.getContent().file.url" :file="event.getContent().file" class="is-image" />
  </ion-content>
</template>

<script lang="ts">
    import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import { close } from 'ionicons/icons';
import { MatrixEvent } from 'matrix-js-sdk';
import { defineComponent } from "vue";
import InpImage from './Image.vue';

    export default defineComponent({
        name: "ModalImage",
        props: {
            event: {
                type: Object as () => MatrixEvent,
                required: true
            }
        },
        components: { IonContent, IonHeader, IonTitle, IonToolbar, InpImage, IonIcon },
        setup() {
            const closeModal = () => modalController.dismiss();

            return {
                close,
                closeModal
            }
        }
    });
</script>