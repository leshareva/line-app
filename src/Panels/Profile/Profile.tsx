import React from 'react'

import { Panel, PanelHeader, platform, ANDROID } from '@vkontakte/vkui'

import "./Profile.css"
import Cover from '../../components/Cover/Cover'
import { logo } from '../../icons'

import ProfileTabs from './ProfileTabs'
import HistoryList from '../../components/HistoryList'
import AchievesList from './AchievesList'
import { iModalData, iUser } from '../../interfaces'

import { iApi } from '../../Api'

import RubricsList from './RubricsList'
import UserComponent from './UserComponent'
import TasksComponent from './TasksComponent'

interface iProfilePage {
    id: string,
    go: (route: string, meta?: any) => void
    user: iUser
    snackbar: any
    fetchHistory: () => Promise<any[]>
    openModal: (modal: { type: string, data?: iModalData }) => void
    api: iApi
    fetchEvents: () => Promise<any[]>
    fetchRubrics: () => Promise<any[]>
    fetchAchieves: () => Promise<any[]>
    fetchLevelsData: () => Promise<any>
    fetchTasks: () => Promise<any[]>
}



class Profile extends React.Component<iProfilePage, any> {

    

    constructor(props) {
        super(props)

        this.state = {
            tabs: ['rubrics', 'history', 'achieves', 'tasks'],
            selectedTab: 'tasks',
            events: [],
            isLoading: false
        }
    }

    render() {

        let {
            user,
            go,
            snackbar,
            fetchAchieves,
            fetchRubrics,
            fetchLevelsData,
            fetchTasks,
            fetchEvents,
            openModal
        } = this.props



        return (

            <Panel id='profile'  >
                <PanelHeader></PanelHeader>
                <Cover >
                    <div className="logo-wrapper">
                        <div className="logo" style={{ top: (platform() === ANDROID) ? '25px' : '37px' }}>{logo}</div>
                        <a href="https://vk.com/@lean.school-s-chego-nachat-obuchenie-v-line" target="_blank" className="logo-help">С чего начать</a>
                    </div>

                    <UserComponent user={user} fetchLevelsData={fetchLevelsData} />
                </Cover>

                <ProfileTabs tabs={this.state.tabs} selectedTab={this.state.selectedTab} onClickHandler={(tabName) => this.setState({ selectedTab: tabName })} />

                {(() => {
                    if (this.state.selectedTab === 'tasks') return (<TasksComponent fetchEvents={fetchEvents} fetchTasks={fetchTasks} go={go}/>)
                    if (this.state.selectedTab === 'achieves') return <AchievesList fetchAchieves={fetchAchieves} openModal={openModal} user={user} onButtonClick={go} />
                    if (this.state.selectedTab === 'rubrics') return <RubricsList fetchRubrics={fetchRubrics} go={this.props.go} />
                    if (this.state.selectedTab === 'history') return <HistoryList fetchHistory={this.props.fetchHistory} openModal={this.props.openModal} />
                })()}

                {snackbar}


            </Panel>

        )
    }
}



export default Profile