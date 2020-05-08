import React from 'react';

import { Panel, Div, FixedLayout, Separator, Button, Link, ANDROID, platform, FormLayout, File, Avatar, PopoutWrapper } from '@vkontakte/vkui';
import "./LessonCard.css";
import Cover from '../Cover/Cover';
import ReactMarkdown from 'react-markdown';
import bridge from '@vkontakte/vk-bridge';
import Navbar from '../Navbar/Navbar';
import { parseQueryString, parseDate, Time, formatLessonTime } from '../Helpers';
import { iUser, iRubric } from '../../interfaces';
import { base } from '../../Airtable';


const osname = platform();

interface iLessonCard {
	id: string
	lessonID: string
	user: iUser
	onBackClick: (route: string, meta?: any) => void
	backTo?: string
	purchases: any[]
	rubric?: iRubric
	lesson?: any
}


class LessonCard extends React.Component<iLessonCard, any> {

	_isMounted: boolean
	state = { message: null, lesson: null, rubric: null, selectedFile: null }

	constructor(props) {
		super(props)
		this._isMounted = false;
	}

	async componentDidMount() {
		this._isMounted = true;

		let { lesson, rubric } = this.props

		//если передан объект lesson, то используем его, если нет, то делаем фетч
		let les = lesson ? lesson : await this.fetchLessonData();
		if (!les) return this.props.onBackClick('profile')
		//если передана объект rubric, то используем его, если нет, то делаем фетч
		let rub = rubric ? rubric : await this.fetchRubric(les['RubricID']);
		if (this._isMounted) this.setState({ rubric: rub, lesson: les })

		if (this.state.lesson) this.checkPermissions();
		(osname === ANDROID) ? bridge.send("VKWebAppSetViewSettings", { "status_bar_style": "dark", "action_bar_color": "#ffffff" }) : bridge.send("VKWebAppSetViewSettings", { "status_bar_style": "dark", });
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	async fetchLessonData() {
		let lessons = await base.list('Тренировки', { filterByFormula: `{recID}="${this.props.lessonID}"` })
		if (!lessons[0]) return null
		let lesson = formatLessonTime(lessons[0]);
		return lesson
	}


	

	sendData = async () => {
		// let data = this.state.lesson;
		let { rubric } = this.state
		let { user, purchases, lessonID } = this.props

		let purchase = purchases.find(el => el['Рубрика'].find(rubricID => rubricID === rubric.recID))
		let opt = {
			"Датавремя": new Date().toISOString(),
			"Профиль": [user.recID],
			"Баллы": 1,
			"Рубрика": rubric.recID,
			"Комментарий": "Запись на тренировку",
			"Покупки": purchase ? [purchase.recID] : null,
			"Тренировка": [lessonID]
		}

		await base.create(opt, rubric['Таблица']).then(res => {
			const queryParams = parseQueryString(window.location.search);
			if (queryParams && queryParams.vk_are_notifications_enabled === "0") bridge.send("VKWebAppAllowNotifications", {});
			this.setState({
				message: (() => {
					return <div>Вы записаны <Link onClick={() => this.undo(res, rubric['Таблица'])}>Отменить</Link></div>
				})()
			})


		}).catch(_ => this.setState({
			message: (() => {
				return <div>Что-то сломалось. Напишите мне на <a href="mailto:reva@leandesign.pro">reva@leandesign.pro</a></div>
			})()
		}))

	}

	undo = (obj, listName) => { base.delete([obj.recID], listName).then(res => this.setState({ message: null })).catch(console.log) }


	checkPermissions = () => {

		let { lesson, rubric } = this.state

		//есть ли у него абонемент?
		let purchases = this.props.purchases || [];

		if (purchases.length === 0 && rubric['Товар']) return this.setState({ message: 'Для участия нужен абонемент' });

		if (!lesson['Участники']) return this.setState({ message: null })

		if (lesson['Осталось'] === 0) return this.setState({ message: 'Не осталось мест на тренировке' })

		if (this.props.user && !lesson['Ссылка'] && lesson['Участники'].find(el => +el === this.props.user['VK-ID'])) return this.setState({ message: '👍🏻 Ты в участниках' })
		if (this.props.user && lesson['Ссылка'] && lesson['Участники'].find(el => +el === this.props.user['VK-ID'])) return this.setState({ message: '👍🏻 Работа сдана' })

	}

	fetchRubric = (rubricID: string) => {
		return base.find(rubricID, 'Рубрики')
	}


	render() {

		let {
			onBackClick,
			id,
			user,
			backTo
		} = this.props

		let { lesson, rubric } = this.state


		if (!lesson || !user) return <div id={id}>…</div>
		let getImage = () => lesson['Обложка'] ? <Avatar src={lesson['Обложка'][0]['url']} mode="image" size={80} /> : null

		return (

			<Panel id={id}>
				<Navbar go={() => onBackClick(backTo ? backTo : 'rubric', rubric)} buttonColor="black"></Navbar>
				<Cover background="#f2f2f2" height='fit-content'>
					<Div style={{ maxWidth: '62vw', color: 'black' }}>
						<h1>{lesson['Name']}</h1>
						<div className="lead">{`${lesson['Дата']}, ${lesson['День недели']}`} <br />
							{lesson['Время']}</div>
					</Div>
				</Cover>
				<Separator />
				<Div className="desc">
					<ReactMarkdown source={lesson['Описание']} />
					{getImage()}
				</Div>
				<FixedLayout vertical="bottom" className="bottomBar" style={lesson['Участники'].find(el => +el === user['VK-ID']) ? { background: 'var(--color-spacegray)' } : {}}>
					{
						(() => {
							if (this.state.message) return <div>{this.state.message}</div>
							return lesson['Ссылка'] ? <Button size={'l'} href={lesson['Ссылка']} target="_blank" stretched={true}>Сдать работу</Button> : <Button size={'l'} stretched={true} onClick={() => this.sendData()}>Я буду</Button>
						})()
					}

				</FixedLayout>
			</Panel>

		);
	}
}



export default LessonCard;