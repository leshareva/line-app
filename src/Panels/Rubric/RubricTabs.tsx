import React from 'react'
import { Tabs, TabsItem, HorizontalScroll } from '@vkontakte/vkui'

interface iRubricTabs {
    rubric: any
    history: any[]
    lessons: any[]
    onClickHandler: (tabName: string) => void
    selectedTab: string
}

export default class RubricTabs extends React.Component<iRubricTabs, any> {

    render() {
        let { rubric, history, onClickHandler, selectedTab, lessons } = this.props
        
        return <Tabs>
            <HorizontalScroll>
            {(lessons)
                ?
                <TabsItem
                    onClick={() => onClickHandler('schedule')}
                    selected={selectedTab === 'schedule'}
                >Расписание</TabsItem>
                : null

            }



            {(history && history.length !== 0)
                ? <TabsItem
                    onClick={() => onClickHandler('history')}
                    selected={selectedTab === 'history'}
                >Прогресс</TabsItem>
                : null
            }

            {(rubric['Описание'])
                ? <TabsItem
                    onClick={() => onClickHandler('desc')}
                    selected={selectedTab === 'desc'}
                >О рубрике</TabsItem>
                : null

            }

            </HorizontalScroll>
            
        </Tabs>
    }
}