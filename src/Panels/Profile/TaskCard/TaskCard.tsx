import React from 'react'
import { Card, Div } from '@vkontakte/vkui'
import * as removeMd from 'remove-markdown';
import Tag from '../../../components/Tag/Tag';

export default class TaskCard extends React.Component<any, any> {
    render() {

        let { lesson, go } = this.props

        const renderSkills = (lesson: any) => {
            if (!lesson.event_type || !lesson.event_type['Skills']) return
            return lesson.event_type['Skills']
                .sort((a, b) => a - b)
                .map((skill, i) => <Tag key={i}>{skill}</Tag>)
        }

        return <Card
            style={{ height: 'fit-content' }}
            size='l'
            mode='shadow'
            onClick={() => go('lesson', { lessonID: lesson.recID, lesson: lesson, backTo: 'profile' })}
        >
            <Div style={{}} ><strong>{lesson.event_type['Name']}</strong>
                <p>{removeMd(lesson.event_type['Описание'].slice(0, 200) + '…')}</p>
                {renderSkills(lesson)}
                <br />
                <small>От {lesson['Опыт']} XP</small>
            </Div>
        </Card>
    }
}