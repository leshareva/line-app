import React from 'react';
import { Div } from '@vkontakte/vkui'
import './Cover.css'

export default class Cover extends React.Component<any, any> {


    render() {

        const {
            background,
            height
        } = this.props
        return (
            <Div className="cover" style={{ height: height ? height : '134px', background: background ? background : 'linear-gradient(200.98deg, #485563 -13.11%, #29323C 75.28%)' }}>
                {/* {(() => content)()} */}
                <div className="coverContainer">{this.props.children}</div>
            </Div>
        )
    }
}

