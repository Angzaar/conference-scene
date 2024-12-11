import ReactEcs, {Dropdown, Input, UiEntity} from '@dcl/sdk/react-ecs'
import {
    calculateImageDimensions,
    calculateSquareImageDimensions,
    getAspect,
    getImageAtlasMapping,
    sizeFont
} from './helpers';
import resources, { models } from '../helpers/resources';
import { uiSizes } from './uiConfig';
import { conferenceCenterEntities, editEntities, userReservation } from '../conference';
import { Color4 } from '@dcl/sdk/math';
import { sendServerMessage } from '../server';
import { SERVER_MESSAGE_TYPES } from '../helpers/types';
import { movePlayerTo } from '~system/RestrictedActions';
import { VisibilityComponent } from '@dcl/sdk/ecs';
import { formatTimeToHHMM, formatUnixTimestamp } from '../helpers/functions';

export let showingAdminPanel = false
export let view = "main"

export let locations:any[] = []
export let selectedIndex:number = 0
export let selectedSrc:string = "" 
export let selectedVideo:string = ""

export function updateLocations(override?:boolean){
    locations.length = 0

    editEntities.forEach((config:any, id:number)=>{
        locations.push(config)
    })
    locations.unshift({label:"Select image to edit"})
    console.log('locations are', locations)

    editEntities.forEach((config:any, id:number)=>{
        VisibilityComponent.createOrReplace(config.ent, {visible:config.v})
    })

    selectedVideo = userReservation.video.url
    console.log('video url', selectedVideo)
}

export function showReservationAdminPanel(value:boolean){
    showingAdminPanel = value

    if(showingAdminPanel){
        conferenceCenterEntities.forEach((config:any, id:number)=>{
            VisibilityComponent.createOrReplace(config.ent, {visible:false})
        })
        updateLocations()
    }else{
        editEntities.forEach((config:any, id:number)=>{
            VisibilityComponent.createOrReplace(config.ent, {visible:false})
        })

        conferenceCenterEntities.forEach((config:any, id:number)=>{
            VisibilityComponent.createOrReplace(config.ent, {visible:config.v})
        })
        view = "main"
    }
}

export function createReservationAdmin() {
    return (
        <UiEntity
            key={resources.slug + "admin-reservation-panel"}
            uiTransform={{
                display: showingAdminPanel ? 'flex' : 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: calculateImageDimensions(25, 446 / 431).width,
                height: calculateImageDimensions(45, 446 / 431).height,
                positionType: 'absolute',
                position: {right: '3%', bottom: '3%'}
            }}
            uiBackground={{
                textureMode: 'stretch',
                texture: {
                    src: 'images/atlas2.png',
                },
                uvs: getImageAtlasMapping(uiSizes.vertRectangle)
            }}
        >


            {/* main holder */}
            <UiEntity
        uiTransform={{
            display: view === "main" ? 'flex' : "none",
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '90%',
            height: '90%',
        }}
    >

<UiEntity
        uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '7%',
            margin:{bottom:'1%'}
        }}
        uiText={{value:"Conference Center Editor", textWrap:'nowrap', textAlign:'middle-center', fontSize:sizeFont(35,25)}}
    />

<UiEntity
        uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '5%',
            margin:{bottom:'1%'}
        }}
        uiText={{value:"Reservation Starts: " + (userReservation ? (formatUnixTimestamp(userReservation.startDate) + " - "  + formatTimeToHHMM(userReservation.startDate)): ""), textWrap:'nowrap', textAlign:'middle-left', fontSize:sizeFont(25,15)}}
    />

<UiEntity
        uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '5%',
            margin:{bottom:'3%'}
        }}
        uiText={{value:"Reservation Ends: " + (userReservation ? (formatUnixTimestamp(userReservation.endDate) + " - "  + formatTimeToHHMM(userReservation.endDate)): ""), textWrap:'nowrap', textAlign:'middle-left', fontSize:sizeFont(25,15)}}
    />

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        height: '7%',
        margin: {top: "2%"}
    }}
    uiBackground={{color: Color4.Black()}}
    uiText={{value: "Edit Images", fontSize: sizeFont(30, 20)}}
    onMouseDown={() => {
        view = "images"
    }}
/>

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        height: '7%',
        margin: {top: "2%"}
    }}
    uiBackground={{color: Color4.Black()}}
    uiText={{value: "Edit Video", fontSize: sizeFont(30, 20)}}
    onMouseDown={() => {
        view = "video"
    }}
/>

{/* buttons */}
<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '90%',
    height: '10%',
    positionType:'absolute',
    position:{bottom:'3%', left:'7%'}
}}
>

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        justifyContent: 'center',
        width: '50%',
        height: '100%',
    }}
