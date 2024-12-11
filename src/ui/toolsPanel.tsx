import ReactEcs, {UiEntity} from '@dcl/sdk/react-ecs'
import {
    calculateImageDimensions,
    calculateSquareImageDimensions,
    getAspect,
    getImageAtlasMapping,
    sizeFont
} from './helpers';
import resources from '../helpers/resources';
import { uiSizes } from './uiConfig';
import { Color4 } from '@dcl/sdk/math';
import { IWBButton } from './button';
import { userReservation } from '../conference';
import { showReservationPopup } from './calendar';

let buttons:any[] = [
    {label:"Reserve Center", pressed:false, func:()=>{
        showReservationPopup(true)
        },
        displayCondition:()=>{
            return userReservation ? false : true
        }
    },
    // {label:"2D Map", pressed:false, func:()=>{
    //     }
    // },
    // {label:"Plaza Map", pressed:false, func:()=>{
    //     movePlayerBrowserMap()
    // }
    // },
    // {label:"Client Map", pressed:false, func:()=>{
    //     }
    // },
    {label:"Close", pressed:false, func:()=>{
        showReservationPopup(false)
    }
}
]

let show = false
export function displayToolPanel(value:boolean){
    show = value
}

export function createToolsPanel() {
    return (
        <UiEntity
            key={resources.slug + "buttons-panel"}
            uiTransform={{
                display: show?  'flex' : 'none',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                width: '15%',
                height: '80%',
                positionType: 'absolute',
                position: {right: '1%', top: '10%'}
            }}
        >

            {generateButtons(buttons)}

        </UiEntity>
    );
}

export function generateButtons(data:any){
    let arr:any[] = []
    data.forEach((button:any)=>{
        arr.push(<IWBButton button={button} buttons={data.buttons} />)
    })
    return arr
  }