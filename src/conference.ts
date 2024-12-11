import { AvatarShape, engine, Entity, Material, MeshRenderer, Transform, VideoPlayer, VisibilityComponent } from "@dcl/sdk/ecs";
import { conferenceImageLocations } from "./helpers/resources";
import { addBuilderHUDAsset } from "./dcl-builder-hud";
import { Color4, Quaternion, Vector2, Vector3 } from "@dcl/sdk/math";
import { updateLocations } from "./ui/reservationAdmin";
import { localUserId } from "./server";
import { showLogo } from "./ui/logo";
import * as npc from 'dcl-npc-toolkit'
import { displayToolPanel } from "./ui/toolsPanel";
import { showDialogPanel } from "./ui/DialogPanel";
import { alreadyPanel, welcomeDialog } from "./dialogs";
import { showNotification } from "./ui/NotificationPanel";
import { NOTIFICATION_TYPES } from "./helpers/types";

export let reservations:any[] = []
export let conferenceReservation:any
export let userReservation:any
export let conferenceCenterEntities:Map<number, any> = new Map()
export let editEntities:Map<number, any> = new Map()
export let videoEntity:Entity

export function removeReservation(id:string){
    let resIndex = reservations.findIndex((res:any)=> res.id === id)
    if(resIndex < 0){
        return
    }

    reservations.splice(resIndex, 1)

    if(userReservation && userReservation.id === id){
        userReservation = undefined
        showLogo(false)
        showNotification({type:NOTIFICATION_TYPES.MESSAGE, message: "Your reservation has been cancelled!", animate:{enabled:true, return:true, time:5}})
    }

    if(conferenceReservation && conferenceReservation.id === id){
        conferenceReservation = undefined
        clearConference()
    }
}

export function addNewReservation(res:any){
    if(!res){
        return
    }

    reservations.push(res)

    if(res.ethAddress === localUserId){
        userReservation = res
        displayToolPanel(false)
        showLogo(true)
        showNotification({type:NOTIFICATION_TYPES.MESSAGE, message: "Your reservation has been confirmed! Edit your images, video, and audio from the Angzaar icon in the top right.", animate:{enabled:true, return:true, time:10}})
    }
}

export function setUserReservation(res:any){
    userReservation = res
}

export async function initConference(info:any){
    reservations = info.reservations
    await createConferenceEntities()
    await createEditEntities()
    await createVideo()
    await createNPCWelcome()

    refreshConferenceCenter(info)
}

function createConferenceEntities(){
    for(let i = 0; i < conferenceImageLocations.length; i++){
        let ent = engine.addEntity()
        let location = {...conferenceImageLocations[i]}
        location.ent = ent
        location.v = false
        conferenceCenterEntities.set(location.id, location)

        VisibilityComponent.create(ent, {visible:false})
        MeshRenderer.setPlane(ent)

        Transform.create(ent, {position: location.position, rotation:location.rotation, scale:location.scale})
        addBuilderHUDAsset(ent, location.label)
    }
}

function createEditEntities(){
    for(let i = 0; i < conferenceImageLocations.length; i++){
        let ent = engine.addEntity()
        let location = {...conferenceImageLocations[i]}
        location.ent = ent
        location.v = false
        editEntities.set(location.id, location)

        VisibilityComponent.create(ent, {visible:false})
        MeshRenderer.setPlane(ent)

        Transform.create(ent, {position: location.position, rotation:location.rotation, scale:location.scale})
    }
}

function createVideo(){
    videoEntity = engine.addEntity()
    Transform.create(videoEntity, {position:Vector3.create(61.2, 13.9, 56), rotation:Quaternion.fromEulerDegrees(0,90,0), scale:Vector3.create(34.3,19,1)})
    MeshRenderer.setPlane(videoEntity)
    VideoPlayer.create(videoEntity, {
        src: '',
        playing: false,
        loop:true
    })

    const videoTexture = Material.Texture.Video({ videoPlayerEntity: videoEntity })

    Material.setPbrMaterial(videoEntity, {
        texture: videoTexture,
        roughness: 1.0,
        specularIntensity: 0,
        metallic: 0,
        emissiveTexture: videoTexture,
        emissiveIntensity: 1,
        emissiveColor: Color4.White(),
    })

    addBuilderHUDAsset(videoEntity, "Video")
}

export function addMaterial(entity:Entity, src:string, visible:boolean){
    Material.setPbrMaterial(entity, {
        texture: Material.Texture.Common({
            src: '' + src,
        }),
        emissiveColor:Color4.White(),
        emissiveIntensity:1,
        emissiveTexture:Material.Texture.Common({
            src: '' + src,
        }),
    })
}

