import React from 'react'
import { Avatar, Progress } from '@vkontakte/vkui'
import LevelBubble from './LevelBubble/LevelBubble'
import { iUser } from '../../interfaces'
import { star } from '../../icons'

interface iUserComponent {
    user: iUser,
    fetchLevelsData: () => Promise<any>
}

export default class UserComponent extends React.Component<iUserComponent, any>{
    _isMounted: boolean = false

    state = {
        isLoading: false,
        levels: null
    }

    async componentDidMount() {
        this._isMounted = true
        this.setState({ isLoading: true })

        let levels = await this.props.fetchLevelsData();

        if (this._isMounted) {
            this.setState({ levels: levels, isLoading: false })
        }
    }


    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        const { user } = this.props
        let { levels } = this.state
       

        const renderLevelData = () => {
            if (!levels) return
            return <>{`${levels.need_exp_to_level_up} XP до ${+user['Уровень'] + 1} уровня`}
                <Progress value={(levels.levelExperience * 100) / (levels.next_level["Требует опыта"] - levels.current_level['Требует опыта'])} style={{ width: '100%' }} />
            </>
        }
        return <div className="amountContainer">
            <Avatar src={user.photo_200} size={72}></Avatar>
            <div className="amountWrapper">
                <span className="amount">{user['Баланс']}</span>
                <span className="star">{star('#ffffff')}</span>
                <br />
                {renderLevelData()}
                <LevelBubble className="levelBubble">{Math.round(user['Уровень'])}</LevelBubble>
            </div>
        </div>
    }
}