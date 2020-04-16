import React from 'react'
import { Header, Group, Cell, Div, List, InfoRow, Progress } from '@vkontakte/vkui'

interface iHistoryList {
    history: any[]
    rubric: any
}
export default class HistoryList extends React.Component<iHistoryList, any>{

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

        return history.map((el, i) => {
            return <Cell key={i} asideContent={el.rubric} className={(() => (el['Баллы']) < 0 ? "cellNegative" : "historyCell")()} description={(() => {
                return this.parseDate(el['Датавремя'])
            })()
            } >

                {(() => {

                    if (!el['Баллы']) el['Баллы'] = 0;

                    if (el['Баллы'] > 0 && el['Опыт']) {
                        return <span><span>{el['Баллы']}</span><span className="star">{star('#000000')}</span><span>,&nbsp;{el['Опыт'][0]}&nbsp;опыта {(() => el['Комментарий'] ? "• " + el['Комментарий'] : "")()}</span></span>
                    } else if (el['Баллы'] === 0 && el['Опыт']) {
                        return <span>{el['Опыт'][0]}&nbsp;опыта {(() => el['Комментарий'] ? "• " + el['Комментарий'] : "")()}</span>

                    } else if (!el['Опыт']) {
                        return <span><span>{el['Баллы']}</span><span className="star">{star('#000000')}</span>{(() => el['Комментарий'] ? "• " + el['Комментарий'] : "")()}</span>

                    }
                })()
                }

            </Cell>
        })
    }

    render() {

        let { history, rubric } = this.props

        let cellHistory = this.parseHistory(history);
        let exp = history.filter(el => el['Опыт']).map(el => el['Опыт'][0]).reduce((current, next) => current + next);
        return <>
            <Group title="Прогресс" className="progressBarContainer">
                <InfoRow header={`${Math.round((exp * 100) / rubric['Итог опыт'])}%`} className="progressBar">
                    <Progress value={(exp * 100) / rubric['Итог опыт']} style={{ width: '100%' }} />
                </InfoRow>
            </Group>
            <Group header={<Header mode="secondary">История</Header>} className="history">
                {(() => {
                    if (history.length === 0) {
                        return <Div>Вы пока не участвовали ни в одной активности в этой рубрике.</Div>
                    }
                    return <List> {cellHistory} </List>
                })()}

            </Group>



        </>


    }

}