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
        let {modalData} = this.props
        return <ModalCard
            id={this.props.id}
            onClose={() => this.props.onClose(null)}
            header={modalData ? modalData.title : ''}
            caption={modalData ? modalData.desc : ''}
            actions={modalData && modalData.onButtonClickHandler ? [{
                title: modalData ? modalData.buttonLabel : '',
                mode: 'primary', action: () => modalData ? modalData.onButtonClickHandler : null
            }] : []}
        >
            {modalData ? modalData.body : ''}
        </ModalCard>
    }
}