import React from 'react'
import { Cell } from '@vkontakte/vkui'

interface iScheduleListItem {
    lesson: any
    onCellClick: (lesson: any) => void
}
export default class ScheduleListItem extends React.Component<iScheduleListItem, any>{


    render() {

        let { lesson, onCellClick } = this.props
        return <Cell
            expandable
            multiline
            onClick={() => onCellClick(lesson)}
            data-to='lesson'
            before={<div className="time">{lesson['Время']}<br /><span style={{ color: "#cccccc" }}>{lesson['Окончание']}  <br /> МСК</span></div>}

            description={lesson['Описание'].substring(0, 70)}
        >
            {lesson['Name']}
        </Cell>
    }

}