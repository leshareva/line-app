import React from 'react'
import { ModalCard } from '@vkontakte/vkui'
import { iModalData } from '../interfaces'

interface iModalCardComponent {
    id: string
    onClose: (foo: any) => void
    modalData: iModalData
}

export default class ModalCardComponent extends React.Component<iModalCardComponent, any> {
    render() {

        return <ModalCard
            id={this.props.id}
            onClose={() => this.props.onClose(null)}
            header={this.props.modalData ? this.props.modalData.title : ''}
            caption={this.props.modalData ? this.props.modalData.desc : ''}
            actions={[{
                title: this.props.modalData ? this.props.modalData.buttonLabel : '',
                mode: 'primary', action: () => this.props.modalData ? this.props.modalData.onButtonClickHandler : null
            }]}
        >
            {this.props.modalData ? this.props.modalData.body : ''}
        </ModalCard>
    }
}