<template>
  <ion-page class="ion-page padding-15" v-if="!userId && !deviceId">
    <ion-content :fullscreen="true">
      <div id="container">
        <ion-label>Username:</ion-label>
        <ion-input class="input" v-bind:value="usernameInput" @change="changeUsername"></ion-input>
        <ion-label class="margin-top-10">Password:</ion-label>
        <ion-input class="input" v-bind:value="passwordInput" @change="changePassword"></ion-input>
        <div class="action-controls">
          <ion-button color="success" @click="login">Login</ion-button> or
          <ion-button color="primary" @click="signUp">Sign up</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { SignIn } from '@/helpers/matrix';
import router from '@/router';
import { LoggerService } from '@/services/logger';
import { GetClient, MatrixService } from '@/services/matrix';
import { IonButton, IonContent, IonInput, IonLabel, IonPage } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonInput,
    IonPage,
    IonLabel,
    IonButton
  },
  setup() {
    let usernameInput = '';
    let passwordInput = '';

    const userId = MatrixService.getUserId();
    const deviceId = MatrixService.getDeviceId();

    const changeUsername = (e) => {
      usernameInput = e.target.value;
    }

    const changePassword = (e) => {
      passwordInput = e.target.value;
    }

    const login = () => {
      SignIn(usernameInput, passwordInput).then(() => {
        router.push('/home');
      })
    }

    const signUp = async () => {
      try {
        const result = await GetClient().register(usernameInput, passwordInput, null, { type: 'm.login.password' })
        console.log('SIGNUP', result, result.data.session);
        if(result.session)  {
          await GetClient().register(usernameInput, passwordInput, result.data.session, { type: 'm.login.password', session: result.data.session })
        }
        
      } catch(error: any) {
        console.log(error.data.session);
        LoggerService.error('Could not sign up', error);
      }
    }

    return {
      login,
      signUp,
      usernameInput,
      passwordInput,
      changeUsername,
      changePassword,
      userId,
      deviceId
    };
  },
  async mounted() {
    if(this.userId && this.deviceId) {
       const cachedAccessToken = await MatrixService.getCachedAccessToken();
       if(cachedAccessToken) {
         // no need to pass username or password because it will login using cached accessToken
         SignIn('---', '---').then(() => {
           router.back();
         });
       }
    }
  }
});
</script>

<style scoped>
#container {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>