import React from 'react';
import connect from '@vkontakte/vk-connect';
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


const tp = new Typograf({ locale: ['ru', 'en-US'] });

const splashLoader = <div style={{ width: '100%', height: '100%', backgroundColor: '#770EFD' }}><img src={splash} style={{ width: '100%', height: '100%' }} alt="loading..." /></div>;

const osname = platform();


interface iAppState {
	user: iUser
	activeView: string
	// activeStory: string
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

	constructor(props) {
		super(props);



		this.state = {
			user: null,
			activeView: 'profile',
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
		// this.onStoryChange = this.onStoryChange.bind(this);
		this.setActiveModal = this.setActiveModal.bind(this);

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

		this.setState({ isLoading: true })

		connect.subscribe(async (e: any) => {
			switch (e.detail.type) {
				case 'VKWebAppGetUserInfoResult':
					this.setState({ rubrics: await this.fetchRubricsData() })
					this.setState({ history: await this.fetchHistoryData(this.state.rubrics, e.detail.data) })
					let userData = await this.fetchUserData(e.detail.data);
					
					let exp = Math.round(userData['Опыт'] ? userData['Опыт'] : 0);
					let sl = exp.toString()
					userData.levelExperience = (sl.length > 3) ? +sl.slice(sl.length - 3) : +sl

					this.setState({ user: Object.assign(e.detail.data, userData) })
					this.setState({ achieves: await this.fetchAchieves() as any[] })
					
					this.setState({ isLoading: false })
					break;
				case 'VKWebAppAccessTokenReceived':
					this.setState({ authToken: e.detail.data.access_token });
					break;
				case 'VKWebAppViewRestore':
					break;
				default:

			}
		});

		(osname === ANDROID) ? connect.send("VKWebAppSetViewSettings", { "status_bar_style": "light", "action_bar_color": "#000000" }) : connect.send("VKWebAppSetViewSettings", { "status_bar_style": "light", });
		connect.send('VKWebAppGetUserInfo', {});

	}


	componentWillUnmount() {
		connect.unsubscribe((data) => {
			console.log(data)
		});
	}





	async fetchUserData(user: iUser): Promise<iUser> {
		let fields = new iUser()
		let data: iUser
		data = await base.list('Участники', {
			filterByFormula: `{${R_VK_ID}} = ${user.id}`, fields: Object.keys(fields).filter(key=>fields[key]!==undefined)
		}).then(res => res[0]);

		return data ? data : base.create({ 'Имя': `${user.first_name} ${user.last_name}`, [R_VK_ID]: user.id }, 'Участники')
			.then(res => base.create({
				"Баллы": AMOUNT_TO_NEW_USER,
				"Профиль": [res.recID],
				"Комментарий": "Первое начисление"
			}, "Начисления: разминки"))

	}



	async fetchRubricsData(): Promise<iRubric[]> {
		let fields = new iRubric();
		
		let rubrics = await base.list('Рубрики', {
			filterByFormula: '{Опубликовано} = TRUE()', 
			fields: Object.keys(fields).filter(key=>fields[key]!==undefined)
			
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
			fields: Object.keys(fields).filter(key=>fields[key]!==undefined)
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
					fields: Object.keys(fields).filter(key=>fields[key]!==undefined)
				})
		)

		return Promise.all(proms).then((res: Array<[]>) => [].concat(...res))
	}


	// onStoryChange = (e) => this.setState({ activeStory: e.currentTarget.dataset.story })

	setLocation = (route: string) => {
		if (route !== 'profile') {
			connect.send('VKWebAppSetLocation', { location: route });
		} else {
			connect.send('VKWebAppSetLocation', { location: '' });
		}
	}

	openSnackbar() {
		if (this.state.snackbar) return;
		let percent = this.state.user.levelExperience
		this.setState({
			snackbar: <ProgressSnackBar header={`${percent} / 1000 ед. опыта`} count={percent * 0.1} />
		});
	}

	go = async (e: React.MouseEvent<HTMLElement>) => {
		const route = e.currentTarget.dataset.to;
		const meta = e.currentTarget.dataset.meta;
		const parseMeta = meta ? JSON.parse(meta) : null
		if (parseMeta) this.setState({ meta: parseMeta })

		this.setState({ activeView: route })
		return
	};


	onRubricCellClickHandler = (route: string, meta: any) => {
		this.setState({ activeView: route })
		this.setState({ meta: meta })
	}


	render() {
		const { user, isLoading, history, rubrics, achieves } = this.state;
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
					rubric={this.state.meta}
					go={this.go}
					rubricCellClickHandler={this.onRubricCellClickHandler}
				/>
				<LessonCard
					id="lesson"
					onBackClick={this.go}
					meta={this.state.meta}
					user={user}
				/>
			</View >
		)
	}
}


export default App;

