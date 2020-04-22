import React from 'react';
import { Panel, Div, FixedLayout, Separator, Button, Link, ANDROID, platform } from '@vkontakte/vkui';
import "./LessonCard.css";
import Cover from '../Cover/Cover';
import ReactMarkdown from 'react-markdown';
import { base } from '../../airtable/airtable';
import connect from '@vkontakte/vk-connect';
import Navbar from '../Navbar/Navbar';

const osname = platform();

class LessonCard extends React.Component<any, any> {

	state = { message: null }

	componentDidMount() {
		this.checkPermissions();
		(osname === ANDROID) ? connect.send("VKWebAppSetViewSettings", { "status_bar_style": "dark", "action_bar_color": "#ffffff" }) : connect.send("VKWebAppSetViewSettings", { "status_bar_style": "dark", });
	}


	sendData = async () => {
		let data = this.props.meta;

		let opt = {
			"Профиль": [data.user.recID],
			"Баллы": 1,
			"Рубрика": data['Рубрика'],
			"Комментарий": "Запись на тренировку",
			"Покупки": [data.purchases.recID],
			"Тренировка": [data.recID]
		}

		await base.create(opt, data.rubric['Таблица']).then(res => this.setState({
			message: (() => {
				return <div>Вы записаны <Link onClick={() => this.undo(res, data.rubric['Таблица'])}>Отменить</Link></div>
			})()
		})).catch(_ => this.setState({
			message: (() => {
				return <div>Что-то сломалось. Напишите мне на <a href="mailto:reva@leandesign.pro">reva@leandesign.pro</a></div>
			})()
		}))
	}

	undo = (obj, listName) => { base.delete([obj.recID], listName).then(res => this.setState({ message: null })).catch(console.log) }


	checkPermissions = () => {
		let data = this.props.meta;
		//есть ли у него абонемент?
		let purchase = data.purchases;

		if (!purchase) return this.setState({ message: 'Для участия нужен абонемент' });

		if (!data['Участники']) return this.setState({ message: null })

		if (data['Осталось'] === 0) return this.setState({ message: 'Не осталось мест на тренировке' })

		if (data['Участники'].find(el => +el === data.user['VK-ID'])) return this.setState({ message: 'Ты в участниках' })

	}





	render() {

		let {
			onBackClick,
			meta,
		} = this.props


		return (

			<Panel id='lesson'>
				<Navbar go={onBackClick} dataTo='rubric' meta={JSON.stringify(meta['rubric'])} buttonColor="black"></Navbar>
				<Cover background="#f2f2f2" >
					<Div style={{ maxWidth: '62vw', color: 'black' }}>
						<h1>{meta['Name']}</h1>
						<div className="lead">{`${meta['Дата']}, ${meta['День недели']}`} <br />
							{meta['Время']} МСК</div>
					</Div>
				</Cover>
				<Separator />
				<Div className="desc">
					<ReactMarkdown source={meta['Описание']} />
				</Div>
				<FixedLayout vertical="bottom" className="bottomBar">
					{
						(() => {
							if (this.state.message) return <Div className="lead">{this.state.message}</Div>
							return <Button size={'l'} stretched={true} onClick={() => this.sendData()}>Записаться</Button>

						})()
					}

				</FixedLayout>
			</Panel>

		);
	}
}



export default LessonCard;