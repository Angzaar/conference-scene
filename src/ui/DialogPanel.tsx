import * as utils from '@dcl-sdk/utils'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity, Position,UiBackgroundProps } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import resources from '../helpers/resources'
import { calculateImageDimensions, dimensions, getAspect, getImageAtlasMapping, sizeFont } from './helpers'
import { uiSizes } from './uiConfig'

export let showingDialogPanel = false

let currentDialog:any = {
    index:0,
    name:"",
    dialogs:[
        {text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
        buttons:[{label:"Test Button", action: "aid"}]
    }
    ]
}

export function showDialogPanel(value:boolean, data?:any){
    console.log('showing dialog info', value ,data)
    if(value){
        currentDialog.dialogs = []
        data.dialogs.forEach((dialog:any)=>{
            currentDialog.dialogs.push(dialog)
        })
        currentDialog.index = 0
        showingDialogPanel = value
    }else{
        showingDialogPanel = value
        resetDialog()
    }
}

export function resetDialog(){
    currentDialog.index = 0
    currentDialog.dialogs.length = 0
}

export function advanceDialog(goto?:number){
    console.log('advancing dialog', goto)
    if(goto){
        console.log('forcing advance', goto)
        currentDialog.index = goto === -500 ? 0 : goto
    }else{
        if(currentDialog.index + 1 > currentDialog.dialogs.length - 1){
            showDialogPanel(false)
        }else{
            currentDialog.index += 1
        }
    }
    
}

export function createDialogPanel(){
    return (
      <UiEntity key={"" + resources.slug + "dialog::panel"}
        uiTransform={{
          width: calculateImageDimensions(42, 824/263).width,
          height: calculateImageDimensions(42, 824/263).height,
          display: showingDialogPanel ? 'flex' : 'none',
          justifyContent:'center',
          flexDirection:'column',
          alignItems:'center',
          alignContent:'center',
          positionType:'absolute',
          position:{left:(dimensions.width - calculateImageDimensions(42, 824/263).width) / 2, bottom:'10%'}
        }}
        uiBackground={{
          texture:{
              src:'images/atlas2.png'
          },
          textureMode: 'stretch',
          uvs:getImageAtlasMapping({
            atlasHeight:1024,
            atlasWidth:1024,
            sourceTop:0,
            sourceLeft:0,
            sourceWidth:824,
            sourceHeight:263
        })
        }}
        onMouseDown={()=>{
            // try{
            //     if(currentDialog.dialogs[currentDialog.index].isQuestion){
            //         return
            //     }
            //     advanceDialog()
            // }
            // catch(e){
            //     console.log('error',e)
            // }
        }}
      >

        {/* name text */}
        <UiEntity
        uiTransform={{
          width: '90%',
          height: '10%',
          justifyContent:'center',
          flexDirection:'column',
          alignItems:'center',
          alignContent:'center',
          margin:{top:"2%"},
          display: currentDialog && currentDialog.dialogs.length > 0 && currentDialog.dialogs[currentDialog.index].name ? "flex" : "none"
        }}
        // uiBackground={{color:Color4.Red()}}
        uiText={{value:"" + (currentDialog && currentDialog.dialogs.length > 0 && currentDialog.dialogs[currentDialog.index].name), fontSize:sizeFont(20,15), color:Color4.White(), textAlign:'middle-left'}}
        />

        {/* dialog text */}
        <UiEntity
        uiTransform={{
          width: '90%',
          height: 'auto',
          justifyContent:'flex-start',
          flexDirection:'column',
        }}
        // uiBackground={{color:Color4.Green()}}
            uiText={{value:"" + (currentDialog && currentDialog.dialogs.length > 0 && currentDialog.dialogs[currentDialog.index].text), fontSize:sizeFont(20,15), color:Color4.White(), textAlign:'top-left'}}
        />

        <UiEntity
        uiTransform={{
          width: '90%',
          height: '20%',
          justifyContent:'center',
          flexDirection:'row',
          display:'flex'
        }}
        >
            {generateButtons()}
        </UiEntity>

</UiEntity>

    )
}

function generateButtons(){
    let arr:any[] = []
    let count = 0
    if(currentDialog.dialogs.length > 0 && currentDialog.dialogs[currentDialog.index].buttons){
        currentDialog.dialogs[currentDialog.index].buttons.forEach((button:any)=>{
            arr.push(<DialogButton button={button} count={count} />)
        })
    }
    return arr
}

function DialogButton(data:any){
    let info = data.button
    let count = data.count
    return(
        <UiEntity
        key={resources.slug + "dialog-button-" + count}
        uiTransform={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: calculateImageDimensions(7, getAspect(uiSizes.buttonPillBlack)).width,
        height: calculateImageDimensions(5, getAspect(uiSizes.buttonPillBlack)).height,
            margin: {left: "1%", right: "1%"}
        }}
        uiBackground={{
            textureMode: 'stretch',
            texture: {
                src: 'images/atlas2.png'
            },
            uvs: getImageAtlasMapping(uiSizes.buttonPillBlack)
        }}
        uiText={{value: "" + (info.label), fontSize: sizeFont(20, 16)}}
        onMouseDown={() => {
            if(info.goToDialog < 0){
                console.log('goto dialog', info.goToDialog)
                if(info.hasOwnProperty("triggeredActions")){
                    console.log('running button actions')
                    info.triggeredActions()
                }
            }else{
                advanceDialog(info.goToDialog === 0 ? -500 : info.goToDialog)
            }
        }}
    />
    )
}