>
<UiEntity
      uiTransform={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90%',
          height: calculateImageDimensions( 7,getAspect(uiSizes.buttonPillBlack)).height,
          margin: {top:"5%", bottom:'1%'},
      }}
      uiBackground={{
          textureMode: 'stretch',
          texture: {
              src: 'images/atlas2.png'
          },
          uvs: getImageAtlasMapping(uiSizes.buttonPillBlack)
      }}
      onMouseDown={() => {
        showReservationAdminPanel(false)
        sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_CANCEL_RESERVATION, userReservation.id)
      }}
      uiText={{textWrap:'nowrap',  value: "Cancel Reservation", color:Color4.White(), fontSize:sizeFont(25,15)}}
      />
</UiEntity>

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        justifyContent: 'center',
        width: '50%',
        height: '100%',
    }}
>
<UiEntity
      uiTransform={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90%',
          height: calculateImageDimensions( 7,getAspect(uiSizes.buttonPillBlue)).height,
          margin: {top:"5%", bottom:'1%'},
      }}
      uiBackground={{
          textureMode: 'stretch',
          texture: {
              src: 'images/atlas2.png'
          },
          uvs: getImageAtlasMapping(uiSizes.buttonPillBlue)
      }}
      onMouseDown={() => {
        showReservationAdminPanel(false)
      }}
      uiText={{textWrap:'nowrap',  value: "Close", color:Color4.White(), fontSize:sizeFont(25,15)}}
      />
</UiEntity>

</UiEntity>

    </UiEntity>


                {/* video holder */}
                <UiEntity
        uiTransform={{
            display: view === "video" ? 'flex' : "none",
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '90%',
            height: '90%',
        }}
    >
        <UiEntity
        uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '7%',
            margin:{bottom:'1%'}
        }}
        uiText={{value:"Conference Center Editor", textWrap:'nowrap', textAlign:'middle-center', fontSize:sizeFont(35,25)}}
    />

{/* video input */}
<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '90%',
    height: '7%',
}}
>

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        justifyContent: 'center',
        width: '80%',
        height: '100%',
    }}
>

<Input
    onChange={(value:string)=>{
        selectedVideo = value.trim()
    }}
    onSubmit={(value:string)=>{
        selectedVideo = value.trim()
        sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_VIDEO_UPDATE, {reservationId:userReservation.id, url:value.trim()})
    }}
    fontSize={sizeFont(20,15)}
    placeholder={'video url'}
    placeholderColor={Color4.White()}
    color={Color4.White()}
    uiTransform={{
        width: '90%',
        height: '100%',
    }}
    ></Input>


</UiEntity>

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        justifyContent: 'center',
        width: '30%',
        height: '100%',
    }}
>
<UiEntity
      uiTransform={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: calculateImageDimensions(5, getAspect(uiSizes.buttonPillBlue)).width,
          height: calculateImageDimensions( 5,getAspect(uiSizes.buttonPillBlue)).height,
          margin: {top:"1%", bottom:'1%'},
      }}
      uiBackground={{
          textureMode: 'stretch',
          texture: {
              src: 'images/atlas2.png'
          },
          uvs: getImageAtlasMapping(uiSizes.buttonPillBlue)
      }}
      onMouseDown={() => {
        sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_VIDEO_UPDATE, {reservationId:userReservation.id, url:selectedVideo})
    }}
      uiText={{textWrap:'nowrap',  value: "Update", color:Color4.White(), fontSize:sizeFont(25,15)}}
      />
</UiEntity>

</UiEntity>


{/* video auto start */}
<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '90%',
    height: '10%',
    margin:{top:'3%'}
}}
>
<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>

<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>
<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '15%',
            }}
        uiText={{textWrap:'nowrap',value:"Live Stream", fontSize:sizeFont(25, 15), color:Color4.White(), textAlign:'middle-left'}}
        />
</UiEntity>

<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>
<UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: calculateSquareImageDimensions(4).width,
            height: calculateSquareImageDimensions(4).height,
            margin:{top:"1%", bottom:'1%'},
        }}
        uiBackground={{
            textureMode: 'stretch',
            texture: {
                src: 'images/atlas2.png'
            },
            uvs: userReservation ? userReservation.video.live ?  getImageAtlasMapping(uiSizes.toggleOnTrans)  : getImageAtlasMapping(uiSizes.toggleOffTrans)  : getImageAtlasMapping(uiSizes.toggleOffTrans)
        }}
        onMouseDown={() => {
            sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_VIDEO_UPDATE, {reservationId:userReservation.id, live:!userReservation.video.live})
        }}
        />
</UiEntity>
    </UiEntity>

    <UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>

