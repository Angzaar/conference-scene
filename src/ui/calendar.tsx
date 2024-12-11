import ReactEcs, {UiEntity} from '@dcl/sdk/react-ecs'
import {
    getImageAtlasMapping,
    sizeFont
} from './helpers';
import resources from '../helpers/resources';
import { uiSizes } from './uiConfig';
import { Color4 } from '@dcl/sdk/math';
import { IWBButton } from './button';
import { sendServerMessage } from '../server';
import { reservations } from '../conference';
import { getFormattedDayString } from '../helpers/functions';

let show = false
let view = "calendar"


let displayedYear: number = new Date().getFullYear()
let displayedMonth: number = new Date().getMonth() // 0-based (0 = January)
let selectedDays: string[] = [] // List of selected days in YYYY-MM-DD format
let selectedHours: number[] = [] // List of selected days in YYYY-MM-DD format
let selectedDay:string = ""


let buttons:any[] = [
    {label:"Confirm Reservation", pressed:false, func:()=>{
        sendServerMessage('reserve-conference', {day:selectedDay, hours:selectedHours})
        showReservationPopup(false)
        },
        displayCondition:()=>{
            return selectedHours.length > 0 ? true : false
        }
    },
    {label:"Cancel", pressed:false, func:()=>{
        showReservationPopup(false)
        selectedDays.length = 0
    }
}
]

const getUnixTimestampForDayStart = (date: string): number => {
    const day = new Date(date) // Convert the date string (e.g., "2024-11-15") to a Date object
    day.setHours(0, 0, 0, 0) // Set the time to 00:00:00 (start of the day)
    return Math.floor(day.getTime() / 1000) // Convert to seconds and return Unix timestamp
  }

// export function updateSelectedLocation(id:number){
//     selectedLocationId = id
//     selectedLocation = locationsMap.get(id)
//     let size = calculateSquareSize(selectedLocation.parcels) 
//     locationSize = "" + size + "x" + size
// }//

export function showReservationPopup(value:boolean){
    show = value

    if(show){
      view = "calendar"
      selectedHours.length = 0
    }
}

export function createReservationCalendar() {
    return (
        <UiEntity
            key={resources.slug + "reservation-calendar-panel"}
            uiTransform={{
                display: show ? 'flex' : 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '65%',
                height: '75%',
                positionType: 'absolute',
                position: {right: '17%', bottom: '12%'}
            }}
            uiBackground={{
                textureMode: 'stretch',
                texture: {
                    src: 'images/atlas2.png',
                },
                uvs: getImageAtlasMapping(uiSizes.horizRectangle)
            }}
        >

<UiEntity
            uiTransform={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '95%',
                height: '95%',
            }}
            onMouseDown={()=>{
            }}
        >
            <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '40%',
                height: '100%',
            }}
        >
<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60%',
                height: '10%',
            }}
            uiText={{value:"Conference Center Calendar", fontSize: sizeFont(40,30)}}
        />

{/* <UiEntity
            uiTransform={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '10%',
            }}
        >
            <UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '50%',
                height: '100%',
            }}
            uiText={{value:"Lot Size: " + locationSize, fontSize: sizeFont(25,15)}}
        />

<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '50%',
                height: '100%',
            }}
            uiText={{value:"Scene Size: 60MB", fontSize: sizeFont(25,15)}}
        />
        </UiEntity>
 */}


<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '90%',
                height: '15%',
            }}
            uiText={{value:"Reservations grant you the ability to modify the banner images across the building and stream video content into the center.", fontSize: sizeFont(25,15)}}
        />

<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '90%',
                height: '10%',
            }}
            uiText={{value:"**Premium reservations for longer periods will be activated later**", fontSize: sizeFont(25,15)}}
        />

<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60%',
                height: '10%',
            }}
            uiText={{value:"Hours Selected - " + selectedHours.length, fontSize: sizeFont(40,20)}}
        />

        {generateButtons(buttons)}

        </UiEntity>


<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '60%',
                height: '100%',
            }}
        >


<UiEntity
            uiTransform={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '10%',
            }}
        >
