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
            onClick={()=>onCellClick({ lessonID: lesson.recID })}
            before={<div className="time"></div>}
            description={`${lesson['Время']} ${lesson['Описание'] ? ',' + lesson['Описание'].substring(0, 70) : ''}`}
        >
            {`${lesson['Name']}`}
        </Cell>
    }

}