import React from 'react'
import { Group, List, Cell, Avatar } from '@vkontakte/vkui'
import Icon24BrowserForward from '@vkontakte/icons/dist/24/browser_forward'

interface iRubricsList {
    go: (route: string, meta?: any) => void
    fetchRubrics: () => Promise<any[]>
}


export default class RubricsList extends React.Component<iRubricsList, any> {

    _isMounted: boolean = false

    state = {
        rubrics: []
    }

    async componentDidMount() {

        this._isMounted = true
        this.setState({ isLoading: true })

        const rubrics = await this.props.fetchRubrics()

        if (this._isMounted) {
            this.setState({ rubrics: rubrics })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        let { go } = this.props

        if(this.state.rubrics.length === 0) return <></>
        return <Group title="Рубрики" >
            <List>
                {this.state.rubrics.map((rubric, i) => {
                    let cover = () => rubric['Обложка'] ? <Avatar mode="image" src={rubric['Обложка'][0]['url']} size={72} /> : ""
                    return (<Cell
                        key={i}
                        before={cover()}
                        multiline
                        description={rubric['desc']}
                        asideContent={<Icon24BrowserForward fill="var(--icon_secondary)" />}
                        onClick={(e) => go('rubric', rubric)}
                    >{rubric['Название']}</Cell>)
                })}
            </List>
        </Group>
    }
}