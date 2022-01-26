<template>
    <ion-img :src="link" :alt="mxUrl"></ion-img>
</template>

<script lang="ts">
import { GetBlobSafeMimeType } from '@/helpers/blobs';
import ConfigService from '@/services/config';
import { IonImg } from '@ionic/vue';
import encrypt from 'browser-encrypt-attachment';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    components: {
        IonImg
    },
    props: {
        mxUrl: {
            type: String,
            default: ''
        },
        file: {
            type: Object,
            required: false
        }
    },
    setup(props) {
        const link = ref('');
        fetch(`${ConfigService.MatrixUrl}/_matrix/media/r0/download/${props.mxUrl.replace('mxc://', '')}`).then((response) => {
            return response.arrayBuffer();
        }).then((responseData) => props.file ? encrypt.decryptAttachment(responseData, props.file) : responseData).then((dataArray) => {
            // let mimetype = mimetype ? mimetype.split(";")[0].trim() : '';
            const mimetype = GetBlobSafeMimeType('');
            
            link.value = URL.createObjectURL(new Blob([dataArray], { type: mimetype }));
            
            // URL.revokeObjectURL(this.link);
        });
        return {
            link
        }
    }
})
</script>
