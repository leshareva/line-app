import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import { platform, ANDROID, View, ModalRoot } from '@vkontakte/vkui';
import * as Typograf from 'typograf';

import { base } from './airtable/airtable';
import { R_VK_ID } from './airtable/constants';

import splash from './img/splash.GIF';
import '@vkontakte/vkui/dist/vkui.css';
import "./main.css";

import { AMOUNT_TO_NEW_USER } from './constants';
import Rubric from './components/Rubric/Rubric';
import Profile from './components/Profile/Profile';

import LessonCard from './components/LessonCard/LessonCard';

import { ProgressSnackBar } from './components/ProgressSnackbar/ProgressSnackBar';
import { iModalData, iUser, iRubric, iAchieve, iHistoryItem } from './interfaces';
import ModalCardComponent from './components/ModalCardComponent';
import { parseQueryString } from './components/Helpers';


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
			achieves: null
		};

		this.openSnackbar = this.openSnackbar.bind(this);
		this.setActiveModal = this.setActiveModal.bind(this);
		this._isMounted = false
	}



	setActiveModal(modal: { type: string, data: iModalData }) {
		let activeModal = modal ? modal.type : null
		let modalData = modal ? modal.data : null
		this.setState({
			activeModal,
			modalData
		})
	}



	async componentDidMount() {

		this._isMounted = true;

		this.setState({ isLoading: true })

		bridge.subscribe(async (e: any) => {
			switch (e.detail.type) {
				case 'VKWebAppGetUserInfoResult':
					let rubrics = await this.fetchRubricsData()
					let history = await this.fetchHistoryData(rubrics, e.detail.data)
					let userData = await this.fetchUserData(e.detail.data);
					let purchases = await this.fetchUserPusrchases(userData["VK-ID"]);
					let exp = Math.round(userData['Опыт'] ? userData['Опыт'] : 0);
					let achieves = await this.fetchAchieves() as any[];
					let sl = exp.toString()
					userData.levelExperience = (sl.length > 3) ? +sl.slice(sl.length - 3) : +sl



					this.setState({
						rubrics: rubrics,
						history: history,
						purchases: purchases,
						user: Object.assign(e.detail.data, userData),
						achieves: achieves
					})

					const hashParams = parseQueryString(window.location.hash);

					if (hashParams.r === 'lesson' && hashParams.id) {
						this.setState({ activeView: 'lesson', meta: { lessonID: hashParams.id }, isLoading: false })
					} else {
						this.setState({ activeView: 'profile', isLoading: false })
					}



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





	async fetchUserData(user: iUser): Promise<iUser> {
		let fields = new iUser()
		let data: iUser
		data = await base.list('Участники', {
			filterByFormula: `{${R_VK_ID}} = ${user.id}`, fields: Object.keys(fields).filter(key => fields[key] !== undefined)
		}).then(res => res[0]);

		return data ? data : base.create({ 'Имя': `${user.first_name} ${user.last_name}`, [R_VK_ID]: user.id }, 'Участники')
			.then(res => base.create({
				"Баллы": AMOUNT_TO_NEW_USER,
				"Профиль": [res.recID],
				"Комментарий": "Первое начисление"
			}, "Начисления: разминки"))

	}

	async fetchUserPusrchases(userID: number): Promise<any> {
		return base.list('Покупки', { filterByFormula: `AND({VK-ID}=${userID}, NOT({Статус}="Архив"))` })
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

	async fetchHistoryData(rubrics: any[], user: any) {
		let fields = new iHistoryItem();
		let proms = rubrics.map(rubric =>
			base.list(
				rubric['Таблица'],
				{
					view: 'Последний месяц',
					sort: [{ field: 'Датавремя', direction: 'desc' }],
					maxRecords: 10,
					filterByFormula: `{VK-ID} = ${user.id}`,
					fields: Object.keys(fields).filter(key => fields[key] !== undefined)
				})
		)

		return Promise.all(proms).then((res: Array<[]>) => [].concat(...res))
	}


	// onStoryChange = (e) => this.setState({ activeStory: e.currentTarget.dataset.story })

	setLocation = (route: string) => {
		if (route !== 'profile') {
			bridge.send('VKWebAppSetLocation', { location: route });
		} else {
			bridge.send('VKWebAppSetLocation', { location: '' });
		}
	}

	openSnackbar() {
		if (this.state.snackbar) return;
		let percent = this.state.user.levelExperience
		this.setState({
			snackbar: <ProgressSnackBar header={`${percent} / 1000 ед. опыта`} count={percent * 0.1} />
		});
	}

	go = (route: string, meta?: any) => {
		if (meta) this.setState({ meta: meta })
		this.setState({ activeView: route })
		return
	};

	// go = async (route: string, meta: any) => {
	// 	const route = e.currentTarget.dataset.to;
	// 	const meta = e.currentTarget.dataset.meta;
	// 	const parseMeta = meta ? JSON.parse(meta) : null
	// 	if (parseMeta) this.setState({ meta: parseMeta })

	// 	this.setState({ activeView: route })
	// 	return
	// };

	onRubricCellClickHandler = (route: string, meta: any) => {
		this.setState({ activeView: route })
		this.setState({ meta: meta })
	}


	render() {

		const {
			user,
			isLoading,
			history,
			rubrics,
			achieves,
			purchases,
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

			</ModalRoot>)

		return (
			<View id="main" activePanel={this.state.activeView} modal={modal}>
				<Profile
					id="profile"
					snackbar={this.state.snackbar}
					openSnackbar={this.openSnackbar}
					rubrics={rubrics}
					go={this.go}
					user={user}
					history={history}
					achieves={achieves}
					openModal={(modal) => this.setActiveModal(modal)}
				/>
				<Rubric
					id='rubric'
					user={user}
					rubric={meta}
					go={this.go}
					rubricCellClickHandler={this.go}
				/>
				<LessonCard
					id="lesson"
					onBackClick={this.go}
					lessonID={meta.lessonID}
					user={user}
					purchases={purchases}
				/>
			</View >
		)
	}
}


export default App;