<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20%',
                height: '100%',
            }}
            uiText={{value:"<", fontSize: sizeFont(40,30)}}
            onMouseDown={()=>{
                navigateMonth("backward")
            }}
        />

<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60%',
                height: '10%',
            }}
            uiText={{value:"" + new Date(displayedYear, displayedMonth).toLocaleString('default', { month: 'long' }) + " " + displayedYear, fontSize: sizeFont(40,30)}}
        />


<UiEntity
            uiTransform={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20%',
                height: '100%',
            }}
            uiText={{value:">", fontSize: sizeFont(40,30)}}
            onMouseDown={()=>{
                navigateMonth("forward")
            }}
        />


        </UiEntity>

        <UiEntity
            uiTransform={{
              display: view === "day" ? "flex" : "none",
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60%',
                height: '10%',
            }}
            uiText={{value:"" + getFormattedDayString(selectedDay), fontSize: sizeFont(30,20)}}
        />

            {/* calendar grid */}
        <UiEntity
            uiTransform={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                height: '90%',
                flexWrap:'wrap',
                display: show && view === "calendar" ? "flex" :"none"
            }}
        >
               {
                show && 
                view === "calendar" && 
                generateCalendarGrid()
            }
        </UiEntity>

            {/* day grid */}
            <UiEntity
            uiTransform={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '80%',
                height: '90%',
                display: show && view === "day" ? "flex" :"none",
                flexWrap: 'nowrap', // Allow wrapping to organize rows within each colum,
            }}
            // uiBackground={{color:Color4.Purple()}}
        >
            {/* Left Column */}
            <UiEntity
              uiTransform={{
                flexDirection: 'column', // Stack rows vertically in the left column
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '45%', // Half the width for the left column
                height: '100%', // Full height
              }}
              // uiBackground={{ color: Color4.Black() }}
            >
              {generateLeftColumn(0, selectedDay)}
            </UiEntity>

            {/* Right Column */}
            <UiEntity
              uiTransform={{
                flexDirection: 'column', // Stack rows vertically in the right column
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '45%', // Half the width for the right column
                height: '100%', // Full height
              }}
              uiBackground={{ color: Color4.Black() }}
            >
              {generateRightColumn(0, selectedDay)}
            </UiEntity>
        </UiEntity>
</UiEntity>
    
        </UiEntity>

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

// Function to check if a day can be selected
const canSelectDay = (date: string) => {
  if (selectedDays.length === 0) return true // First day can always be selected

  const firstDay = new Date(selectedDays[0])
  const lastDay = new Date(selectedDays[selectedDays.length - 1])
  const currentDay = new Date(date)

  const maxAllowedDays = 14

  // Check if the new day is contiguous
  const isContiguous =
    (currentDay.getTime() === firstDay.getTime() - 86400000) || // Previous day
    (currentDay.getTime() === lastDay.getTime() + 86400000)    // Next day

  // Ensure the total selection does not exceed the limit
  const withinLimit = selectedDays.length < maxAllowedDays

  return isContiguous && withinLimit
}

const canSelectHour = (hour: number): boolean => {
  if (selectedHours.length === 0) return true // First hour can always be selected

  const firstHour = selectedHours[0]
  const lastHour = selectedHours[selectedHours.length - 1]

  const maxAllowedHours = 4 // Maximum number of contiguous hours

  // Check if the new hour is contiguous
  const isContiguous = hour === firstHour - 1 || hour === lastHour + 1

  // Ensure the total selection does not exceed the limit
  const withinLimit = selectedHours.length < maxAllowedHours

  return isContiguous && withinLimit
}


const toggleDaySelection = (date: string) => {
    if (selectedDays.includes(date)) {
      // Remove day from selection
      selectedDays = selectedDays.filter((day) => day !== date)
    } else if (canSelectDay(date)) {
      // Add day to selection if rules are met
      selectedDays.push(date)
      selectedDays.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Keep days sorted
    } else {
      console.log("Cannot select this day: Maximum days exceeded, not contiguous, or other rules violated.")
    }
    console.log(selectedDays)
  }

  const toggleHourSelection = (hour: number) => {
    if (selectedHours.includes(hour)) {
      // Remove the hour from selection
      selectedHours = selectedHours.filter((h) => h !== hour)
      console.log(`Deselected hour: ${hour}:00`)
    } else if (canSelectHour(hour)) {
      // Add the hour to selection if rules are met
      selectedHours.push(hour)
      selectedHours.sort((a, b) => a - b) // Keep hours sorted
      console.log(`Selected hour: ${hour}:00`)
    } else {
      console.log("Cannot select this hour: Hours must be contiguous and within the allowed limit.")
    }
  }
  
  

