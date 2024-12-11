import { getRealm } from "~system/Runtime";
import {Animator, engine, Entity, Transform} from "@dcl/sdk/ecs";
import { ReadOnlyVector3 } from "~system/EngineApi";
import { DEG2RAD, Quaternion, Vector3 } from "@dcl/sdk/math";
import { eth, utils } from "./libraries";
// import { openExternalUrl } from "~system/RestrictedActions";
// import resources from "./resources";
// import CANNON, { Vec3 } from "cannon"
import { CHAIN_TYPE, NFT_TYPES } from "./types";
import { createEthereumProvider } from '@dcl/sdk/ethereum-provider'
import { abi1155, abi721 } from "../helpers/abis"


export function paginateArray(array:any[], page:number, itemsPerPage:number){
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return array.slice(startIndex, endIndex)
}

export function formatSize(size: number | undefined) {
  if (!size) return "0"

  return (size / (1024 ** 2)).toFixed(2)
}

export function sceneSizeLimit(){
  
}

export function roundVector(object:Vector3, to:number){
  let x = object.x
  let y = object.y
  let z = object.z
  return Vector3.create(parseFloat(x.toFixed(to)), parseFloat(y.toFixed(to)), parseFloat(z.toFixed(to)))
}

export function roundQuaternion(object:Quaternion, to:number){
  let eulers = Quaternion.toEulerAngles(object)
  let x = eulers.x
  let y = eulers.y
  let z = eulers.z
  return Quaternion.fromEulerDegrees(parseFloat(x.toFixed(to)), parseFloat(y.toFixed(to)), parseFloat(z.toFixed(to)))
}

export function formatDollarAmount(amount: number, decimal?:number): string {
  return amount.toLocaleString('en-US', { maximumFractionDigits: decimal ? decimal : 0 });
}

export function formatSecondsToString(seconds:number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function convertETHNumber(amount:any){
  return new eth.BigNumber(eth.fromWei(amount, "ether")).toFormat(2)
}

export function getRandomIntInclusive(min:any, max:any) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}


export function getRandomString(length:number) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

export function getDistance(pos1:any, pos2:any){
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2) + Math.pow(pos1.z- pos2.z, 2)
  );
}

export let isPreview = false
export async function getPreview(){
    const realm = await getRealm({});
    isPreview = realm.realmInfo?.isPreview || false
}

export function log(...args:any){
  if(isPreview){
    console.log(JSON.stringify(args))
  }
}

export function isJSON(object:any){
  try {
   const jsonObject = JSON.parse(object);
   return true;
 } catch (error) {
   return false;
 }
}


export function addAnimator(entity:Entity, animations:any[], playings:boolean[], loops:boolean[]){
    let states:any[] = []
    animations.forEach((animation,i)=>{
        states.push({name:animation, clip:animation, playing:playings[i], loop:loops[i]})
    })

    Animator.createOrReplace(entity, {
        states:states
    })
}

export function playAnimation(ent:Entity, anim:string, reset?:boolean, loop?:boolean){
  Animator.playSingleAnimation(ent,anim,reset)
}

export function turn(entity:Entity, target: ReadOnlyVector3){
	const transform = Transform.getMutable(entity)
	const difference = Vector3.subtract( target, transform.position)
	const normalizedDifference = Vector3.normalize(difference)
	transform.rotation = Quaternion.lookRotation(normalizedDifference)
}

export async function getData(url:string){
  let response = await fetch(url)
  let json = await response.json()
  return json
}

export function addLineBreak(text:string, bubble?:boolean, lineCount?:number){
  return lineBreak(text,lineCount ? lineCount : 20)
}

function lineBreak(text: string, maxLineLength: number): string {
  const words = text.split(' ');
  let currentLine = '';
  const lines = [];

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxLineLength) {
      currentLine += `${word} `;
    } else {
      lines.push(currentLine.trim());
      currentLine = `${word} `;
    }
  }
  lines.push(currentLine.trim());
  return lines.join('\n');
}

