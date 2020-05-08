import React from 'react'

import { Panel, Cell, List, PanelHeader, Group, Avatar, platform, ANDROID, Progress, Card, CardScroll, Header, Div } from '@vkontakte/vkui'
import Icon24BrowserForward from '@vkontakte/icons/dist/24/browser_forward'
import "./Profile.css"
import Cover from '../Cover/Cover'
import { star, logo } from '../../icons'
import LevelBubble from './LevelBubble/LevelBubble'
import ProfileTabs from './ProfileTabs'
import HistoryList from '../HistoryList'
import TodoCardsList from './ToDoCardList'
import { iModalData, iUser } from '../../interfaces'



interface iProfilePage {
    id: string,
    rubrics: any[]
    go: (route: string, meta?: any) => void
    user: iUser
    snackbar: any
    openSnackbar: () => void
    history: any[]
    achieves: any[]
    openModal: (modal: { type: string, data: iModalData }) => void
    getLessons: () => Promise<void | any[]>
}



class Profile extends React.Component<iProfilePage, any> {

    _isMounted: boolean = false

    constructor(props) {
        super(props)

        this.state = {
            tabs: ['rubrics', 'history'],
            selectedTab: 'tasks',
            lessons: [],
            isLoading: false
        }
    }

    async componentDidMount() {
        this._isMounted = true
        this.setState({ isLoading: true })
        if (this.props.achieves && this.props.achieves.length !== 0) {
            if (!this.state.selectedTab) this.setState({ selectedTab: 'tasks' })
            let tabs = this.state.tabs
            tabs.push('tasks')
            this.setState({ tabs: tabs })
        }
        if (this._isMounted) {
            let lessons = await this.props.getLessons();
            this.setState({ lessons: lessons, isLoading: false })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }



    render() {

        let {
            user,
            go,
            rubrics,
            openSnackbar,
            snackbar,
            achieves,
            openModal
        } = this.props


        let cardList = () => {
            return <Group header={this.state.isLoading ? <div className="loader" style={{ marginLeft: 'var(--wrapper-padding)', height: 'var(--wrapper-padding-2x)', width: '150px', }}></div> : <Header mode="secondary">Участвуй сегодня</Header>} separator="hide">
                <CardScroll>
                    {(() => {
                        if (this.state.isLoading)
                            return [1, 2].map((el, i) => <Card key={i} size='m' className='loader' ><Div style={{ width: 144, height: 120 }}></Div></Card>)

                        if (this.state.lessons && this.state.lessons !== 0) {
                            return this.state.lessons.map(lesson => {
                                //lesson['Обложка'] ? `url(${lesson['Обложка'][0]['url']})` :
                                return <Card
                                    key={lesson.recID}
                                    style={{ color: 'white', background: 'linear-gradient(200.98deg, #485563 -13.11%, #29323C 75.28%)' }}
                                    size='m'
                                    onClick={() => go('lesson', { lessonID: lesson.recID, lesson: lesson, backTo: 'profile' })}
                                >
                                    <Div style={{ width: 144, height: 120 }} ><small>{lesson['Рубрика']}</small><br /><strong>{lesson['Name']}</strong><br /><small>+{lesson['Опыт']} опыта</small></Div>
                                </Card>
                            })
                        }




                    })()}
                </CardScroll>
            </Group>

        }

        return (

            <Panel id='profile'  >
                <PanelHeader></PanelHeader>
                <Cover height="184px">
                    <div className="logo" style={{ top: (platform() === ANDROID) ? '25px' : '37px' }}>{logo}</div>
                    <div className="amountContainer">
                        <Avatar src={user.photo_200} size={72}></Avatar>
                        <div className="amountWrapper">
                            <span className="amount">{user['Баланс']}</span>
                            <span className="star">{star('#ffffff')}</span>
                            <br />
                            {`${1000 - user.levelExperience} опыта до ${Math.round(user['Уровень']) + 1} уровня `}
                            <Progress value={user.levelExperience * 0.1} style={{ width: '100%' }} />
                            {/* <a href="https://vk.com/@lean.school-kak-zarabotat-v-line-bally-i-zachem" target="_blank" rel="noopener noreferrer">Зачем баллы?</a> */}
                            <LevelBubble className="levelBubble" action={openSnackbar}>{Math.round(user['Уровень'])}</LevelBubble>
                        </div>

                    </div>
                </Cover>

                <ProfileTabs tabs={this.state.tabs} history={this.props.history} selectedTab={this.state.selectedTab} onClickHandler={(tabName) => this.setState({ selectedTab: tabName })} />

                {(() => {
                    if (this.state.selectedTab !== 'tasks') return
                    return <>
                        {cardList()}
                        <TodoCardsList achieves={achieves} openModal={openModal} user={user} rubrics={rubrics} onButtonClick={go}/>
                    </>
                })()}

                {(() => {
                    if (this.state.selectedTab === 'rubrics') {
                        return <Group title="Рубрики" >
                            <List>
                                {rubrics.map((rubric, i) => {
                                    let cover = () => rubric['Обложка'] ? <Avatar mode="image" src={rubric['Обложка'][0]['url']} size={72} /> : ""
                                    return (<Cell
                                        key={i}
                                        before={cover()}
                                        multiline
                                        description={rubric['desc']}
                                        asideContent={<Icon24BrowserForward fill="var(--icon_secondary)" />}
                                        onClick={(e) => go('rubric', rubric)}
                                    >{rubric['Название']}</Cell>)
                                })}
                            </List>
                        </Group>
                    }
                })()}


                {(this.props.history.length !== 0 && this.state.selectedTab === 'history') ? <HistoryList history={this.props.history} /> : ''}
                {snackbar}


            </Panel>

        )
    }
}



export default Profile