// Function to handle day selection
const selectDay = (date: string) => {
  if (canSelectDay(date)) {
    selectedDays.push(date)
    selectedDays.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Keep days sorted
  } else {
    console.log("Cannot select this day: Maximum days exceeded or not contiguous.")
  }
}


// Navigation handlers for month navigation
const navigateMonth = (direction: "forward" | "backward") => {
  view = "calendar"
  selectedDay = ""

    if (direction === "forward") {
      if (displayedMonth === 11) {
        displayedMonth = 0
        displayedYear++
      } else {
        displayedMonth++
      }
    } else if (direction === "backward") {
      if (displayedMonth === 0) {
        displayedMonth = 11
        displayedYear--
      } else {
        displayedMonth--
      }
    }
  }

// Function to filter reservations by location and date
const getLocationReservations = (locationId: number) => {
  //   let location = locationsMap.get(locationId)
  //   if(!location || !location.reservations){
  //       return []
  //   }
  // return location.reservations
}

const getReservedDatesForMonth = (locationId: number) => {
    const reservedDates: Set<string> = new Set()
  
    reservations.forEach((reservation:any) => {
      const start = new Date(reservation.startDate * 1000) // Convert to milliseconds
      const end = new Date(reservation.endDate * 1000)
  
      let current = new Date(start)
      while (current <= end) {
        const currentMonth = current.getMonth()
        const currentYear = current.getFullYear()
  
        if (currentMonth === displayedMonth && currentYear === displayedYear) {
          reservedDates.add(current.toISOString().split('T')[0]) // Format as YYYY-MM-DD
        }
        current.setDate(current.getDate() + 1)
      }
    })
  
    return reservedDates
  }

  const getReservedHoursForDay = (locationId: number, selectedDate: string): Set<number> => {
    const reservedHours: Set<number> = new Set()
  
    reservations.forEach((reservation: any) => {
      const startUTC = new Date(reservation.startDate * 1000) // Convert to milliseconds
      const endUTC = new Date(reservation.endDate * 1000)
  
      // Define the UTC range for the selected day
      const selectedDayStartUTC = new Date(`${selectedDate}T00:00:00Z`) // Start of the day in UTC
      const selectedDayEndUTC = new Date(`${selectedDate}T23:59:59Z`) // End of the day in UTC
  
      if (startUTC <= selectedDayEndUTC && endUTC >= selectedDayStartUTC) {
        let currentUTC = new Date(startUTC)
        while (currentUTC <= endUTC) {
          const currentDateUTC = currentUTC.toISOString().split('T')[0] // Get current date in UTC as YYYY-MM-DD
          if (currentDateUTC === selectedDate) {
            reservedHours.add(currentUTC.getUTCHours()) // Add the hour in UTC (0-23) to the set
          }
          currentUTC.setUTCHours(currentUTC.getUTCHours() + 1) // Increment by one hour
        }
      }
    })
  
    return reservedHours
  }
  
  

