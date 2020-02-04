import React from 'react';
import connect from '@vkontakte/vk-connect';
import { platform, ANDROID, View, Snackbar, InfoRow, Progress } from '@vkontakte/vkui';

import { base } from './airtable/airtable';
import { R_VK_ID, RUBRICS } from './airtable/constants';

import splash from './img/splash.GIF';
import '@vkontakte/vkui/dist/vkui.css';
import "./main.css";

import { VK_GROUP_ID, VK_APP_ID, AMOUNT_TO_NEW_USER } from './constants';
import Rubric from './components/Rubric/Rubric';
import Profile from './components/Profile/Profile';
import MarketCard from './components/MarketCard/MarketCard';
import * as Typograf from 'typograf';

import Icon28Newsfeed from '@vkontakte/icons/dist/28/newsfeed';
import Icon28Users from '@vkontakte/icons/dist/28/users';

const tp = new Typograf({ locale: ['ru', 'en-US'] });

const splashLoader = <div style={{ width: '100%', height: '100%', backgroundColor: '#770EFD' }}><img src={splash} style={{ width: '100%', height: '100%' }} alt="loading..." /></div>;

const osname = platform();


class App extends React.Component<any, any> {

	constructor(props) {
		super(props);

		this.state = {
			fetchedUser: null,
			activeView: 'profile',
			authToken: null,
			isLoading: false,
			items: [],
			history: [],
			rubrics: [],
			sprintData: null,
			meta: {},
			snackbar: null

		};
		this.getItems = this.getItems.bind(this);
		this.openBase = this.openBase.bind(this);
		this.onStoryChange = this.onStoryChange.bind(this);
	}

	async componentDidMount() {
		this.setState({ isLoading: true });

		connect.subscribe(async (e: any) => {
			switch (e.detail.type) {
				case 'VKWebAppGetUserInfoResult':
					this.setState({ fetchedUser: e.detail.data });
					break;
				case 'VKWebAppAccessTokenReceived':
					this.setState({ authToken: e.detail.data.access_token });
					this.getItems();
					break;
				case 'VKWebAppViewRestore':
					this.setState({ isLoading: true });
					this.getItems();
					break;
				default:
					console.log(e.detail.type);
			}
		});
		(osname === ANDROID) ? connect.send("VKWebAppSetViewSettings", { "status_bar_style": "light", "action_bar_color": "#000000" }) : connect.send("VKWebAppSetViewSettings", { "status_bar_style": "light", });
		connect.send('VKWebAppGetUserInfo', {});
		connect.sendPromise("VKWebAppGetAuthToken", { "app_id": VK_APP_ID, "scope": "market" });

	}

	

	openBase() {

		if (this.state.snackbar) return;

		let exp = this.state.sprintData['Опыт'];
		let sl = exp.toString()
		let percent = (sl.length > 3) ? +sl.slice(sl.length - 3) : +sl
		this.setState({
			snackbar:
				<Snackbar
					className="snackbar"
					layout="vertical"
					onClose={() => {
						this.setState({ snackbar: null })
						return {}
					}}
				>

					<InfoRow title={`${percent} ед. опыта. Осталось: ${1000 - percent} ед.`}>
						<Progress value={percent * 0.1} style={{width: '100%'}}/>
					</InfoRow>
					<a href="https://vk.com/@lean.school-user-level" target="_blank" rel="noopener noreferrer">Зачем нужен уровень?</a>

				</Snackbar>
		});
	}

