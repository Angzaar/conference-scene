import { AvatarShape, engine, Transform } from '@dcl/ecs'
import { Vector3, Quaternion } from "@dcl/sdk/math"
import { initBuilding } from './building'
import { getPreview } from './helpers/functions'
import {getPlayer} from "@dcl/sdk/players";
import { utils } from './helpers/libraries';
import { joinServer, setLocalUserId } from './server';
import { setupUi } from './ui/ui';
import { enableBuilderHUD } from './dcl-builder-hud/ui/builderpanel';
import './polyfill'


let admins:string[] = ["0xceba6b4186aae99bc8c3c467601bd344b1d62764"]

export function main() {
  initBuilding()


  getPreview().then(()=>{
    let data:any
    try{
      checkPlayer(data)
    }
    catch(e){
        console.log('cannot run deprecated function get explorer configuration', e)
    }
  })
}

function checkPlayer(hardwareData:any){
  let player = getPlayer()
  console.log('player is', player)
  if(!player){
      console.log('player data not set, backing off and trying again')
      utils.timers.setTimeout(()=>{
          checkPlayer(hardwareData)
      }, 100)
  }
  else{
      createPlayer(hardwareData, player)
  }
}

async function createPlayer(hardwareData:any, player:any){
  const playerData = setLocalUserId(player)
  if (playerData) {
    setupUi()

    if(admins.includes(playerData.userId)){
      enableBuilderHUD(true)
    }
    

      // const sceneInfo = await getSceneInformation({})
      // if (!sceneInfo) return

      // const sceneJson = JSON.parse(sceneInfo.metadataJson)
      // console.log("scene json is", sceneJson)

      // if(!sceneJson.iwb) return
      // await setRealm(sceneJson, hardwareData.clientUri)

      joinServer()

      // createNPCs()
  }
}