// Function to generate the calendar grid
const generateCalendarGrid = () => {

    const firstDayOfMonth = new Date(displayedYear, displayedMonth, 1).getDay() // Day of the week
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate() // Total days in the month
  const reservedDates = getReservedDatesForMonth(0)
  const today = new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format


  const rows = 5 // 5 rows for weeks
  const columns = 7 // 7 columns for days of the week
  const cells = []

  let dayCounter = 1 - firstDayOfMonth // Start counting days, considering the offset for the first day

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const date = new Date(displayedYear, displayedMonth, dayCounter).toISOString().split('T')[0]
      const isValidDay = dayCounter > 0 && dayCounter <= daysInMonth
      const isPastDay = isValidDay && date < today // Check if the day is in the past


      // Determine the cell color
      let cellColor = Color4.Gray() // Default for invalid days
      if (isValidDay) {
        if(isPastDay){}
        else if (reservedDates.has(date)) {
          cellColor = resources.colors.opaqueBlue // Reserved days
        } else if (selectedDays.includes(date)) {
          cellColor = resources.colors.opaquePurple // Selected days
        } else {
          cellColor = resources.colors.opaqueGreen// Open days
        }
      }

      cells.push(
        <UiEntity
          key={`${row}-${col}`} // Unique key for each cell
          uiTransform={{
            width: `${12}%`, // Divide width evenly across columns
            height: `12%`, // Divide height evenly across rows
            margin: { top: `1%`, left: `1%` },
          }}
          uiBackground={{ color: cellColor }}
          uiText={{ value: isValidDay ? String(dayCounter) : '', fontSize: 20 }}
          onMouseDown={() => {
            if (isValidDay && !isPastDay){//}  && !reservedDates.has(date)) {
            //   selectDay(date) // Handle day selection
              // toggleDaySelection(date) // Handle toggling day selection
              view = "day"
              selectedDay = date
            }
          }}
        />
      )

      dayCounter++ // Increment day counter
    }
  }
  return cells
  }

  const generateLeftColumn = (locationId: number, selectedDate: string) => {
    const reservedHours = getReservedHoursForDay(locationId, selectedDate) // Get reserved hours for the selected day
    const cells = []
  
    for (let hour = 0; hour < 12; hour++) {
      // Determine the cell color
      let cellColor = Color4.Gray() // Default color for invalid hours
      if (reservedHours.has(hour)) {
        cellColor = resources.colors.opaqueBlue
      } else if (selectedHours.includes(hour)) {
        cellColor =resources.colors.opaquePurple
      } else {
        cellColor = resources.colors.opaqueGreen
      }

         // Format the UTC hour range for display
    const startUTC = `${String(hour).padStart(2, '0')}:00 UTC`
    const endUTC = `${String(hour + 1).padStart(2, '0')}:00 UTC`
  
      // Add the cell
      cells.push(
        <UiEntity
          key={`hour-${hour}`} // Unique key for each hour
          uiTransform={{
            width: '100%', // Full width for this column
            height: `${100 / 12}%`, // Divide height evenly across 12 rows
            margin:{top:'1%', bottom:'1%'}
          }}
          uiBackground={{ color: cellColor }}
          uiText={{ value: `${startUTC} - ${endUTC}`, fontSize: 15 }}
          onMouseDown={() => {
            if (!reservedHours.has(hour)) {
              toggleHourSelection(hour) // Handle hour toggling
            }
          }}
        >
        </UiEntity>
      )
    }
  
    return cells
  }
  
  const generateRightColumn = (locationId: number, selectedDate: string) => {
    const reservedHours = getReservedHoursForDay(locationId, selectedDate) // Get reserved hours for the selected day
    const cells = []
  
    for (let hour = 12; hour < 24; hour++) {
      // Determine the cell color
      let cellColor = Color4.Gray() // Default color for invalid hours
      if (reservedHours.has(hour)) {
        cellColor = resources.colors.opaqueBlue
      } else if (selectedHours.includes(hour)) {
        cellColor =resources.colors.opaquePurple
      } else {
        cellColor = resources.colors.opaqueGreen
      }

       // Format the UTC hour range for display
    const startUTC = `${String(hour).padStart(2, '0')}:00 UTC`
    const endUTC = `${String(hour + 1).padStart(2, '0')}:00 UTC`

  
      // Add the cell
      cells.push(
        <UiEntity
          key={`hour-${hour}`} // Unique key for each hour
          uiTransform={{
            width: '100%', // Full width for this column
            height: `${100 / 12}%`, // Divide height evenly across 12 rows
            margin:{top:'1%', bottom:'1%'}
          }}
          uiBackground={{ color: cellColor }}
          uiText={{ value: `${startUTC} - ${endUTC}`, fontSize: 15 }}
          onMouseDown={() => {
            if (!reservedHours.has(hour)) {
              toggleHourSelection(hour) // Handle hour toggling
            }
          }}
        >
        </UiEntity>
      )
    }
  
    return cells
  }
  
  
  