import React from 'react';
import connect from '@vkontakte/vk-connect';
import { platform, ANDROID, View } from '@vkontakte/vkui';

import { base } from './airtable/airtable';
import { R_VK_ID } from './airtable/constants';

import splash from './img/splash.GIF';
import '@vkontakte/vkui/dist/vkui.css';
import "./main.css";

import { AMOUNT_TO_NEW_USER } from './constants';
import Rubric from './components/Rubric/Rubric';
import Profile from './components/Profile/Profile';

import LessonCard from './components/LessonCard/LessonCard';
import * as Typograf from 'typograf';
import { ProgressSnackBar } from './components/ProgressSnackbar/ProgressSnackBar';


const tp = new Typograf({ locale: ['ru', 'en-US'] });

const splashLoader = <div style={{ width: '100%', height: '100%', backgroundColor: '#770EFD' }}><img src={splash} style={{ width: '100%', height: '100%' }} alt="loading..." /></div>;

const osname = platform();


class App extends React.Component<any, any> {

	constructor(props) {
		super(props);

		this.state = {
			user: null,
			activeView: 'profile',
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
		this.onStoryChange = this.onStoryChange.bind(this);

	}

	async componentDidMount() {

		this.setState({ isLoading: true })

		connect.subscribe(async (e: any) => {
			switch (e.detail.type) {
				case 'VKWebAppGetUserInfoResult':
					this.setState({ rubrics: await this.fetchRubricsData() })
					this.setState({ history: await this.fetchHistoryData(this.state.rubrics, e.detail.data) })
					this.setState({ user: Object.assign(e.detail.data, await this.fetchUserData(e.detail.data)) })
					this.setState({ achieves: await this.fetchAchieves() })
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





	async fetchUserData(user: any) {
		let data = await base.list('Участники', { filterByFormula: `{${R_VK_ID}} = ${user.id}` }).then(res => res[0]);

		return data ? data : base.create({ 'Имя': `${user.first_name} ${user.last_name}`, [R_VK_ID]: user.id }, 'Участники')
			.then(res => base.create({
				"Баллы": AMOUNT_TO_NEW_USER,
				"Профиль": [res.recID],
				"Комментарий": "Первое начисление"
			}, "Начисления: разминки"))
	}

	async fetchRubricsData() {
		let rubrics = await base.list('Рубрики', { filterByFormula: '{Опубликовано} = TRUE()' }).catch(e => []) as any[]

		return rubrics.map(obj => {
			if (obj['Описание']) {
				obj['Описание'] = tp.execute(obj['Описание']);
				obj.desc = obj['Описание'].replace(/[*#|]/gs, '').slice(0, 60)
				if (obj.desc.length < obj['Описание'].length) obj.desc = obj.desc + "…"
			}

			return obj
		})
	}


	fetchAchieves() {
		return base.list('Ачивки', { filterByFormula: '{Опубликовано} = TRUE()' }).catch(e => [])
	}

	async fetchHistoryData(rubrics: any[], user: any) {
		let proms = rubrics.map(rubric =>
			base.list(
				rubric['Таблица'],
				{
					view: 'Последний месяц',
					sort: [{ field: 'Датавремя', direction: 'desc' }],
					maxRecords: 10,
					filterByFormula: `{VK-ID} = ${user.id}`
				})
		)

		return Promise.all(proms).then((res: Array<[]>) => [].concat(...res))
	}


	onStoryChange = (e) => this.setState({ activeStory: e.currentTarget.dataset.story })

	setLocation = (route: string) => {
		if (route !== 'profile') {
			connect.send('VKWebAppSetLocation', { location: route });
		} else {
			connect.send('VKWebAppSetLocation', { location: '' });
		}
	}

	openSnackbar() {
		if (this.state.snackbar) return;

		let exp = this.state.user['Опыт'];
		let sl = exp.toString()
		let percent = (sl.length > 3) ? +sl.slice(sl.length - 3) : +sl
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

		return (
			<View id="main" activePanel={this.state.activeView}>
				<Profile
					id="profile"
					snackbar={this.state.snackbar}
					openSnackbar={this.openSnackbar}
					rubrics={rubrics}
					go={this.go}
					user={user}
					history={history}
					achieves={achieves}
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

