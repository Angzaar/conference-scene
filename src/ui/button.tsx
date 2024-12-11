import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { playSound } from '@dcl-sdk/utils'
import { Color4 } from '@dcl/sdk/math'
import { calculateImageDimensions, getAspect, getImageAtlasMapping, sizeFont } from './helpers'
import { uiSizes } from './uiConfig'
import resources from '../helpers/resources'

export function IWBButton(data:any){
    let button = data.button
    return(
        <UiEntity
      key={resources.slug + "-" + button.label + "-angzaar-plaza-reservation-button"}
      uiTransform={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        //   width: button.width ? button.width : '100%',
        //   width: calculateImageDimensions(button.width ? button.width : 7, getAspect(uiSizes.buttonPillBlue)).width,
        //   height: calculateImageDimensions(button.height ? button.height : 7,getAspect(uiSizes.buttonPillBlue)).height,
        // width: '%',
          margin: button.margin? button.margin : {top:"1%", bottom:'1%'},
          positionType: button.positionType ? button.positionType : undefined,
          position: button.position ? button.position : undefined,
          display: button.hasOwnProperty("displayCondition") ? button.displayCondition() ? 'flex':'none' : 'flex',
      }}
      uiBackground={{
          textureMode: 'stretch',
          texture: {
              src: button.customImage ? button.customImage : 'images/atlas2.png'
          },
          uvs: button.customImage ? getImageAtlasMapping(button.uvs) : getButtonState(data.buttons, button.label)
      }}
      onMouseDown={() => {
        button.func()
      }}
      onMouseUp={()=>{
      }}
      uiText={{textWrap:button.textwrap ? button.textwrap : 'nowrap',  value: button.customImage ? "" : button.label, color:Color4.White(), fontSize:sizeFont(button.fontBigScreen ? button.fontBigScreen : 20,button.fontSmallScreen ? button.fontSmallScreen : 20)}}
      />
    )
}

function getButtonDisplay(button:string){
    return 'flex'
}
  
function getButtonState(buttons?:any[], button?:string){
    if(buttons){
        if(buttons.find((b:any)=> b.label === button).pressed){
        return getImageAtlasMapping(uiSizes.buttonPillBlue)
        }else{
            return getImageAtlasMapping(uiSizes.buttonPillBlack)
        }
    }else{
        return getImageAtlasMapping(uiSizes.buttonPillBlack)
    }
}