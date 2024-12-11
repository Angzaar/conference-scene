import ReactEcs, { Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { UiCanvasInformation, engine } from '@dcl/sdk/ecs'
import { uiSizer } from './helpers'
// import { NpcUtilsUi } from 'dcl-npc-toolkit'
import { createNPCWelcome } from './npcWelcome'
import { createBuilderHUDPanel } from '../dcl-builder-hud/ui/builderpanel'
import { createAdmin } from './admin'
import { createReservationAdmin } from './reservationAdmin'
import { createLogo } from './logo'
import { createToolsPanel } from './toolsPanel'
import { createReservationCalendar } from './calendar'
import { createDialogPanel } from './DialogPanel'
import { createNotificationUI } from './NotificationPanel'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
  engine.addSystem(uiSizer)
}

export const uiComponent:any = () => [
  createAdmin(),
  createNPCWelcome(),
  createBuilderHUDPanel('conference-scene'),
  createReservationAdmin(),
  createLogo(),
  createToolsPanel(),
  createReservationCalendar(),
  createDialogPanel(),
  createNotificationUI()
]
