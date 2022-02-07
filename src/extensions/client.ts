/* eslint-disable prefer-rest-params */
import { MemoryStore, Room } from 'matrix-js-sdk/src';
import { MatrixClient } from 'matrix-js-sdk/src/client';
import { extension } from './util';

const handler = function () {
    return  {
        get: function(target, prop) {
            const val = target[prop];
            console.log('proxy getting', target, prop);
            if (typeof val === 'function') {
                if (['push', 'unshift'].includes(prop)) {
                    return function (el) {
                        console.log('this is a array modification');
                        return Array.prototype[prop].apply(target, arguments);
                    }
                }
                if (['pop'].includes(prop)) {
                    return function () {
                    const el = Array.prototype[prop].apply(target, arguments);
                    console.log('this is a array modification');
                    return el;
                    }
                }
                return val.bind(target);
            }
            return val;
        },
        set: function(target, prop) {
            const val = target[prop];
            console.log('proxy setting', target, prop);
            if (typeof val === 'function') {
                if (['push', 'unshift'].includes(prop)) {
                    return function (el) {
                    console.log('this is a array modification');
                    return Array.prototype[prop].apply(target, arguments);
                    }
                }
                if (['pop'].includes(prop)) {
                    return function () {
                    const el = Array.prototype[prop].apply(target, arguments);
                    console.log('this is a array modification');
                    return el;
                    }
                }
                return val.bind(target);
            }
        }
    }
}

export class IStoreExtension {
    private static reactiveRooms: Record<string, Room>;
    @extension(MemoryStore)
    static getReactiveRooms(thisArg: MemoryStore) {
        this.reactiveRooms = new Proxy(this.reactiveRooms, handler());
        return this.reactiveRooms;
        
    }

    static storeRoom(thisArg: MemoryStore, room: Room) {
        console.log('storing rooms')
        thisArg.storeRoom(room);
        this.reactiveRooms[room.roomId] = room;
    }
}

export class MatrixExtension {
    @extension(MatrixClient)
    static getReactiveRooms(thisArg: MatrixClient) {
        return thisArg.store.getReactiveRooms();
    }
}