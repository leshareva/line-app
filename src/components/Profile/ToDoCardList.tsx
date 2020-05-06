import React from 'react'
import { Group, Header, List, Cell, } from '@vkontakte/vkui';
import { iModalData, iUser, iAchieve } from '../../interfaces';
import { base } from '../../Airtable';



interface iTodoCardsList {
    user: iUser
    achieves: iAchieve[]
    openModal: (modal: { type: string, data: iModalData }) => void
}

export default class TodoCardsList extends React.Component<iTodoCardsList, any> {
    _isMounted: boolean = false
    constructor(props) {
        super(props)

        this.state = {
            achieves: null
        }
    }
    async componentDidMount() {
        this._isMounted = true
        let proms = this.props.achieves.map(achieve => this.fetchRubricHistory(achieve).then((userHistory: any[]) => {

            achieve.achievedItems = userHistory || []
            let acivedItem = userHistory.filter(el => el['Ачивка']).find(el => el['Ачивка'][0] === achieve.recID)
            achieve.acivedItem = acivedItem
            return achieve
        }))
        if(this._isMounted) {
            this.setState({
                achieves: await Promise.all(proms)
            })
        }
        
    }

    componentWillUnmount() {
        this._isMounted = false;
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
                            <label className="roundCircle" style={el.acivedItem ? { backgroundColor: 'var(--color-spacegray)' } : { backgroundColor: '#fff' }}></label>
                        </div>
                    </div>}

                    description={!el.acivedItem ? `Выполнено ${el.achievedItems ? el.achievedItems.length : 0} из ${el["Кол-во работ"]}` : `+ ${el.acivedItem['Опыт']} опыта`}
                >
                    <div style={el.acivedItem ? { textDecoration: 'line-through', color: 'var(--color-spacegray)' } : {}}>{`${el['Name']}`}</div>
                </Cell>
            })
        }

        return <Group header={<Header mode="secondary">Цели</Header>} separator="hide">

            <List >
                {cells(achieves.filter(el => !el.acivedItem).slice(0, 4))}
                {cells(achieves.filter(el => el.acivedItem))}
            </List>
        </Group>
    }
}