export function handleUpdate(info:any){
    if((conferenceReservation || conferenceReservation !== undefined) && conferenceReservation.id === info.reservationId){
        console.log('update curren reservation')
        let location:any = conferenceCenterEntities.get(info.id)
        if(!location){
            console.log('couldnt update location', info.id)
            return
        }
    
        location.v = info.v
        location.src = info.src
        addMaterial(location.ent, info.src, info.v)
        VisibilityComponent.createOrReplace(location.ent, {visible:info.v})

    }

    if((userReservation || userReservation !== undefined) && userReservation.id === info.reservationId){
        console.log('update user reservation')
        let location:any = editEntities.get(info.id)
        if(!location){
            console.log('couldnt update location', info.id)
            return
        }
    
        location.v = info.v
        location.src = info.src
        addMaterial(location.ent, info.src, info.v)
        updateLocations(true)//
    }
}

export function handleVideoUpdate(info:any){
    if((conferenceReservation || conferenceReservation !== undefined) && conferenceReservation.id === info.reservationId){
        console.log('update curren reservation')

        for(let key in info){
            console.log(key, info[key])
            switch(key){
                case 'url':
                    if(info[key] !== conferenceReservation.video.url){
                        setVideo(info[key], conferenceReservation.video.auto)
                    }
                    break;

                 case 'auto':
                    if(info[key] !== conferenceReservation.video.auto){
                        setVideo(conferenceReservation.video.url, info[key])
                    }
                    break;
            }
            conferenceReservation.video[key] = info[key]
        }

    }

    if((userReservation || userReservation !== undefined) && userReservation.id === info.reservationId){
        console.log('update user reservation', userReservation)
        let video = userReservation.video

        for(let key in info){
            if(video.hasOwnProperty(key)){
                video[key] = info[key]
            }
        }
        console.log('new user reservation', userReservation)
        updateLocations(true)
    }
}

export function setVideo(src:string, playing:boolean, position?:number){
    VideoPlayer.createOrReplace(videoEntity, {
        src:src,
        playing:playing,
        position: position
    })
}

export function clearConference(){
    conferenceCenterEntities.forEach((config:any, id:number)=>{
        VisibilityComponent.createOrReplace(config.ent, {visible:false})
    })

    setVideo('', false)//
}

export function refreshConferenceCenter(info:any){
    if(info.current){
        conferenceReservation = info.current
        info.current.images.forEach((config:any)=>{
            let location:any = conferenceCenterEntities.get(config.id)
            if(!location){
                console.log('couldnt update location', config.id)
                return
            }
        
            location.v = config.v
            location.src = config.src
            addMaterial(location.ent, config.src, config.v)
            VisibilityComponent.createOrReplace(location.ent, {visible:config.v})
        })

        let position:any
        if(!info.current.video.live){
            if(info.current.video.sync){
                position = (Date.now()/1000) - info.current.video.start
                console.log('need to seek ', (( Date.now()/1000) - info.current.video.start) + " seconds")
            }
        }
        setVideo(info.current.video.url, info.current.video.auto, position)
    }
    

    if(info.user && info.user.ethAddress === localUserId){
        setUserReservation(info.user)
        showLogo(true)

        info.user.images.forEach((config:any)=>{
            let location:any = editEntities.get(config.id)
            if(!location){
                console.log('couldnt update location', config.id)
                return
            }
        
            location.v = config.v
            location.src = config.src
            addMaterial(location.ent, config.src, config.v)
            VisibilityComponent.createOrReplace(location.ent, {visible:false})
        })
    }else{
        showLogo(false)
    }
}

function createNPCWelcome(){
    // let avatar = engine.addEntity()
	// Transform.create(avatar, {position: Vector3.create(4.9,.1, 66.88), rotation:Quaternion.fromEulerDegrees(0,210,0)})
	// AvatarShape.create(avatar, {
	// 	id:'SR',
	// 	name:"Conference",
	// 	wearables:["urn:decentraland:matic:collections-v2:0x327aeb54030201d79a2ea702332e2c57d76bb1d5:11"],
	// 	emotes:[]
	// })

    let myNPC = npc.create(
		{
			position: Vector3.create(4.9,1,66.88),
			rotation: Quaternion.fromEulerDegrees(0,210,0),
			scale: Vector3.create(1, 1, 1),
		},
		//NPC Data Object
		{
			type: npc.NPCType.CUSTOM,
			model: 'assets/350551ae-541a-4852-80f3-d198c60b152a.glb',
			coolDownDuration:2,
            faceUser:true,
            onlyETrigger:true,
            idleAnim:'idle',
			onActivate: () => {
                // npc.talk(myNPC, [{text:'hellow', isEndOfDialog:true}])
                console.log('activated')

                showDialogPanel(true, {dialogs:!userReservation ? welcomeDialog : alreadyPanel})
			},
            onWalkAway: () => {
                // displayToolPanel(false)
                showDialogPanel(false)
            },
		}
	)

}