import React from 'react';
import { Panel, Div, FixedLayout, Button, Link, ANDROID, platform, Group, Header, Cell, Spinner } from '@vkontakte/vkui';
import "./EventDetailComponent.css";
import ReactMarkdown from 'react-markdown';
import bridge from '@vkontakte/vk-bridge';
import Navbar from '../../components/Navbar/Navbar';
import { parseQueryString, formatLessonTime } from '../../Helpers';
import { iUser, iRubric, iModalData } from '../../interfaces';
import { AIR_CONFIG } from '../../config'
import Airtable from '../../Airtable';
import * as Typograf from 'typograf';
import { iApi } from '../../Api';
import YouTube from 'react-youtube';
const tp = new Typograf({ locale: ['ru', 'en-US'] });

let base = new Airtable(AIR_CONFIG)


const osname = platform();

interface iEventDetailComponent {
	id: string
	lessonID: string
	user: iUser
	onBackClick: (route: string, meta?: any) => void
	backTo?: string
	fetchPurchases: ()=> Promise<any[]>
	rubric?: iRubric
	lesson?: any
	openModal: (modal: { type: string, data?: iModalData }) => void
	api: iApi
}


class EventDetailComponent extends React.Component<iEventDetailComponent, any> {

	_isMounted: boolean
	state = {
		message: null,
		lesson: null,
		rubric: null,
		selectedFile: null,
		hasAccess: null,
		good: null,
		purchases: []
	}

	constructor(props) {
		super(props)
		this._isMounted = false;
	}

