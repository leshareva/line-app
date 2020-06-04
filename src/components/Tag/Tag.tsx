import React from 'react'
import './Tag.css'

export default class Tag extends React.Component<any, any>{
    render() {
        return <div className="amount_counter" >{this.props.children}</div>
    }
}