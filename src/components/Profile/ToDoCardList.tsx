import React from 'react'
import { Group, Header, List, Cell, } from '@vkontakte/vkui';
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
        let proms = this.props.achieves.map(achieve => this.fetchRubricHistory(achieve).then((userHistory: any[]) => {

            achieve.achievedItems = userHistory || []
            let acivedItem = userHistory.filter(el => el['Ачивка']).find(el => el['Ачивка'][0] === achieve.recID)
            achieve.done = acivedItem ? true : false
            return achieve
        }))

        this.setState({
            achieves: await Promise.all(proms)
        })
    }

    async fetchRubricHistory(record: iAchieve) {

        return base.list(record['Таблица'], {
            filterByFormula: `AND(
                {VK-ID}=${this.props.user.id}, 
                {Средняя} >= ${record['Оценка']}, 
                {RubricID}='${record.RubricID}',
                NOT({Ачивка}=BLANK())
                )`
        })
            .catch(e => {
                console.error(e)
                return []
            })
    }

    isDone() {
        // console.log(this.props.user)
        // console.log(this.state.achieves)
        return false
    }

    

    render() {

        let { achieves, openModal } = this.props

        // const checkIfTaskDone = (task: any): boolean => {
        //     if (!task['Участники']) return false
        //     const id = task['Участники'].find(el => el === user.recID)
        //     if (id) return true
        //     return false
        // }

        const cells = (arr: iAchieve[]) => {
            return arr.map((el, i) => {

                return <Cell
                    key={i}
                    multiline
                    onClick={() => openModal({
                        type: 'modal',
                        data: {
                            title: el['Name'],
                            desc: el['Описание'],
                            // onButtonClickHandler: () => { console.log('Привет, мир!') },
                            // body: (<Div>Вот мой прогресс</Div>)
                        }
                    })}
                    data-to='lesson'

                    before={<div className="roundContainer">
                        <div className="round">
                            <label className="roundCircle" style={el.done ? { backgroundColor: 'var(--color-spacegray)' } : { backgroundColor: '#fff' }}></label>
                        </div>
                    </div>}

                    description={!el.done ? `Выполнено ${el.achievedItems ? el.achievedItems.length : 0} из ${el["Кол-во работ"]}` : null}
                >
                    <div style={el.done ? { textDecoration: 'line-through', color: 'var(--color-spacegray)' } : {}}>{`${el['Name']}`}</div>
                </Cell>
            })
        }

        return <Group header={<Header mode="secondary">Достижения</Header>} separator="hide">

            <List >
                {cells(achieves.filter(el=>!el.done).slice(0, 4))}
                {cells(achieves.filter(el=>el.done))}
            </List>
        </Group>
    }
}