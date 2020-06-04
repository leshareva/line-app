import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import { platform, ANDROID, View, ModalRoot, ModalPage, ModalPageHeader, PanelHeaderButton } from '@vkontakte/vkui';
import * as Typograf from 'typograf';
import { air_schema } from 'lean-air';
import splash from './img/splash.GIF';
import '@vkontakte/vkui/dist/vkui.css';
import "./main.css";
import Rubric from './Panels/Rubric/Rubric';
import Profile from './Panels/Profile/Profile';
import EventDetailComponent from './Panels/EventDetailComponent/EventDetailComponent';
import { iModalData, iUser, iRubric, iAchieve } from './interfaces';
import ModalCardComponent from './components/ModalCardComponent';
import { parseQueryString } from './Helpers';
import Airtable from './Airtable'
import { AIR_CONFIG } from './config'
import Api from './Api'
import { iGoodsListOption } from './Api'
import { formatLessonTime } from './Helpers'

let base = new Airtable(AIR_CONFIG)
let api = new Api({ airtable_conf: AIR_CONFIG })

const tp = new Typograf({ locale: ['ru', 'en-US'] });
const splashLoader = <div style={{ width: '100%', height: '100%', backgroundColor: '#770EFD' }}><img src={splash} style={{ width: '100%', height: '100%' }} alt="loading..." /></div>;

const osname = platform();


interface iAppState {
	user: iUser
	activeView: string
	activeModal: string
	modalData: iModalData
	authToken: string
	isLoading: boolean
	history: any[]
	rubrics: iRubric[]
	meta: any
	snackbar: any
	purchases: any[]
	achieves: any[]
	events: any[]
	lessons: any[]
}

class App extends React.Component<any, iAppState> {

	_isMounted: boolean

	constructor(props) {
		super(props);

		this.state = {
			user: null,
			activeView: null,
			activeModal: null,
			modalData: null,
			authToken: null,
			isLoading: false,
			history: [],
			rubrics: [],
			meta: {},
			snackbar: null,
			purchases: null,
			achieves: null,
			events: null,
			lessons: []
		};

		this.setActiveModal = this.setActiveModal.bind(this);
		this.fetchHistoryData = this.fetchHistoryData.bind(this);
		this.fetchUserPurchases = this.fetchUserPurchases.bind(this);
		this.fetchTasksByUser = this.fetchTasksByUser.bind(this);
		this.fetchEvents = this.fetchEvents.bind(this);
		this.fetchLevelsData = this.fetchLevelsData.bind(this);
		this._isMounted = false
	}



	setActiveModal(modal: { type: string, data?: iModalData }) {
		let activeModal = modal ? modal.type : null
		let modalData = modal ? modal.data : null
		this.setState({
			activeModal,
			modalData
		})
	}



	async componentDidMount() {

		this.setState({ isLoading: true })

		bridge.subscribe(async (e: any) => {
			switch (e.detail.type) {
				case 'VKWebAppGetUserInfoResult':
					this._isMounted = true;
					let userData = await this.fetchUserData(e.detail.data);

					if (!userData) return

					if (this._isMounted)
						this.setState({ user: Object.assign(e.detail.data, userData) })

					const hashParams = parseQueryString(window.location.hash);

					if (hashParams.r === 'lesson' && hashParams.id)
						this.setState({ activeView: 'lesson', meta: { lessonID: hashParams.id }, isLoading: false })
					else
						this.setState({ activeView: 'profile', isLoading: false })
					break;
				case 'VKWebAppAccessTokenReceived':
					this.setState({ authToken: e.detail.data.access_token });
					break;
				case 'VKWebAppViewRestore':
					break;
				case 'VKWebAppAllowNotificationsResult':
					break;
				default:

			}
		});

		(osname === ANDROID) ? bridge.send("VKWebAppSetViewSettings", { "status_bar_style": "light", "action_bar_color": "#000000" }) : bridge.send("VKWebAppSetViewSettings", { "status_bar_style": "light", });
		bridge.send('VKWebAppGetUserInfo', {});

	}


	componentWillUnmount() {
		this._isMounted = false;
	}


	fetchUserData = (user: iUser): Promise<any> => api.users.initUser({
		vk_id: user.id, name: `${user.first_name} ${user.last_name}`,
	})


	async fetchLevelsData(): Promise<any> {
		let userData = this.state.user
		return api.levels.list({
			filterByFormula: `OR({Number}=${userData['Уровень'] + 1}, {Number}=${userData['Уровень']})`
		}).then(res => {
			let next_level = res.find(el => +el.Number === +userData['Уровень'] + 1)
			let current_level = res.find(el => +el.Number === +userData['Уровень'])
			return {
				next_level: next_level,
				current_level: current_level,
				need_exp_to_level_up: next_level["Требует опыта"] - current_level['Требует опыта'],
				levelExperience: userData['Опыт'] - current_level['Требует опыта']
			}
		})
	}


