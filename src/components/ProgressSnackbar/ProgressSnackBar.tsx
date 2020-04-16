import React from 'react'
import { Snackbar, InfoRow, Progress } from '@vkontakte/vkui'


export class ProgressSnackBar extends React.Component<any, any> {

    render() {
        const { header, count } = this.props
        return (
            <Snackbar
                className="snackbar"
                layout="vertical"
                onClose={() => {
                    this.setState({ snackbar: null })
                    return {}
                }}
            >
                <InfoRow header={header}>
                    <Progress value={count} style={{ width: '100%' }} />
                </InfoRow>
                <a href="https://vk.com/@lean.school-user-level" target="_blank" rel="noopener noreferrer">Зачем нужен уровень?</a>

            </Snackbar>
        )
    }

}