	getItems = async () => {
		this.setState({ isLoading: true })

		if (this.state.authToken) {
			let market = await this.callVKApi('market.get', { owner_id: -(VK_GROUP_ID), access_token: this.state.authToken })
				.then((res: any) => res.response.items)
				.catch(_ => [])

			this.setState({ items: market })
		}

		if (this.state.fetchedUser) {
			let user = this.state.fetchedUser
			let sprintData = await base.list('Участники', { filterByFormula: `{${R_VK_ID}} = ${this.state.fetchedUser.id}` }).then(res => res[0]);

			if (!sprintData) {

				sprintData = await base.create({ 'Имя': `${user.first_name} ${user.last_name}`, [R_VK_ID]: user.id }, 'Участники')
					.then(res => base.create({
						"Баллы": AMOUNT_TO_NEW_USER,
						"Профиль": [res.recID],
						"Комментарий": "Первое начисление"
					}, "Начисления: разминки"))

				// this.setActiveModal('amount')

			}

			this.setState({ sprintData: sprintData })
			let promises = RUBRICS
				.map(el =>
					base.list(el, { filterByFormula: `{${R_VK_ID}} = ${this.state.fetchedUser.id}`, sort: [{ field: 'Датавремя', direction: 'desc' }], maxRecords: 10 })
						.then(res => res.map(obj => {
							obj.rubric = el;
							return obj;
						}))
				)

			let rubrics = await base.list('Рубрики').catch(e => []);
			rubrics = rubrics
				.filter(el => el['Опубликовано'])
				.map(obj => {
					if (obj['Описание']) {
						obj['Описание'] = tp.execute(obj['Описание']);
						obj.desc = obj['Описание'].replace(/[*#|]/gs, '').slice(0, 60)
						if (obj.desc.length < obj['Описание'].length) obj.desc = obj.desc + "…"
					}

					return obj
				})
			this.setState({ rubrics: rubrics })

			let result = await Promise.all(promises) as any[][]
			let history = [].concat.apply([], result);

			history = history
				.map(item => {
					const rubric = rubrics.find(el => item['Рубрика'] && item['Рубрика'][0] === el.recID)
					if (rubric) item.rubric = rubric['Название']
					return item
				})
				.sort((a, b) => {
					var dateA = new Date(a['Датавремя']),
						dateB = new Date(b['Датавремя'])
					return dateB - dateA
				})


			this.setState({ history: history, isLoading: false })

		}

	};






	onStoryChange(e) {
		this.setState({ activeStory: e.currentTarget.dataset.story })
	}


	callVKApi(method: string, params?: any) {
		let obj = { 'access_token': this.state.authToken, 'v': '5.87' }
		params = !params ? obj : Object.assign(obj, params)

		return connect.sendPromise("VKWebAppCallAPIMethod", {
			'method': method,
			'params': params
		})
	}


	setLocation = (route) => {
		if (route !== 'profile') {
			connect.send('VKWebAppSetLocation', { location: route });
		} else {
			connect.send('VKWebAppSetLocation', { location: '' });
		}
	}

	go = async (e) => {
		const route = e.currentTarget.dataset.to;
		const meta = e.currentTarget.dataset.meta;
		const parseMeta = meta ? JSON.parse(meta) : null
		if (parseMeta) this.setState({ meta: parseMeta })
		if (route === 'rubric') {
			let post = await this.getWallPost(parseMeta["ТэгЗадания"])
			this.setState({ post: post })
		}

		this.setState({ activeView: route })
		// this.setLocation(route)
	};


	getWallPost = async (query: string) => {

		return connect.sendPromise('VKWebAppCallAPIMethod', {
			method: 'wall.search',
			params: {
				owner_id: -VK_GROUP_ID,
				query: query,
				count: 1,
				access_token: this.state.authToken,
				v: '5.103'
			}
		}).then((res: any) => {
			let post = res.response.items[0];
			post.text = tp.execute(post.text);
			return post;
		}).catch(_ => null)


	}




	render() {
		const { fetchedUser, isLoading, history, sprintData, rubrics, items } = this.state;
		if (!fetchedUser || isLoading) return splashLoader;

		return (
			
			<View id="main" activePanel={this.state.activeView}>

				<Profile id="profile" snackbar={this.state.snackbar} openSnackbar={this.openBase} market={items} rubrics={rubrics} go={this.go} fetchedUser={this.state.fetchedUser} history={history} sprintData={sprintData} ></Profile>
				<Rubric id="rubric" fetchedUser={this.state.fetchedUser} rubric={this.state.meta} post={this.state.post} go={this.go}></Rubric>
				<MarketCard id="marketItem" go={this.go} item={this.state.meta}></MarketCard>

			</View >
		

		)
	}
}


export default App;