	async fetchUserPurchases(): Promise<any> {
		return base.list(air_schema.t_purchases, { filterByFormula: `AND({${air_schema.f_purchases.vk_id}}=${this.state.user['VK-ID']}, NOT({${air_schema.f_purchases.status}}="Архив"))` })
	}



	async fetchRubricsData(): Promise<iRubric[]> {
		let fields = new iRubric();

		let rubrics = await base.list('Рубрики', {
			filterByFormula: '{Опубликовано} = TRUE()',
			fields: Object.keys(fields).filter(key => fields[key] !== undefined)

		}).catch(e => []) as iRubric[]

		return rubrics.map((obj: iRubric) => {
			if (obj['Описание']) {
				obj['Описание'] = tp.execute(obj['Описание']);
				obj.desc = obj['Описание'].replace(/[*#|]/gs, '').slice(0, 60)
				if (obj.desc.length < obj['Описание'].length) obj.desc = obj.desc + "…"
			}

			return obj
		}) as iRubric[];

	}


	fetchAchieves() {
		let fields = new iAchieve();
		return base.list('Ачивки', {
			sort: [{ field: 'Кол-во работ', direction: 'asc' }, { field: 'Сложность', direction: 'asc' }],
			filterByFormula: 'NOT({Опубликовано}=BLANK())',
			fields: Object.keys(fields).filter(key => fields[key] !== undefined)
		}).catch(e => [])
	}

	async fetchHistoryData(): Promise<any[]> {
		return api.accruals.list({
			max_records: 20,
			vk_id: this.state.user["VK-ID"],
		})
	}

	async fetchTasksByUser() {
		let user = this.state.user
		let filter = user.visited_events ? `AND(${user.visited_events.map(el => `NOT({recID}="${el}")`).join(',')})` : null
		return api.events.list({
			filterByFormula: filter,
			view: 'На главной в Линии',
			maxRecords: 10
		}, true).then((res: any[]) => {
			if (res.length === 0) return res
			return res.filter(
				(thing, i, arr) => arr.findIndex(t => t.event_type_id === thing.event_type_id) === i
			);

		})

	}

	setLocation = (route: string) => {
		if (route !== 'profile') {
			bridge.send('VKWebAppSetLocation', { location: route });
		} else {
			bridge.send('VKWebAppSetLocation', { location: '' });
		}
	}


	go = (route: string, meta?: any) => {
		if (meta) this.setState({ meta: meta })
		this.setState({ activeView: route })
		return
	};

	onRubricCellClickHandler = (route: string, meta: any) => {
		this.setState({ activeView: route })
		this.setState({ meta: meta })
	}

	fetchEvents = async () => {
		return api.events.list({ view: 'Ближайшие', filterByFormula: `NOT({Дата}=BLANK())` }, true).then(res => res.filter(el => el['Рубрика'] !== 'Design Exp').map(el => formatLessonTime(el)))
	}
	fetchGoods = async (params?: iGoodsListOption) => api.goods.list(params)



	render() {

		const {
			user,
			isLoading,
			meta
		} = this.state;

		if (!user || isLoading) return splashLoader;



		const modal =
			(<ModalRoot
				activeModal={this.state.activeModal}
				onClose={() => this.setState({ activeModal: null })}
			>

				<ModalCardComponent
					id='modal'
					onClose={() => this.setActiveModal(null)}
					modalData={this.state.modalData} />

				<ModalPage
					id='paid'
					onClose={() => this.setActiveModal(null)}
					header={
						<ModalPageHeader
							right={<PanelHeaderButton onClick={() => this.setActiveModal(null)}>Закрыть</PanelHeaderButton>}
						></ModalPageHeader>
					}
					settlingHeight={100}
				>
					{this.state.modalData ? this.state.modalData.body : null}

				</ModalPage>
			</ModalRoot>)

		return (
			<View id="main" activePanel={this.state.activeView} modal={modal}>
				<Profile
					id="profile"
					snackbar={this.state.snackbar}
					fetchRubrics={this.fetchRubricsData}
					go={this.go}
					user={user}
					fetchHistory={this.fetchHistoryData}
					fetchAchieves={this.fetchAchieves}
					fetchLevelsData={this.fetchLevelsData}
					openModal={(modal) => this.setActiveModal(modal)}
					fetchTasks={this.fetchTasksByUser}
					api={api}
					fetchEvents={this.fetchEvents}
				/>
				<Rubric
					id='rubric'
					user={user}
					rubric={meta}
					go={this.go}
					rubricCellClickHandler={this.go}
					getLessons={this.fetchEvents}
				/>
				<EventDetailComponent
					id="lesson"
					onBackClick={this.go}
					lessonID={meta.lessonID}
					lesson={meta.lesson}
					user={user}
					fetchPurchases={this.fetchUserPurchases}
					backTo={meta.backTo}
					openModal={(modal) => this.setActiveModal(modal)}
					api={api}
				/>
			</View >
		)
	}
}


export default App;

