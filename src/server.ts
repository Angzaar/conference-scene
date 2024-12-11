import mitt from "mitt"
import { Room } from "colyseus.js"
import { connect } from "./helpers/connection"
import { addNewReservation, clearConference, handleUpdate, handleVideoUpdate, initConference, refreshConferenceCenter, removeReservation } from "./conference"
import { SERVER_MESSAGE_TYPES } from "./helpers/types"

export let serverRoom:string = "angzaar_plaza"
export let localUserId: string
export let localUser:any
export let data:any
export let colyseusRoom:Room

export let connected:boolean = false
export let sessionId:any
export const iwbEvents = mitt()

export function setLocalUserId(userData:any){
    localUserId = userData.userId
    localUser = userData    
    return userData
}

export async function joinServer(world?: any) {
    if (connected) {
        colyseusRoom.removeAllListeners()
        colyseusRoom.leave(true)
        connected = false
    }
    try{
        await colyseusConnect(localUser)
    }
    catch(e:any){
        console.log('error connecting to colyseus', e)
    }
}

export async function colyseusConnect(data:any, token?:string, world?:any, island?:any) {
    connect(serverRoom, data, token, world, island).then((room: Room) => {
        console.log("Connected!");
        colyseusRoom = room
        sessionId = room.sessionId
        connected = true

        room.onLeave((code: number) => {
            console.log('left room with code', code)
            connected = false
            if(code === 4010){
                console.log('user was banned')
            }
        })
        
        createServerListeners(room)
        sendServerMessage('get-conference', {})
    }).catch((err) => {
        console.error('colyseus connection error', err)
    });
}

export function sendServerMessage(type: string, data: any) {
    try{
        connected && colyseusRoom.send(type, data)
    }
    catch(e){
        console.log('error sending message to server', e)
    }
}

function createServerListeners(room:Room){
    room.onMessage("error", (info:any)=>{
        console.log("" + ' received', info)
        //show notification error
    })

    room.onMessage("success", (info:any)=>{
        console.log("" + ' received', info)
        //show notification error//
    })

    room.onMessage("reservation-confirmed", async (info:any)=>{})

    room.onMessage("reservation-stream-confirmed", async (info:any)=>{})

    room.onMessage("cancel-reservation", (info:any)=>{})

    room.onMessage("get-locations", async (info:any)=>{})

    room.onMessage("set-conference", async (info:any)=>{
        console.log("set-conference" + ' received', info)

        // if(!info || !info.userId || info.images){
        //     return
        // }
        initConference(info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.CONFERENCE_IMAGE_UPDATE, async (info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.CONFERENCE_IMAGE_UPDATE + ' received', info)

        // if(!info || !info.userId || info.images){
        //     return
        // }//
        // updateImage(conferenceCenterEntities, info.id, info)
        handleUpdate(info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.CONFERENCE_VIDEO_UPDATE, async (info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.CONFERENCE_VIDEO_UPDATE + ' received', info)

        // if(!info || !info.userId || info.images){
        //     return
        // }//
        handleVideoUpdate(info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.CONFERENCE_CLEAR, async (info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.CONFERENCE_CLEAR + ' received', info)
        clearConference()
    })

    room.onMessage(SERVER_MESSAGE_TYPES.CONFERENCE_REFRESH, async (info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.CONFERENCE_REFRESH + ' received', info)
        refreshConferenceCenter(info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.CONFERENCE_ADD_RESERVATION, async (info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.CONFERENCE_ADD_RESERVATION + ' received', info)
        addNewReservation(info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.CONFERENCE_CANCEL_RESERVATION, async (info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.CONFERENCE_CANCEL_RESERVATION + ' received', info)
        removeReservation(info)
    })
}