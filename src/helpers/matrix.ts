import ConfigService from '@/services/config';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Callback, IUploadOpts, MatrixEvent, Room } from 'matrix-js-sdk';
import { IImageInfo } from 'matrix-js-sdk/lib/@types/partials';
import { GetClient, Login, MatrixService, StartClient } from './../services/matrix';
import { PrepareSync } from './../services/sync';
// import defaultAvatar from '

export const IsMyMessage = (item: MatrixEvent) => {
    return item.getSender() === MatrixService.getUserId();
}

export const GetSenderAvatar = (item: MatrixEvent) => {
    if(!item) {
        return ConfigService.defaultAvatar;
    }
    return item.sender.getAvatarUrl(ConfigService.MatrixUrl, 50, 50, 'scale', true, false) || ConfigService.defaultAvatar;
}

export const GetRoomAvatar = (room: Room) => {
    if(!room) {
        return ConfigService.defaultAvatar;
    }
    let roomAvatar = room.getAvatarUrl(ConfigService.MatrixUrl, 100, 100, 'scale', true);
    if(!roomAvatar && room.getJoinedMemberCount() === 2) {
        roomAvatar = room.getAvatarFallbackMember().getAvatarUrl(ConfigService.MatrixUrl, 100, 100, 'scale', true, false);
    }
    return roomAvatar  || ConfigService.defaultAvatar;
}

export const GetEventTime = (item: MatrixEvent) => {
    const _date = item.getDate()!;
    return `${_date.getHours()}:${_date.getMinutes() > 9 ? _date.getMinutes() : '0'+_date.getMinutes()}`;
}

export const SendMessage = (roomId: string, body: string, callBack?: Callback) => {
    const txnId = GetClient().makeTxnId();
    GetClient().sendTextMessage(roomId, body, txnId, callBack);
} 

export const UploadContent = (file: File, opts?: IUploadOpts) => {
    return GetClient().uploadContent(file, opts)
}

export const SendImage = (roomId: string, mxUrl: string, info?: IImageInfo, text?: string, callback?: Callback) => {
    GetClient().sendImageMessage(roomId, mxUrl, info, text, callback)
}

export const SignIn = (username: string, password: string) => {
    return Login(username, password).then(async () => {
        await StartClient();
        await PrepareSync();
        LocalNotifications.checkPermissions().then((permissionStatus) => {
          if(!permissionStatus.display) {
            LocalNotifications.requestPermissions();
          }
        }).catch(() => LocalNotifications.requestPermissions())
    });
}

/**
 * Load previous messages for a room and add it to the room timeline
 * @param roomId 
 * @param limit - defaults to 40
 * @returns false if there are no more events to load, else true
 */
export const LoadPreviousMessages = async (roomId: string, limit = 40) => {
    const _room = GetClient().getRoom(roomId);
    const stillHasEvents = await GetClient().paginateEventTimeline(_room.getLiveTimeline(), { limit, backwards: true });
    if (stillHasEvents) {
        await _room.decryptAllEvents();
    }
    return !!stillHasEvents;
}

export enum EventFilterType {
    Chat
}

export const IsAcceptedEventType = (event: MatrixEvent, eventFilterType: EventFilterType) => {
    let isAccepted = false
    switch(eventFilterType) {
        case EventFilterType.Chat:
            isAccepted = event.getType() === 'm.room.message' && ['m.image', 'm.text'].includes(event.getContent().msgtype || '')
            break;
        default:
            isAccepted = false;
            break;
    }
    return isAccepted;
}