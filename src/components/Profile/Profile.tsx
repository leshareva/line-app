import React from 'react'

import { Panel, Cell, List, PanelHeader, Group, Avatar, platform, ANDROID, CardGrid, Card } from '@vkontakte/vkui'
import Icon24BrowserForward from '@vkontakte/icons/dist/24/browser_forward'
import "./Profile.css"
import Cover from '../Cover/Cover'
import { star, logo } from '../../icons'
import LevelBubble from './LevelBubble/LevelBubble'
import ProfileTabs from './ProfileTabs'
import HistoryList from '../HistoryList'



interface iProfilePage {
    id: string,
    rubrics: any[]
    go: (e: React.MouseEvent<HTMLElement>) => void
    user: any
    snackbar: any
    openSnackbar: () => void
    history: any[]
    achieves: any[]
}



class Profile extends React.Component<iProfilePage, any> {

    constructor(props) {
        super(props)
        this.state = {
            selectedTab: 'tasks'
        }
    }


    render() {

        let {
            user,
            go,
            rubrics,
            openSnackbar,
            snackbar,
            achieves
        } = this.props

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
                            <a href="https://vk.com/@lean.school-kak-zarabotat-v-line-bally-i-zachem" target="_blank" rel="noopener noreferrer">Зачем баллы?</a>
                            <LevelBubble className="levelBubble" action={openSnackbar}>{Math.round(user['Уровень'])}</LevelBubble>
                        </div>

                    </div>
                </Cover>

                <ProfileTabs history={this.props.history} selectedTab={this.state.selectedTab} onClickHandler={(tabName) => this.setState({ selectedTab: tabName })} />

                {
                    (() => {
                        if (this.state.selectedTab !== 'tasks') return

                        return <Group title="Задания" separator="hide">
                            <CardGrid >
                                {
                                    achieves.map((el, i) => {
                                        let size: "s" | "m" | "l" = "s";
                                        if (i === 0 || i === 6) size = 'l'
                                        if (i === 1 || i === 2) size = 'm'
                                        let style = {
                                            padding: 'var(--wrapper-padding-2x)',
                                            height: 'fit-content'
                                        }
                                        return <Card size={size} key={el.recID}>
                                            <div style={style}>
                                                <div className="Cell__children">{el['Name']}</div>
                                                {el['Описание']}
                                                <br />
                                                <br />
                                        Выполнено
                                    </div>
                                        </Card>
                                    })
                                }
                            </CardGrid>
                        </Group>
                    })()
                }


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
                                        onClick={go}
                                        data-to='rubric'
                                        data-meta={JSON.stringify(rubric)}>{rubric['Название']}</Cell>)
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