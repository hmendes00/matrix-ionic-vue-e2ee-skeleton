import { IonicVue } from '@ionic/vue';
/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/float-elements.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/typography.css';
import Olm from 'olm';
import { createApp } from 'vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import App from './App.vue';
import router from './router';
import { SetupMatrixBasics } from './services/matrix';
/* Theme variables */
import './theme/variables.css';
global.Olm = Olm;


SetupMatrixBasics();

const app = createApp(App)
  .use(IonicVue)
  .use(router);
  
router.isReady().then(() => {
  app.mount('#app');
});