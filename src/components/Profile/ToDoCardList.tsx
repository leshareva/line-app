import React from 'react'
import { Group, CardGrid, Card, Div } from '@vkontakte/vkui';
import { iModalData, iUser, iAchieve } from '../../interfaces';
import { base } from '../../airtable/airtable';



interface iTodoCardsList {
    user: iUser
    achieves: iAchieve[]
    openModal: (modal: { type: string, data: iModalData }) => void
}

export default class TodoCardsList extends React.Component<iTodoCardsList, any> {

    constructor(props) {
        super(props)

        this.state = {
            achieves: null
        }
    }
    async componentDidMount() {
        let proms = this.props.achieves.map(el => this.fetchRubricHistory(el).then(res => {
            el.achievedItems = res
            el.done = el.achievedItems.length === el['Кол-во работ'] || el.achievedItems.length > el['Кол-во работ']
            return el
        }))

        this.setState({
            achieves: await Promise.all(proms)
        })
    }

    async fetchRubricHistory(record: iAchieve) {
        return base.list(record['Таблица'], { filterByFormula: `AND({VK-ID}=${this.props.user.id}, {Средняя} >= ${record['Оценка']}, NOT({Рубрика}=BLANK()))` })
            .then((res: any[]) => res.filter(el => el['Рубрика'] && el['Рубрика'][0] === record.RubricID[0]))
            .catch(e => {
                console.error(e)
                return []
            })
    }

    render() {

        let { achieves, openModal } = this.props

        // const checkIfTaskDone = (task: any): boolean => {
        //     if (!task['Участники']) return false
        //     const id = task['Участники'].find(el => el === user.recID)
        //     if (id) return true
        //     return false
        // }

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

                        return <Card size={size} key={el.recID} onClick={() => openModal({
                            type: 'modal',
                            data: {
                                title: el['Name'],
                                desc: el['Описание'],
                                onButtonClickHandler: () => { console.log('Привет, мир!') },
                                buttonLabel: 'Перейти в рубрику',
                                body: (<Div>Вот мой прогресс</Div>)
                            }
                        })}>
                            <div style={style}>
                                <div className="Cell__children">{el['Name']}</div>
                                {el['Описание']}
                                <br />
                                <br />
                                {el['done'] ? '✓ Задание выполнено' : `Выполнено ${el.achievedItems ? el.achievedItems.length : 0} из ${el["Кол-во работ"]}`}
                            </div>
                        </Card>
                    })
                }
            </CardGrid>
        </Group>
    }
}