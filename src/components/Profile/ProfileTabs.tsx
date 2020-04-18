import React from 'react'
import { Tabs, TabsItem } from '@vkontakte/vkui'

interface iProfileTabs {
    history: any[]
    onClickHandler: (tabName: string) => void
    selectedTab: string
}

export default class ProfileTabs extends React.Component<iProfileTabs, any> {

    render() {
        let { history, onClickHandler, selectedTab } = this.props

        return <Tabs>

            <TabsItem
                onClick={() => onClickHandler('rubrics')}
                selected={selectedTab === 'rubrics'}
            >Рубрики</TabsItem>

            {(history && history.length !== 0)
                ? <TabsItem
                    onClick={() => onClickHandler('history')}
                    selected={selectedTab === 'history'}
                >Начисления</TabsItem>
                : null
            }

        </Tabs>
    }
}