<template>
    <video
        ref="video"
        class="absolute left-0 top-0 w-full h-full object-cover"
        playsinline
        autoplay>
    </video>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref, onBeforeUnmount } from 'vue';

import useSocket from '@client/socket';

const video: Ref<HTMLVideoElement> = ref();

let peerConnection;

const config = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302'],
        },
    ],
};

onMounted(() => {
    const socket = useSocket();

    socket.on('offer', (id, description) => {
        console.log(`[Client] Offer ${id}`);

        peerConnection = new RTCPeerConnection(config);
        peerConnection
            .setRemoteDescription(description)
            .then(() => peerConnection.createAnswer())
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                socket.emit('answer', id, peerConnection.localDescription);
            });
        peerConnection.ontrack = event => {
            video.value.srcObject = event.streams[0];
        };
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('candidate', id, event.candidate);
            }
        };
    });

    socket.on('candidate', (id, candidate) => {
        console.log(`[Client] Candidate ${id}`);

        peerConnection
            .addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.error(e));
    });

    socket.on('connect', () => {
        console.log(`[Client] Connected.`);

        socket.emit('watcher');
    });

    socket.on('broadcaster', () => {
        console.log(`[Client] Broadcaster?`);

        socket.emit('watcher');
    });
});

</script>
