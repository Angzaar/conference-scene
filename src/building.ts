import { engine, Entity, GltfContainer, MeshRenderer, Transform, VideoPlayer } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { utils } from "./helpers/libraries";
import { addBuilderHUDAsset } from "./dcl-builder-hud";
import { LAYER_1, NO_LAYERS } from "@dcl-sdk/utils";
import { videoEntity } from "./conference";

export let building:Entity

export function initBuilding(){
    building = engine.addEntity()
    GltfContainer.create(building, {src: "assets/building.glb"})
    Transform.create(building, {position: Vector3.create(24,0,56), rotation:Quaternion.fromEulerDegrees(0,270,0)})


    let ent = engine.addEntity()
    GltfContainer.create(ent, {src: "assets/LightSet_1.glb"})
    Transform.create(ent, {position: Vector3.create(24,0,56), rotation:Quaternion.fromEulerDegrees(0,270,0)})

    ent = engine.addEntity()
    GltfContainer.create(ent, {src: "assets/LightSet_2.glb"})
    Transform.create(ent, {position: Vector3.create(24,0,56), rotation:Quaternion.fromEulerDegrees(0,270,0)})

    ent = engine.addEntity()
    GltfContainer.create(ent, {src: "assets/Lights_A.glb"})
    Transform.create(ent, {position: Vector3.create(24,0,56), rotation:Quaternion.fromEulerDegrees(0,270,0)})

    ent = engine.addEntity()
    GltfContainer.create(ent, {src: "assets/Lights_B.glb"})
    Transform.create(ent, {position: Vector3.create(24,0,56), rotation:Quaternion.fromEulerDegrees(0,270,0)})

    ent = engine.addEntity()
    GltfContainer.create(ent, {src: "assets/elevator.glb"})
    Transform.create(ent, {position: Vector3.create(24,0,56), rotation:Quaternion.fromEulerDegrees(0,270,0)})


    // utils.triggers.enableDebugDraw(true)
    let insideTrigger = engine.addEntity()
    Transform.create(insideTrigger, {position: Vector3.create(37,10,56), scale:Vector3.create(52,19,73)})
    // MeshRenderer.setBox(insideTrigger)
    utils.triggers.addTrigger(insideTrigger, NO_LAYERS, LAYER_1, [{type:'box', scale:Transform.get(insideTrigger).scale}], ()=>{
        console.log('entered inside')
        let videoPlayer = VideoPlayer.getMutableOrNull(videoEntity)
        if(!videoPlayer){
            return
        }
        videoPlayer.volume = 1
    },
    ()=>{
        console.log('left inside')
        let videoPlayer = VideoPlayer.getMutableOrNull(videoEntity)
        if(!videoPlayer){
            return
        }
        videoPlayer.volume = 0
    })
    addBuilderHUDAsset(insideTrigger, "inside trigger")
}