<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>
<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '15%',
            }}
        uiText={{textWrap:'nowrap',value:"Auto Start", fontSize:sizeFont(25, 15), color:Color4.White(), textAlign:'middle-left'}}
        />
</UiEntity>

<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>
<UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: calculateSquareImageDimensions(4).width,
            height: calculateSquareImageDimensions(4).height,
            margin:{top:"1%", bottom:'1%'},
        }}
        uiBackground={{
            textureMode: 'stretch',
            texture: {
                src: 'images/atlas2.png'
            },
            uvs: userReservation ? userReservation.video.auto ?  getImageAtlasMapping(uiSizes.toggleOnTrans)  : getImageAtlasMapping(uiSizes.toggleOffTrans)  : getImageAtlasMapping(uiSizes.toggleOffTrans)
        }}
        onMouseDown={() => {
            sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_VIDEO_UPDATE, {reservationId:userReservation.id, auto:!userReservation.video.auto})        }}
        />
</UiEntity>
    </UiEntity>
</UiEntity>


{/* video auto start */}
<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent:'flex-start',
    width: '90%',
    height: '10%',
}}
>
<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>

<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>
<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '15%',
            }}
        uiText={{textWrap:'nowrap',value:"Sync", fontSize:sizeFont(25, 15), color:Color4.White(), textAlign:'middle-left'}}
        />
</UiEntity>

<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>
<UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: calculateSquareImageDimensions(4).width,
            height: calculateSquareImageDimensions(4).height,
            margin:{top:"1%", bottom:'1%'},
        }}
        uiBackground={{
            textureMode: 'stretch',
            texture: {
                src: 'images/atlas2.png'
            },
            uvs: userReservation ? userReservation.video.sync ?  getImageAtlasMapping(uiSizes.toggleOnTrans)  : getImageAtlasMapping(uiSizes.toggleOffTrans)  : getImageAtlasMapping(uiSizes.toggleOffTrans)
        }}
        onMouseDown={() => {
            sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_VIDEO_UPDATE, {reservationId:userReservation.id, sync:!userReservation.video.sync})        }}
        />
</UiEntity>
    </UiEntity>

    {/* <UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>

<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>
<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '15%',
            }}
        uiText={{textWrap:'nowrap',value:"Visibility", fontSize:sizeFont(25, 15), color:Color4.White(), textAlign:'middle-left'}}
        />
</UiEntity>

<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '50%',
    height: '100%',
}}
>
<UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: calculateSquareImageDimensions(4).width,
            height: calculateSquareImageDimensions(4).height,
            margin:{top:"1%", bottom:'1%'},
        }}
        uiBackground={{
            textureMode: 'stretch',
            texture: {
                src: 'images/atlas2.png'
            },
            uvs: selectedIndex > 0 ? locations[selectedIndex].v ?  getImageAtlasMapping(uiSizes.toggleOnTrans)  :getImageAtlasMapping(uiSizes.toggleOffTrans)  : getImageAtlasMapping(uiSizes.toggleOffTrans)
        }}
        onMouseDown={() => {
            sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_IMAGE_UPDATE, {reservationId:userReservation.id, src:locations[selectedIndex].src, v:!locations[selectedIndex].v, id: locations[selectedIndex].id})
        }}
        />
</UiEntity>
    </UiEntity> */}
</UiEntity>


    </UiEntity>

     {/* audio holder */}
     <UiEntity
        uiTransform={{
            display: view === "audio" ? 'flex' : "none",
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '90%',
            height: '90%',
        }}
    >
        <UiEntity
        uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '7%',
            margin:{bottom:'1%'}
        }}
        uiText={{value:"Conference Center Editor", textWrap:'nowrap', textAlign:'middle-center', fontSize:sizeFont(35,25)}}
    />

<UiEntity
        uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '7%',
            margin:{bottom:'3%'}
        }}
        uiText={{value:"Reservation Starts: ", textWrap:'nowrap', textAlign:'middle-left', fontSize:sizeFont(25,15)}}
    />

<UiEntity
        uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '7%',
            margin:{bottom:'3%'}
        }}
        uiText={{value:"Reservation Ends: ", textWrap:'nowrap', textAlign:'middle-left', fontSize:sizeFont(25,15)}}
    />


    </UiEntity>

{/* images holder */}
<UiEntity
        uiTransform={{
            display: view === "images" ? 'flex' : "none",
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '90%',
            height: '90%',
        }}
    >

<UiEntity
        uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '7%',
            margin:{bottom:'1%'}
        }}
        uiText={{value:"Conference Center Editor", textWrap:'nowrap', textAlign:'middle-center', fontSize:sizeFont(35,25)}}
    />

