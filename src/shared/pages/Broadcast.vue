<template>
    <video
        ref="video"
        class="absolute left-0 top-0 w-full h-full object-cover"
        playsinline
        autoplay>
    </video>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue';

import useSocket from '@client/socket';

const video: Ref<HTMLVideoElement> = ref();

const peerConnections = {};

const config = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302'],
        },
    ],
};

onMounted(async () => {
    const socket = useSocket();

    socket.on('watcher', id => {
        console.log(`[Client] New peer ${id}`);

        const peerConnection = new RTCPeerConnection(config);
        peerConnections[id] = peerConnection;

        const stream: MediaStream = video.value.srcObject as MediaStream;
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('candidate', id, event.candidate);
            }
        };

        peerConnection
            .createOffer()
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                console.log('offering...');
                socket.emit('offer', id, peerConnection.localDescription);
            });
    });

    socket.on('answer', (id, description) => {
        console.log(`[Client] Answer ${id}`);

        peerConnections[id].setRemoteDescription(description);
    });

    socket.on('candidate', (id, candidate) => {
        console.log(`[Client] Candidate ${id}`);

        peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('disconnectPeer', id => {
        console.log(`[Client] Disconnect ${id}`);

        peerConnections[id].close();
        delete peerConnections[id];
    });

    try {
        video.value.srcObject = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
        });

        socket.emit('broadcaster');
    } catch (error) {
        console.error(error);
    }
});
</script>
