import React from 'react'
import { PanelHeader, platform, IOS, HeaderButton } from "@vkontakte/vkui";
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

export default class Navar extends React.Component<any, any> {
    render() {
        let { go, dataTo } = this.props
        const osname = platform();
    
        return (<PanelHeader className="navBar" style={(() => osname === IOS ? {} : { marginTop: '81px' })()} left={<HeaderButton onClick={go} data-to={dataTo}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>}>{this.props.children}</PanelHeader>)
    }
}