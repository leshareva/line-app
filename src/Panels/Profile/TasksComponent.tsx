import React from 'react'
import { Group, Header, CardScroll, Card, CardGrid, Div } from '@vkontakte/vkui'
import TaskCard from './TaskCard/TaskCard'


interface iTasksComponent {
    fetchEvents: () => Promise<any[]>
    fetchTasks: () => Promise<any[]>
    go: (route: string, meta?: any) => void
}

export default class TasksComponent extends React.Component<iTasksComponent, any> {
    _isMounted: boolean = false

    state = {
        tasks: [],
        events: [],
        isLoading: false
    }

    async componentDidMount() {

        this._isMounted = true
        this.setState({ isLoading: true })

        const tasks = await this.props.fetchTasks()
        const events = await this.props.fetchEvents()

        if (this._isMounted) {
            this.setState({ tasks: tasks, events: events, isLoading: false })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {

        const eventsCards = (events, go) => {

            const background = (event: any) => {
                if (!event.event_type || !event.event_type['Обложка']) return 'linear-gradient(200.98deg, #485563 -13.11%, #29323C 75.28%)'
                return `url(${event.event_type['Обложка'][0]['url']})`
            }

            return events.map(event => {
                return <Card
                    size="s"
                    style={{ color: 'white', height: '128px', background: background(event) }}
                    key={event['rec_id']}
                    onClick={() => go('lesson', { lessonID: event.recID, lesson: event, backTo: 'profile' })}
                >
                    <div style={{ width: '110px', padding: '12px' }} >
                        <strong>{event['Рубрика']}</strong>
                        <div style={{ lineHeight: '120%' }}>{event['Name']}</div>
                        <div className="lesson_date">
                            {event['Дата']},<br />{event['Время']} МСК
                        </div>
                    </div>
                </Card >
            })

        }


        const cardList = (tasks, go) => {
            return <Group
                header={this.state.isLoading ? <div className="loader" style={{ marginLeft: 'var(--wrapper-padding)', height: 'var(--wrapper-padding-2x)', width: '150px', }}></div> : <Header mode="secondary">Разминки</Header>}
                style={{ marginBottom: 'calc(var(--wrapper-padding-2x) * 3)', marginTop: 'var(--wrapper-padding)' }}
                separator="hide"
            >
                <CardGrid>
                    {(() => {
                        if (this.state.isLoading)
                            return [1, 2].map((el, i) => <Card key={i} size='m' className='loader' ><Div style={{ width: 144, height: 120 }}></Div></Card>)

                        if (tasks && tasks.length !== 0)
                            return tasks.map(lesson => (<TaskCard key={lesson.recID} lesson={lesson} go={go} />))
                    })()}
                </CardGrid>
            </Group>

        }

        let { events, tasks } = this.state
        let { go } = this.props

        return <>
            <Group header={<Header mode="secondary">Встречи</Header>} separator='hide'>
                <CardScroll>
                    {eventsCards(events, go)}
                </CardScroll>
            </Group>
            {cardList(tasks, go)}
        </>


    }
}