	async componentDidMount() {
		await this.fetchData()
		if (this.state.lesson) this.checkPermissions();
		(osname === ANDROID) ? bridge.send("VKWebAppSetViewSettings", { "status_bar_style": "dark", "action_bar_color": "#ffffff" }) : bridge.send("VKWebAppSetViewSettings", { "status_bar_style": "dark", });
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	async fetchData() {
		this._isMounted = true;
		let { lesson, rubric } = this.props
		//если передан объект lesson, то используем его, если нет, то делаем фетч
		let les = lesson ? lesson : await this.fetchLessonData();
		if (!les) return this.props.onBackClick('profile')
		//если передан объект rubric, то используем его, если нет, то делаем фетч
		let rub = rubric ? rubric : await this.fetchRubric(les['RubricID']);
		let good = rub['Товар'] ? await this.props.api.goods.getByID(rub['Товар'][0]) : null

		let purchases = await this.props.fetchPurchases();

		if (this._isMounted) this.setState({ rubric: rub, lesson: les, good: good, purchases: purchases })
	}


	async fetchLessonData() {
		
		let lesson = await this.props.api.events.list({filterByFormula: `{recID}="${this.props.lessonID}"`}, true).then(res=>res[0])
		
		if (!lesson) return null
		return formatLessonTime(lesson)
	}


	sendData = async () => {
		// let data = this.state.lesson;
		let { rubric, purchases, lesson } = this.state
		let { user,  } = this.props

		let purchase;
		if (rubric && rubric['Товар'] && purchases)
			purchase = purchases.find(el => el['Рубрика'].find(rubricID => rubricID === rubric.recID))
		
		await this.props.api.accruals.create({
			user_rec_id: user.rec_id || user.recID,
			comment: 'Запись на тренировку',
			event_rec_id: lesson.recID,
			amount: 0,
			purchase_ids: purchase ? [purchase.rec_id] : []
		}).then(res => {
			const queryParams = parseQueryString(window.location.search);
			if (queryParams && queryParams.vk_are_notifications_enabled === "0") bridge.send("VKWebAppAllowNotifications", {});
			this.setState({
				message: (() => {
					if (!res[0]) throw new Error('error when create accural')
					return <div>Вы записаны <Link onClick={() => this.undo(res[0].recID)}>Отменить</Link></div>
				})()
			})


		}).catch(_ => this.setState({
			message: (() => {
				return <div>Что-то сломалось. Напишите мне на <a href="mailto:reva@leandesign.pro">reva@leandesign.pro</a></div>
			})()
		}))

	}

	undo = (recID: string) => { this.props.api.accruals.delete([recID]).then(res => this.setState({ message: null })).catch(console.log) }


	checkPermissions = () => {
		let { lesson, rubric } = this.state
		let purchases = this.state.purchases || [];
		let find = lesson['Участники'].find(el => +el === this.props.user['VK-ID'])
		let res = { hasAccess: true, message: null }

		if (purchases.length === 0 && rubric['Товар']) res.hasAccess = false
		if (lesson['Осталось'] === 0) res.message = 'Не осталось мест'
		if (this.props.user && !lesson['Ссылка'] && find) res = { hasAccess: false, message: "Ты в участниках" }
		if (this.props.user && lesson['Ссылка'] && find) res = { hasAccess: false, message: '👍🏻 Работа сдана' }

		this.setState(res)

	}

	fetchRubric = (rubricID: string) => base.find(rubricID, 'Рубрики')



	render() {

		let {
			onBackClick,
			id,
			user,
			backTo,
			openModal
		} = this.props

		let { lesson, rubric } = this.state


		let renderInstruction = () => ( <YouTube videoId={lesson.event_type['instruction_video_id']} className="video" />)

		let renderPaymentBlock = () => {
			if (!this.state.good) return null

			let good = this.state.good;
			return <>
				<Header mode="primary">{good['Название']}</Header>
				<Div style={{ padding: '0 var(--wrapper-padding-2x) var(--wrapper-padding-2x) var(--wrapper-padding-2x)' }}>
					<ReactMarkdown source={good['Description']} />
					<Button size="l" stretched={true} href={`https://app.leandesign.pro/p/pay?user_id=${user["VK-ID"]}&force=true`} target="_blank">Подписаться</Button>
				</Div>

			</>

		}

		let renderInstrButton = () => {
			return lesson.event_type['instruction_video_id']
				? <Button
					size={'m'}
					stretched={true}
					onClick={() => openModal(!this.state.hasAccess ? { type: 'paid', data: { body: renderPaymentBlock() } } : { type: 'modal', data: { title: '', body: renderInstruction() } })}
				>
					Теория
					</Button> : null
		}

		let renderDetails = () => {
			let result = []
			if (lesson.event_type && lesson.event_type['Разбор'])
				result.push(<Cell key={1} description={lesson.event_type['Разбор']}>Разбор</Cell>)


			if (lesson['Опыт'] && lesson['Опыт'] !== 0)
				result.push(<Cell key={2} description={`Холодно — ${lesson['Опыт']}, Тепло — ${lesson['Опыт'] * 2}, Горячо — ${lesson['Опыт'] * 3}`} multiline={true}>Получите опыта</Cell>)

			return result
		}

		if (!lesson || !user) return <div id={id} style={{ marginTop: '40px' }}><Spinner size="medium" /></div>


		let renderBottomBar = () => {
			if (this.state.message) return <div>{this.state.message}</div>
			let label = lesson['Ссылка'] ? 'К выполнению' : 'Я буду'
			if (this.state.hasAccess === false) return <Button size={'l'} onClick={() => openModal({ type: 'paid', data: { title: 'Подписка', body: renderPaymentBlock() } })} stretched={true}>{label}</Button>
			return lesson['Ссылка'] ? <Button size={'l'} href={lesson['Ссылка']} target="_blank" stretched={true}>{label}</Button> : <Button size={'l'} stretched={true} onClick={() => this.sendData()}>{label}</Button>
		}

		let renderDetailsBlock = () => {
			let details = renderDetails();
			if (details.length === 0) return
			return <Group separator="hide" style={{ backgroundColor: "var(--color-gray)", paddingBottom: '80px' }}>
				<Header mode="secondary">Детали</Header>
				{details}
			</Group>
		}

		let description = lesson.event_type&&lesson.event_type['Описание'] ? lesson.event_type['Описание'] : lesson['Описание']

		return (

			<Panel id={id}>
				<Navbar go={() => onBackClick(backTo ? backTo : 'profile', rubric)} buttonColor="black"></Navbar>
				<Header mode="primary">{lesson.event_type['Name']}</Header>

				<Div className="lesson-body">
					<ReactMarkdown source={tp.execute(description)} />
					{renderInstrButton()}
				</Div>


				{renderDetailsBlock()}

				<FixedLayout vertical="bottom" className="bottomBar" >{renderBottomBar()}</FixedLayout>
			</Panel>

		);
	}
}



export default EventDetailComponent;