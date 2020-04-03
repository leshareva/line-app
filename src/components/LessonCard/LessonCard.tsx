import React from 'react';
import PropTypes from 'prop-types';
import { Panel, PanelHeaderBack, PanelHeader, Div, FixedLayout, Separator, Button } from '@vkontakte/vkui';
import "./LessonCard.css";
import Cover from '../Cover/Cover';
import ReactMarkdown from 'react-markdown';
import { base } from '../../airtable/airtable';



class LessonCard extends React.Component<any, any> {



	sendData = async () => {
		let data = this.props.meta;
		let opt = {
			"Профиль": [data.sprintData.recID],
			"Баллы": 1,
			"Рубрика": data['Рубрика'],
			"Комментарий": "Запись на тренировку",
			"Покупки": [data.purchases.recID],
			"Тренировка": [data.recID]
		}

		await base.create(opt, data.rubric['Таблица'])
	}


	checkPermissions = (): { success: boolean, text: string } => {
		let data = this.props.meta;
		//есть ли у него абонемент?
		let purchase = data.purchases;


		if (!purchase) return { success: false, text: 'Для участия нужен абонемент' };

		if (!data['Участники']) return { success: true, text: '' }

		if (data['Осталось'] === 0) return { success: false, text: 'Не осталось мест на тренировке' }

		if (data['Участники'].find(el => +el === data.sprintData['VK-ID'])) return { success: false, text: 'Вы записаны' }

		return { success: true, text: '' }
	}


	


	render() {

		let {
			onBackClick,
			meta,
		} = this.props

		console.log(meta);
		return (

			<Panel id='lesson'>
				<PanelHeader left={<PanelHeaderBack onClick={onBackClick} data-to="rubric" data-meta={JSON.stringify(meta['rubric'])} />}></PanelHeader>
				<Cover background="white" >
					<Div style={{ color: 'black', maxWidth: '62vw' }}>
						<h1>{meta['Name']}</h1>
						<div className="lead">{`${meta['Дата']}, ${meta['День недели']}`} <br />
							{meta['Время']}—{meta['Окончание']} МСК</div>
					</Div>
				</Cover>
				<Separator />
				<Div>
					<ReactMarkdown source={meta['Описание']} />
				</Div>
				<FixedLayout vertical="bottom" className="bottomBar">
					{
						(() => {

							const perm = this.checkPermissions();
							if (perm.success) return <Button size={'l'} stretched={true} onClick={() => this.sendData()}>Записаться</Button>
							if (!perm.success) return <Div className="lead">{perm.text}</Div>

						})()
					}

				</FixedLayout>
			</Panel>

		);
	}
}

LessonCard.propTypes = {
	id: PropTypes.string.isRequired,
};

export default LessonCard;