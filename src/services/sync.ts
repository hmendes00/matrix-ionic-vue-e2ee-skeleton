import { LocalNotifications } from '@capacitor/local-notifications';
import { MatrixEvent, Room, RoomMember } from 'matrix-js-sdk';
import { ref, Ref } from 'vue';
import { GetSenderAvatar, IsMyMessage } from './../helpers/matrix';
import { LoggerService } from './logger';
import { GetClient, MatrixService } from './matrix';

let lastEventTrackerId: any = null;

interface SyncInterface {
    shouldDisplayNotification: boolean;
    shouldUpdateClient: Ref<boolean>;
}

export const SyncService: SyncInterface = {
    shouldDisplayNotification: false,
    shouldUpdateClient: ref(false)
}

const HandleMessage = (event: MatrixEvent) => {
    if(!event.getId()) {
        return;
    }

    if(lastEventTrackerId) {
        clearTimeout(lastEventTrackerId);
    }

    lastEventTrackerId = setTimeout(() => {
        SyncService.shouldUpdateClient.value = true;
        lastEventTrackerId = null;


        if(SyncService.shouldDisplayNotification && !IsMyMessage(event) && event.getType() === 'm.room.message') {
            const _room = GetClient().getRoom(event.getRoomId());
            const readUpToEventId = _room.getEventReadUpTo(GetClient().getUserId());
            if(readUpToEventId) {
                if(_room.findEventById(readUpToEventId)?.getTs() || 0 > event.getTs()) {
                    return;
                }
            }
            LocalNotifications.schedule({
                notifications: [
                    {
                        id: event.getTs(),
                        title: `@${event.sender.rawDisplayName}`,
                        body: event.getContent().msgtype === 'm.image' ? 'Sent you an image' : event.getContent().body,
                        smallIcon: GetSenderAvatar(event)
                    }
                ]
            });
            SyncService.shouldDisplayNotification = false;
        }
    }, 100);


}

const VerifyMembersDevices = async (room: Room) => {
    LoggerService.info('Verifying members device');
    const _client = GetClient();
    const e2eMembers = await room.getEncryptionTargetMembers();
    for (const member of e2eMembers) {
        const devices = _client.getStoredDevicesForUser(member.userId);
        for (const device of devices) {
            if(device.isUnverified()) {
                await _client.setDeviceKnown(member.userId, device.deviceId, true);
                await _client.setDeviceVerified(member.userId, device.deviceId, true);
            }
        }
        LoggerService.info('Members device verified');
    }
}

export const RoomTimelineListener = () => {
    const _client = GetClient();
    _client.removeListener('Room.timeline', RoomTimelineListener);
    _client.on("Room.timeline", (event: MatrixEvent, room: Room, toStartOfTimeline) => {
        if (event.isEncrypted()) {
            // handling in handleEventDecrypted
            SyncService.shouldDisplayNotification = true;
            return;
        }

        if(event.getType() === 'm.room.message') {
            HandleMessage(event);
        }
      
        LoggerService.debug('Room.timeline %o', event);
        
    });
}

// export const RoomMessageListener = () => {
//     const _client = GetClient();
//     _client.removeListener('room.message', RoomMessageListener);
//     _client.on("room.message", async (event: MatrixEvent, room: Room, toStartOfTimeline) => {
//         if (event.isEncrypted()) {
//           return;
//         }
//           // we know we only want to respond to messages
//           if (event.getType() !== "m.room.message") {
//           return;
//           } else {
//               console.log('ROOM MESSAGE');
//             HandleMessage(event);
//           }
//       });
    
// }

export const EventDecryptedListener = () => {
    const _client = GetClient();
    _client.removeListener('Event.decrypted', EventDecryptedListener);
    _client.on("Event.decrypted", async (event: MatrixEvent) => {
        console.log('Event decryption try of type %o',  event.getType())
        if (event.isDecryptionFailure()) {
            console.log("Decryption failure: ", event);
          return;
        }
        
        if (event.getType() === "m.room.message"){
            HandleMessage(event);
        }
    });
}

const RoomKeyRequestListener = () => {
    const _client = GetClient();
    _client.removeListener('crypto.roomKeyRequest', RoomKeyRequestListener);
    _client.on("crypto.roomKeyRequest", (event) => {
        console.log('requested key');
        event.share();
    });
}

const InviteUserToRoom = async (roomId: string, userId: string) => {
    await GetClient()
        .invite(roomId, userId)
        .then(() => {
            LoggerService.info('User was invited');
        })
        .catch((err) => {
            console.error("err", err);
        });

    await GetClient().sendSharedHistoryKeys(roomId, [userId]);
}

const JoinRoomListener = () => {
    const _client = GetClient();
    _client.removeListener('RoomMember.membership', JoinRoomListener);
    _client.on("RoomMember.membership", (event: MatrixEvent, member: RoomMember) => {
        if (member.membership === "invite" && member.userId === _client.getUserId()) {
            _client.joinRoom(member.roomId).then(function() {
                console.log("Auto-joined %s", member.roomId);
            });
        }
    });
}

const SetupEventBindings = () => {
    EventDecryptedListener();
    JoinRoomListener();
    // RoomMessageListener();
    RoomTimelineListener();
    RoomKeyRequestListener();
}

export const PrepareSync = () => {
    const _client = GetClient();
    _client.once('sync', async (state) => {
        switch (state) {
            case 'PREPARED':
                SetupEventBindings();
                await _client.uploadKeys();
                MatrixService.firstSyncDone.value = true;
                _client.removeListener('sync', PrepareSync);
                break;
            case 'ERROR':
                _client.removeListener('sync', PrepareSync);
                break;
        }
    });
}