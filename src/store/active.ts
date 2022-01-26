import { Room } from 'matrix-js-sdk';
import { Ref, ref } from 'vue';

interface ActiveItemsInterface {
    room: Ref<Room|undefined>;
}

export const ActiveItemsStore: ActiveItemsInterface = {
    room: ref(undefined)
}