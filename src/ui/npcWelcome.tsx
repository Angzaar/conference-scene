import ReactEcs, {UiEntity} from '@dcl/sdk/react-ecs'
import {
    calculateImageDimensions,
    calculateSquareImageDimensions,
    getAspect,
    getImageAtlasMapping,
    sizeFont
} from './helpers';
import { uiSizes } from './uiConfig';
import { Color4 } from '@dcl/sdk/math';
import { IWBButton } from './button';
import { changeRealm } from '~system/RestrictedActions';
import resources from '../helpers/resources';

let show = false

export function showWelcomeDisplay(value:boolean){
    show = value
}

let buttons:any[] = [
    {label:"Plaza Info", pressed:false, func:()=>{

    }
    },
    // {label:"2D Map", pressed:false, func:()=>{
    //     }
    // },
    {label:"Reserve Land", pressed:false, func:()=>{
        // startReservationPX()
        showWelcomeDisplay(false)
    }
    },
    // {label:"Client Map", pressed:false, func:()=>{
    //     }
    // },
    {label:"Visit Outpost", pressed:false, func:()=>{
        changeRealm({realm:"AngZaarOutpost.dcl.eth"})
    }
}
]

export function createNPCWelcome() {
    return (
        <UiEntity
            key={resources.slug + "npcWelcome-panel"}
            uiTransform={{
                display: show ?  'flex' : "none",
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                width: '15%',
                height: '25%',
                positionType: 'absolute',
                position: {right: '25%', top: '20%'}
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