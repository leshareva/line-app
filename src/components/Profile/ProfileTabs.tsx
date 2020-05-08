import React from 'react'
import { Tabs, TabsItem, HorizontalScroll } from '@vkontakte/vkui'

interface iProfileTabs {
    tabs: string[]
    history: any[]
    onClickHandler: (tabName: string) => void
    selectedTab: string
}

export default class ProfileTabs extends React.Component<iProfileTabs, any> {

    render() {
        let { history, onClickHandler, selectedTab, tabs } = this.props

        if (!tabs||tabs.length === 0) return null

        return <Tabs>
            <HorizontalScroll>
                
                {
                    (() => {
                        if (tabs.find(el => el === 'tasks')) {
                            return <TabsItem
                                onClick={() => onClickHandler('tasks')}
                                selected={selectedTab === 'tasks'}
                            >Задания</TabsItem>
                        }
                    })()
                }

                {
                    (() => {
                        if (tabs.find(el => el === 'rubrics')) {
                            return <TabsItem
                                onClick={() => onClickHandler('rubrics')}
                                selected={selectedTab === 'rubrics'}
                            >Рубрики</TabsItem>
                        }
                    })()
                }



                {(history && history.length !== 0 && tabs.find(el => el === 'history'))
                    ? <TabsItem
                        onClick={() => onClickHandler('history')}
                        selected={selectedTab === 'history'}
                    >Начисления</TabsItem>
                    : null
                }
            </HorizontalScroll>
        </Tabs>
    }
}