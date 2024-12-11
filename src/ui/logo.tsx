import ReactEcs, {UiEntity} from '@dcl/sdk/react-ecs'
import {
    calculateImageDimensions,
    calculateSquareImageDimensions,
    getAspect,
    getImageAtlasMapping,
    sizeFont
} from './helpers';
import resources, { models } from '../helpers/resources';
import { uiSizes } from './uiConfig';
import { showingAdminPanel, showReservationAdminPanel, updateLocations } from './reservationAdmin';

let show = false

export function showLogo(value:boolean){
    show = value
}

export function createLogo() {
    return (
        <UiEntity
            key={resources.slug + "logo-panel"}
            uiTransform={{
                display: show ? 'flex' : 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: calculateSquareImageDimensions(6).width,
                height:  calculateSquareImageDimensions(6).height,
                positionType: 'absolute',
                position: {right: '4%', top: '1%'}
            }}
            uiBackground={{
                textureMode: 'stretch',
                texture: {
                    src: 'images/icon_outline.png',
                }
            }}
            onMouseDown={()=>{
                showReservationAdminPanel(!showingAdminPanel)
            }}
        >

        </UiEntity>
    );
}