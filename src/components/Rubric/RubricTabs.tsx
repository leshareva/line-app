import React from 'react'
import { Tabs, TabsItem } from '@vkontakte/vkui'

interface iRubricTabs {
    rubric: any
    history: any[]
    onClickHandler: (tabName: string) => void
    selectedTab: string
}

export default class RubricTabs extends React.Component<iRubricTabs, any> {

    render() {
        let { rubric, history, onClickHandler, selectedTab } = this.props
        return <Tabs>
            {(rubric['Тренировки'])
                ?
                <TabsItem
                    onClick={()=>onClickHandler('schedule')}
                    selected={selectedTab === 'schedule'}
                >Расписание</TabsItem>
                : null

            }

            {(rubric['Описание'])
                ? <TabsItem
                    onClick={()=>onClickHandler('desc')}
                    selected={selectedTab === 'desc'}
                >Описание</TabsItem>
                : null

            }

            {(history && history.length !== 0)
                ? <TabsItem
                    onClick={()=>onClickHandler('history')}
                    selected={selectedTab === 'history'}
                >Прогресс</TabsItem>
                : null
            }

        </Tabs>
    }
}