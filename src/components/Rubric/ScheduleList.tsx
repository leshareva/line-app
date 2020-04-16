import React from 'react'
import { Group } from '@vkontakte/vkui'
import ScheduleListItem from './ScheduleListItem';

interface iScheduleList {
    rubric: any
    onCellClick: (meta: any) => void
    lessons: any[]
}



export default class ScheduleList extends React.Component<iScheduleList, any>{


    constructor(props) {
        super(props)
        this.state = {
            isLoading: true
        }
    }


    render() {
        let { lessons, onCellClick } = this.props



        let days = Object.keys(lessons);
        return days.map((key, i) => {
            let les = lessons[key];
            return <div className="calendarWrapper" key={i}>
                <Group header={<h1 className="calendarHeader">{key.replace(/(\d+\s\D{3}?).+/gs, '$1') + ", " + les['day']}</h1>}  >
                    {(() => {
                        let less = lessons[key]['items']
                        return less.map((lesson, index) => {
                            return (<ScheduleListItem key={index} lesson={lesson} onCellClick={(data) => onCellClick(data)} />)
                        })
                    })()}
                </Group>
            </div>
        })



    }
}