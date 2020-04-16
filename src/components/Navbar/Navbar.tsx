import React from 'react'
import { PanelHeader, platform, IOS, PanelHeaderBack } from "@vkontakte/vkui";


export default class Navar extends React.Component<any, any> {
    render() {
        let { go, dataTo, meta, buttonColor} = this.props
        const osname = platform();
    
        return (<PanelHeader className="navBar" style={(() => osname === IOS ? {} : { marginTop: '81px' })()} left={<PanelHeaderBack onClick={go} data-to={dataTo} data-meta={meta} style={{color: buttonColor}}/>}>{this.props.children}</PanelHeader>)
    }
}