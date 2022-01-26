<template>
  <ion-page>
    <ion-content>
      <ion-list>
        <RecycleScroller
          class="scroller"
          :items="list"
          :item-size="56"
        >
          <template #default="{ item }">
            <ion-item>
              <ion-avatar slot="start">
                <ion-img src="https://picsum.photos/seed/picsum/40/40" />
              </ion-avatar>
              <ion-label>{{ item }}</ion-label>
            </ion-item>
          </template>
        </RecycleScroller>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonAvatar, IonContent, IonImg, IonItem, IonLabel, IonList, IonPage } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
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
    RecycleScroller
  },
  setup() {
    const list = ref([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      
    return {
      list
    }
  }
});
</script>

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>