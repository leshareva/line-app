import React from 'react';
import { Panel, Div, Spinner, Card } from '@vkontakte/vkui';
import { base } from '../../airtable/airtable';
import "./Rubric.css";
import Cover from '../Cover/Cover';
import ReactMarkdown from 'react-markdown';
import Navbar from '../Navbar/Navbar';

import RubricTabs from './RubricTabs';
import ScheduleList from './ScheduleList';
import HistoryList from './HistoryList';


class Rubric extends React.Component<any, any> {


	state = {
		purchases: null,
		lessons: null,
		activeTab: 'desc',
		goods: null
	}



	async componentDidMount() {
		

		await this.getLessons().then(data => {

			if (Object.keys(data).length !== 0) {
				this.setState({ activeTab: 'schedule' })
			}
			this.setState({ lessons: data });

			return
		})

		await this.getPurchases()
			.then(data => {
				this.setState({ purchases: data });
				return
			})

		if (this.props.rubric && this.props.rubric['Товар']) {

			let promise = this.props.rubric['Товар'].map(recID => {
				return base.find(recID, 'Товары')
			})

			Promise.all(promise).then(res => {
				this.setState({ goods: res });
			})

		}
	}


	componentWillUnmount() {
		this.setState({ purchases: null, lessons: null })
	}


	parseDate = (iso: string) => {
		var arr = [
			'января',
			'февраля',
			'марта',
			'апреля',
			'мая',
			'июня',
			'июля',
			'августа',
			'сентября',
			'октября',
			'ноября',
			'декабря',
		];
		let date = new Date(iso)
		let month = arr[+date.getMonth()];
		const result = `${date.getDate()} ${month} ${date.getFullYear()}, ${date.toLocaleTimeString().replace(/(.*:.*?):\d+/gs, '$1')}`
		return result
	}




	getLessons = async () => {
		if (!this.props.rubric) return;

		return base.list('Тренировки', { view: 'Ближайшие', filterByFormula: `AND(NOT({Дата}=BLANK()), {RubricID}='${this.props.rubric.recID}')` })
			.then((res: any[]) => {
				let obj = {}


				const days = {
					0: 'вс',
					1: 'пн',
					2: 'вт',
					3: 'ср',
					4: 'чт',
					5: 'пт',
					6: 'сб'
				}

				res.forEach(el => {
					let key = this.parseDate(el['Дата']).replace(/^(\d+\s.+?)\s.+/gs, '$1');
					let date = new Date(el['Дата']);

					obj[key] = {
						date: key,
						day: days[date.getDay()],
						items: []
					}


				})

				function Time(date) {
					var d = new Date(date);
					d.setHours(d.getHours());
					let res = d.toTimeString().substring(0, 5);
					return res;

				}


				res.forEach(el => {
					let key = this.parseDate(el['Дата']).replace(/^(\d+\s.+?)\s.+/gs, '$1');
					el['День недели'] = days[new Date(el['Дата']).getDay()]
					el['Время'] = Time(el['Дата'])
					el['Окончание'] = Time(el['Время окончания'])
					el['Дата'] = key;
					el['rubric'] = this.props.rubric;
					obj[key]['items'].push(el)
				})


				return obj
			})
	}



	select(e) {
		const mode = e.currentTarget.dataset.mode;
		this.setState({ mode });
	}





	getPurchases = async () => {
		const user = this.props.user;
		const rubric = this.props.rubric;
		let res = await base.list('Покупки', { filterByFormula: `AND({VK-ID}=${user.id}, {Статус}=BLANK() )`, fields: ["Название", "Рубрика", "Осталось", "Датавремя", "Кол-во тренировок", "Посещеные тренировки"] }).catch(err => {
			console.log(err);
			return [];
		}) as [];

		let pursh = res.filter(el => el['Осталось'] && el['Рубрика'] && el['Рубрика'][0] === rubric.recID)
		return pursh[0];
	}

	renderAbonement = () => {

		if (!this.state.goods) return;

		return this.state.goods.map((good, i) => {

			return <Card size="l" key={i}>
				<div className="abonement">
					<h2>{good["Название товара"]}</h2>
				</div>
			</Card>
		})
	}

	onCellClickHandler(el) {
		el.user = this.props.user
		el.purchases = this.state.purchases
		return this.props.rubricCellClickHandler('lesson', el)
	}



	render() {

		let {
			go,
			rubric,
			history
		} = this.props

		let h = history ? history.filter(el => el.rubric === rubric['Название']) : []





		const cover = () => rubric['Обложка'] ? `url(${rubric['Обложка'][0]['url']}) center/cover no-repeat` : '';

		return (

			<Panel id='rubric'>

				<Navbar go={go} dataTo='profile'></Navbar>

				<Cover background={cover()} height="fit-content">
					<Div className="desc">
						<h1>{rubric['Название']}</h1>
						{/* <div className="lead"><CardScroll>{this.renderAbonement()}</CardScroll></div> */}
					</Div>
				</Cover>


				<RubricTabs
					rubric={rubric}
					selectedTab={this.state.activeTab}
					history={history}
					onClickHandler={(tabName) => this.setState({ activeTab: tabName })}
				/>

				{(this.state.activeTab === 'desc' && rubric['Описание'])
					? <Div><ReactMarkdown source={rubric['Описание']} /> </Div>
					: null
				}



				{(this.state.activeTab === 'history') ? <HistoryList history={h} rubric={rubric} /> : null}


				{(() => {
					if (this.state.activeTab === 'schedule'&&!this.state.lessons) return <Spinner size="medium" style={{ marginTop: 20 }} />
					if (this.state.activeTab !== 'schedule') return;
					

					return <ScheduleList
						lessons={this.state.lessons}
						onCellClick={(e) => this.onCellClickHandler(e)}
						rubric={rubric}
					/>
				})()}

			</Panel>

		);
	}
}


export default Rubric;