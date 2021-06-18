import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

const PlaceholderTable = () => {

  const datos = [1, 2, 3, 4, 5, 6];

  return (
    <table className="table table-bordered">
        <thead>
            <tr>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {
                datos.map(index => 
                    <tr key={`list-table-clock-${index}`}>
                        <td><Skeleton height="100px"/></td>
                        <td><Skeleton height="100px"/></td>
                        <td><Skeleton height="100px"/></td>
                        <td><Skeleton height="100px"/></td>
                        <td><Skeleton height="100px"/></td>
                        <td><Skeleton height="100px"/></td>
                        <td><Skeleton height="100px"/></td>
                    </tr>
                ) || null
            }
        </tbody>
    </table>
  )
}

let CalendarComponent;

const FullCalendarCustom = (props) => {
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  const generateCalendar = () => {
    CalendarComponent = dynamic({
      modules: () => ({
        calendar: import('@fullcalendar/react'),
        dayGridPlugin: import('@fullcalendar/daygrid'),
        timeGridPlugin: import('@fullcalendar/timegrid'),
        interactionPlugin: import('@fullcalendar/interaction'),
      }),

      render: (props, { calendar: Calendar, ...plugins }) => {
        // render
        return (
          <Calendar {...props} 
            plugins={Object.values(plugins)} 
            ref={props.myRef} 
          />
        )
      },
      ssr: false
    });
    setCalendarLoaded(true);
  }

  useEffect(() => {
    generateCalendar();
  }, [])

  if (!calendarLoaded) return <PlaceholderTable/>

  return (
    <div>
      {<CalendarComponent {...props} />}
    </div>
  )
}

export default FullCalendarCustom;