<Dropdown
        options={[...locations.map(l => l.label)]}
        onChange={(index:number)=>{
            selectedIndex = index
            if(index === 0){
                selectedSrc = ""
            }else{
                selectedSrc = locations[index].src
                let location = locations[index]
                movePlayerTo({newRelativePosition:location.move, cameraTarget:location.look})
            }
        }}
        uiTransform={{
        width: '90%',
        height: '7%',
        margin:{bottom:'3%'}
        }}
        fontSize={sizeFont(25,15)}
        color={Color4.White()}
        />


{/* <UiEntity
        uiTransform={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '10%',
            margin:{bottom:'1%'}
        }}
        uiText={{value:"URL: " + selectedSrc, textWrap:'nowrap', textAlign:'middle-left', fontSize:sizeFont(25,15)}}
    /> */}

    
<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '90%',
    height: '7%',
}}
>

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        justifyContent: 'center',
        width: '80%',
        height: '100%',
    }}
>

<Input
    onChange={(value:string)=>{
        selectedSrc = value.trim()
    }}
    onSubmit={(value:string)=>{
        selectedSrc = value.trim()
        sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_IMAGE_UPDATE, {reservationId:userReservation.id, src:value, v:locations[selectedIndex].v, id: locations[selectedIndex].id})
    }}
    fontSize={sizeFont(20,15)}
    placeholder={'image url'}
    placeholderColor={Color4.White()}
    color={Color4.White()}
    uiTransform={{
        width: '90%',
        height: '100%',
    }}
    ></Input>


</UiEntity>

<UiEntity
    uiTransform={{
        flexDirection: 'column',
        justifyContent: 'center',
        width: '30%',
        height: '100%',
    }}
>
<UiEntity
      uiTransform={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: calculateImageDimensions(5, getAspect(uiSizes.buttonPillBlue)).width,
          height: calculateImageDimensions( 5,getAspect(uiSizes.buttonPillBlue)).height,
          margin: {top:"1%", bottom:'1%'},
      }}
      uiBackground={{
          textureMode: 'stretch',
          texture: {
              src: 'images/atlas2.png'
          },
          uvs: getImageAtlasMapping(uiSizes.buttonPillBlue)
      }}
      onMouseDown={() => {
        sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_IMAGE_UPDATE, {reservationId:userReservation.id, src:locations[selectedIndex].src, v:locations[selectedIndex].v, id: locations[selectedIndex].id})
      }}
      uiText={{textWrap:'nowrap',  value: "Update", color:Color4.White(), fontSize:sizeFont(25,15)}}
      />
</UiEntity>

</UiEntity>

<UiEntity
uiTransform={{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '90%',
    height: '10%',
}}
>
<UiEntity
uiTransform={{
    flexDirection: 'column',
    justifyContent: 'center',
    width: '80%',
    height: '100%',
}}
>
<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '15%',
            }}
        uiText={{textWrap:'nowrap',value:"Visibility", fontSize:sizeFont(25, 15), color:Color4.White(), textAlign:'middle-left'}}
        />

    </UiEntity>

    <UiEntity
uiTransform={{
    flexDirection: 'column',
    justifyContent: 'center',
    width: '20%',
    height: '100%',
}}
>
<UiEntity
        uiTransform={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: calculateSquareImageDimensions(4).width,
            height: calculateSquareImageDimensions(4).height,
            margin:{top:"1%", bottom:'1%'},
        }}
        uiBackground={{
            textureMode: 'stretch',
            texture: {
                src: 'images/atlas2.png'
            },
            uvs: selectedIndex > 0 ? locations[selectedIndex].v ?  getImageAtlasMapping(uiSizes.toggleOnTrans)  :getImageAtlasMapping(uiSizes.toggleOffTrans)  : getImageAtlasMapping(uiSizes.toggleOffTrans)
        }}
        onMouseDown={() => {
            sendServerMessage(SERVER_MESSAGE_TYPES.CONFERENCE_IMAGE_UPDATE, {reservationId:userReservation.id, src:locations[selectedIndex].src, v:!locations[selectedIndex].v, id: locations[selectedIndex].id})
        }}
        />
    </UiEntity>
</UiEntity>

    </UiEntity>

    <UiEntity
                    uiTransform={{
                        display: view !== "main" ? "flex" : "none",
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: calculateImageDimensions(2, getAspect(uiSizes.backButton)).width,
                        height: calculateImageDimensions(2, getAspect(uiSizes.backButton)).height,
                        positionType:'absolute',
                        position:{top:'5%', right:'10%'}
                    }}
                    uiBackground={{
                        textureMode: 'stretch',
                        texture: {
                            src: 'images/atlas2.png'
                        },
                        uvs: getImageAtlasMapping(uiSizes.backButton)
                    }}
                    onMouseDown={() => {
                        view = 'main'
                    }}
                />
        </UiEntity>
    );
}