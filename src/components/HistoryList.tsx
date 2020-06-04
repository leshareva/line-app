import React from 'react'
import { Group, Div, List, Avatar, Button, RichCell } from '@vkontakte/vkui'
import { star } from '../icons'
import { iModalData } from '../interfaces';
import Youtube from 'react-youtube'
import Tag from './Tag/Tag';



interface iHistoryList {
    fetchHistory: ()=> Promise<any[]>,
    openModal: (modal: { type: string, data?: iModalData }) => void
}
export default class HistoryList extends React.Component<iHistoryList, any>{

    _isMounted: boolean = false

    state = {
        history: [],
        isLoading: false
    }


    async componentDidMount() {
        this._isMounted = true
        this.setState({ isLoading: true })

        const history = await this.props.fetchHistory()

        if (this._isMounted) {
            this.setState({ history: history, isLoading: false })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    parseDate = (iso: string) => {
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
        ];
        let date = new Date(iso)
        let month = arr[+date.getMonth()];
        const result = `${date.getDate()} ${month} ${date.getFullYear()}, ${date.toLocaleTimeString().replace(/(.*:.*?):\d+/gs, '$1')}`
        return result
    }


    private parseHistory = (history: any[]) => {

        const renderTitle = (el) => {
            if (el['Макет'] && !el['Оценка']) return <span>Ожидает разбора</span>

            if (el['Оценка']) return <span>{el['Оценка']}</span>

            if (el['Баллы'] > 0 && el['Опыт'] && el['Опыт'] > 0) {
                return <span><span>{el['Баллы']}</span><span className="star">{star('#000000')}</span><span>,&nbsp;{el['Опыт']}&nbsp;опыта {(() => el['Комментарий'] ? "• " + el['Комментарий'] : "")()}</span></span>
            } else if (el['Баллы'] === 0 && el['Опыт'] && el['Опыт'] > 0) {
                return <span>{el['Опыт']}&nbsp;опыта {(() => el['Комментарий'] ? "• " + el['Комментарий'] : "")()}</span>

            } else if (!el['Опыт']) {
                return <span><span>{el['Баллы']}</span><span className="star">{star('#000000')}</span>{(() => el['Комментарий'] ? "• " + el['Комментарий'] : "")()}</span>

            }
        }

        const renderImage = el => {
            if (!el['Макет']) return
            return <Avatar mode="image" size={64} src={el['Макет'][0]['url']}></Avatar>
        }


        let renderModalData = (el) => {
            return <Youtube videoId={el['Разбор']} className="video" opts={{
                playerVars: {
                    start: el['feedback_marker'],
                    autoplay: 1
                }
            }} />
        }

        let renderBottom = (el) => {
            if (!el['Баллы'] && !el['Опыт']) return
            let stars = el['Баллы'] ? (<Tag><span>{el['Баллы']}</span>★</Tag>) : null
            let exp = el['Опыт'] ? (<Tag><span>{el['Опыт']}</span> XP</Tag>) : null
            return <div style={{ display: 'flex', marginTop: 'var(--wrapper-padding)' }}>{stars}{exp}</div>
        }

        return history
            .filter(el=>el['Макет'])
            .map((el, i) => {
                return <RichCell
                    key={i}
                    multiline
                    // expandable={el['Разбор'] ? true : false}
                    onClick={() => el['Разбор'] ? this.props.openModal({ type: 'modal', data: { body: renderModalData(el) } }) : null}
                    caption={this.parseDate(el['Датавремя'])}
                    actions={(() => el['Разбор'] ? <><Button>Смотреть разбор</Button></> : <></>)()}
                    before={renderImage(el)}
                    className={(() => !el['Оценка'] ? "cell_nonactive" : "historyCell")()}
                    bottom={renderBottom(el)}
                >{renderTitle(el)}</RichCell>
            })
    }

    render() {

        let { history, isLoading } = this.state

        if(isLoading) return <div>…</div>
        if (history.length === 0) return <Div>Вы пока не участвовали ни в одной активности.</Div>
        return <>
            <Group className="history">
                {(() => {
                    
                    return <List> {this.parseHistory(history)} </List>
                })()}

            </Group>
        </>


    }

}