export function setUVs(rows: number, cols: number) {
  return [
    // North side of unrortated plane
    0, //lower-left corner
    0,

    cols, //lower-right corner
    0,

    cols, //upper-right corner
    rows,

    0, //upper left-corner
    rows,

    // South side of unrortated plane
    cols, // lower-right corner
    0,

    0, // lower-left corner
    0,

    0, // upper-left corner
    rows,

    cols, // upper-right corner//
    rows,
  ]
}

export function getFrontOfPlayerPosition() {
  const playerPosition = Transform.get(engine.PlayerEntity)
  const cameraPosition = Transform.get(engine.PlayerEntity)
  return Vector3.add(playerPosition!.position, Vector3.rotate(Vector3.create(0, -1, 1), cameraPosition!.rotation))
}

export function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function getRandomPointInArea(boxPosition:Vector3, boxWidth: number, boxHeight: number, boxDepth: number) {
  const x = boxPosition.x + Math.random() * boxWidth;
  const y = boxPosition.y + Math.random() * boxHeight;
  const z = boxPosition.z + Math.random() * boxDepth;
  
  return { x, y, z };
}

export async function createBlockchainContract(chain:CHAIN_TYPE, contractAddress:string, protocol:NFT_TYPES){
  console.log('creating blockchain contract', chain, contractAddress, protocol)
  const provider = await createEthereumProvider()
  const requestManager = new eth.RequestManager(provider)

  if(chain === CHAIN_TYPE.ETH){
    console.log('chain is eth')
    const factory = new eth.ContractFactory(requestManager, protocol === NFT_TYPES.ERC721 ? abi721 : abi1155)
    return (await factory.at(contractAddress)) as any
  }else{
    console.log('chain is polygon')
    const metaProvider: any = new eth.WebSocketProvider("wss://rpc-mainnet.matic.quiknode.pro");
    const metaRequestManager: any = new eth.RequestManager(metaProvider);
    return await new eth.ContractFactory(metaRequestManager, protocol === NFT_TYPES.ERC721 ? abi721 : abi1155).at(contractAddress);
  }
}

export function calculateTimeToTarget(startPos: {x: number, y: number, z: number}, 
                               endPos: {x: number, y: number, z: number}, 
                               velocity: number): number {
    // Calculate distance between start and end positions
    const distance = Math.sqrt(
        Math.pow(endPos.x - startPos.x, 2) +
        Math.pow(endPos.y - startPos.y, 2) +
        Math.pow(endPos.z - startPos.z, 2)
    );

    // Time to reach target is distance divided by velocity (m/s)
    const timeToTarget = distance / velocity;

    return timeToTarget;
}

export function formatUnixTimestamp(unixTimestamp: number): string {
  // Convert Unix timestamp from seconds to milliseconds
  const date = new Date(unixTimestamp * 1000);

  // Get month, day, and year
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // 01-12
  const day = ("0" + date.getDate()).slice(-2); // 01-31
  const year = date.getFullYear(); // 4-digit year

  // Format as mm/dd/year
  return `${month}/${day}/${year}`;
}

// Format a timestamp to HH:mm
export function formatTimeToHHMM(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes()
    .toString()
    .padStart(2, '0')}`;
}

export const getFormattedDayString = (date: string): string => {
  // Create a Date object using local time (not UTC)
  const [year, month, day] = date.split('-').map(Number)
  const localDate = new Date(year, month - 1, day) // Month is zero-based in JavaScript

  const dayName = localDate.toLocaleString('default', { weekday: 'long' }) // Get full day name
  const dayNumber = localDate.getDate() // Get the day of the month

  // Add the appropriate suffix to the day number
  const suffix = (n: number) => {
    if (n % 10 === 1 && n !== 11) return 'st'
    if (n % 10 === 2 && n !== 12) return 'nd'
    if (n % 10 === 3 && n !== 13) return 'rd'
    return 'th'
  }

  return `${dayName}, ${dayNumber}${suffix(dayNumber)}` // Format as "Friday, 15th"
}

export const convertUTCToLocal = (utcTimestamp: number): string => {
  const date = new Date(utcTimestamp * 1000) // Convert from seconds to milliseconds
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
}
