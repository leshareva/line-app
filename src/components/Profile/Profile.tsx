import React from 'react'

import { Panel, Cell, List, PanelHeader, Group, Avatar, platform, ANDROID } from '@vkontakte/vkui'
import Icon24BrowserForward from '@vkontakte/icons/dist/24/browser_forward'
import "./Profile.css"
import Cover from '../Cover/Cover'
import { star, logo } from '../../icons'
import LevelBubble from './LevelBubble/LevelBubble'



interface iProfilePage {
    id: string,
    rubrics: any[]
    history: any[]
    go: (e: React.MouseEvent<HTMLElement>) => void
    user: any
    snackbar: any
    openSnackbar: () => void
}



class Profile extends React.Component<iProfilePage, any> {


    private parseHistory = (history: any[]) => {

        const parseDate = (iso: string) => {
            var arr = [
                'января',
                'февраля',
                'марта',
                'апреля',
                'мая',
                'июня',
                'июля',
                'августа',
                'сентября',
                'октября',
                'ноября',
                'декабря',
            ]
            let date = new Date(iso)
            let month = arr[+date.getMonth()]
            const result = `${date.getDate()} ${month} ${date.getFullYear()}, ${date.toLocaleTimeString().replace(/(.*:.*?):\d+/gs, '$1')}`
            return result
        }


        return history.map((el, i) => {
            return <Cell key={el.recID} asideContent={el.rubric} className={(() => (el['Баллы']) < 0 ? "cellNegative" : "historyCell")()} description={(() => {
                return parseDate(el['Датавремя'])
            })()
            } ><span>{el['Баллы']}</span><span className="star">{star('#000000')}</span>

            </Cell>
        })
    }






    render() {

        let {
            user,
            history,
            go,
            rubrics,
            openSnackbar,
            snackbar
        } = this.props

        let cellHistory = this.parseHistory(history)
        
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
                            <a href="https://vk.com/@lean.school-kak-zarabotat-v-line-bally-i-zachem" target="_blank" rel="noopener noreferrer">Как и зачем зарабатывать баллы?</a>
                            <LevelBubble className="levelBubble" action={openSnackbar}>{Math.round(user['Уровень'])}</LevelBubble>
                        </div>

                    </div>
                </Cover>



                <Group title="Рубрики" >
                    <List>
                        { rubrics.map((rubric, i) => {
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

                {(cellHistory.length !== 0) ? <Group title="История" className="history"><List> {cellHistory} </List></Group> : null}

                {snackbar}
            </Panel>

        )
    }
}



export default Profile