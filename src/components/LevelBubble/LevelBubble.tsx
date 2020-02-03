import React from 'react';
import './LevelBubble.css'

export default class LevelBubble extends React.Component<any, any> {
    render() {

        let {
            action
        } = this.props

        return (
            <div className="levelBubble" onClick={action}>{this.props.children}</div>
        )
    }
}