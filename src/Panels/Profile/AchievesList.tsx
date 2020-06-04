import React from 'react'
import { Group, List, Cell, } from '@vkontakte/vkui';
import { iModalData, iUser, iAchieve } from '../../interfaces';
import { AIR_CONFIG } from '../../config'
import Airtable from '../../Airtable';


let base = new Airtable(AIR_CONFIG)



interface iAchieveList {
    user: iUser
    openModal: (modal: { type: string, data: iModalData }) => void
    onButtonClick?: (route: string, meta: any) => void
    fetchAchieves: ()=>Promise<any[]>
}

export default class AchieveList extends React.Component<iAchieveList, any> {
    _isMounted: boolean = false
    constructor(props) {
        super(props)

        this.state = {
            achieves: [],
            isLoading: false
        }


    }
    async componentDidMount() {
        this._isMounted = true
        this.setState({isLoading: true})
        let achieves = await this.props.fetchAchieves()

        let proms = achieves.map(achieve => this.fetchRubricHistory(achieve).then((userHistory: any[]) => {
            achieve.achievedItems = userHistory || []
            let acivedItem = userHistory.filter(el => el['Ачивка']).find(el => el['Ачивка'][0] === achieve.recID)
            achieve.acivedItem = acivedItem
            return achieve
        }))

        let result = await Promise.all(proms);

        if (this._isMounted) {
            this.setState({
                achieves: result,
                isLoading: false
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

        let { openModal } = this.props
        let { achieves, isLoading } = this.state


        const cells = (arr: iAchieve[]) => {
            return arr.map((achive, i) => {

                return <Cell
                    key={i}
                    multiline
                    onClick={() => openModal({
                        type: 'modal',
                        data: {
                            title: achive['Name'],
                            desc: achive['Описание'],
                        }
                    })}
                    data-to='lesson'

                    before={<div className="roundContainer">
                        <div className="round">
                            <label className="roundCircle" style={achive.acivedItem ? { backgroundColor: 'var(--color-spacegray)' } : { backgroundColor: '#fff' }}></label>
                        </div>
                    </div>}

                    description={!achive.acivedItem ? `Выполнено ${achive.achievedItems ? achive.achievedItems.length : 0} из ${achive["Кол-во работ"]}` : `+ ${achive.acivedItem['Опыт']} опыта`}
                >
                    <div style={achive.acivedItem ? { textDecoration: 'line-through', color: 'var(--color-spacegray)' } : {}}>{`${achive['Name']}`}</div>
                </Cell>
            })
        }

        if(isLoading) return <div>…</div>

        return <Group separator="hide" style={{marginBottom: 'calc(var(--wrapper-padding-2x) * 3)'}}>
            <List >
                {cells(achieves.filter(el => !el.acivedItem).slice(0, 4))}
                {cells(achieves.filter(el => el.acivedItem))}
            </List>
        </Group>
    }
}