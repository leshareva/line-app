import React from 'react';
import { Panel, Div, Card, Group, Progress, InfoRow } from '@vkontakte/vkui';
import { base } from '../../airtable/airtable';
import "./Rubric.css";
import Cover from '../Cover/Cover';
import ReactMarkdown from 'react-markdown';
import Navbar from '../Navbar/Navbar';

import RubricTabs from './RubricTabs';
import ScheduleList from './ScheduleList';
import HistoryList from '../HistoryList';
import { parseDate, Time } from '../Helpers';


interface iRubricPage {
	id: string
	user: any
	rubric: any
	go: (route: string, meta?: any) => void
	rubricCellClickHandler: (dataTo: string, metaData: any) => void
}


class Rubric extends React.Component<iRubricPage, any> {

	_isMounted: boolean = false

	state = {
		purchases: null,
		lessons: null,
		activeTab: null,
		goods: null,
		history: []
	}



	async componentDidMount() {
		this._isMounted = true
		let { rubric } = this.props
		const lessons = await this.getLessons()

		this.setState({ lessons: lessons });

		let history = await this.fetchHistoryData(this.props.user.id, rubric['recID'], rubric['Таблица'])
		let purchases = await this.getPurchases()
		if(this._isMounted) {
			this.setState({ history: history })
			if (lessons && Object.keys(lessons).length !== 0) {
				this.setState({ activeTab: 'schedule' })
			} else if (history.length !== 0) {
				this.setState({ activeTab: 'history' })
			} else {
				this.setState({ activeTab: 'desc' })
			}

			this.setState({ purchases:  purchases });
		}
		
	}





	componentWillUnmount() {
		this._isMounted = false;
	}





	async fetchHistoryData(userID: number, rubricID: string, rubricTable: string) {
		return base.list(rubricTable, { filterByFormula: `AND({VK-ID} = ${userID}, NOT({Рубрика}=BLANK()))` }).then((history: any[]) => {
			return history.filter(item => item['Рубрика'][0] === rubricID)
		}).catch(e => [])
	}

	getLessons = async () => {
		if (!this.props.rubric) return;

		return base.list('Тренировки', { view: 'Ближайшие', filterByFormula: `AND(NOT({Дата}=BLANK()), {RubricID}='${this.props.rubric.recID}')` })
			.then((res: any[]) => {

				if (res.length === 0) return
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
					let key = parseDate(el['Дата']).replace(/^(\d+\s.+?)\s.+/gs, '$1');
					let date = new Date(el['Дата']);

					obj[key] = {
						date: key,
						day: days[date.getDay()],
						items: []
					}


				})




				res.forEach(el => {
					let key = parseDate(el['Дата']).replace(/^(\d+\s.+?)\s.+/gs, '$1');
					el['День недели'] = days[new Date(el['Дата']).getDay()]
					el['Время'] = Time(el['Дата'])
					// el['Окончание'] = Time(el['Время окончания'])
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



	render() {

		let {
			go,
			rubric,
		} = this.props



		// const cover = () => rubric['Обложка'] ? `url(${rubric['Обложка'][0]['url']}) center/cover no-repeat` : '';

		return (

			<Panel id='rubric'>

				<Navbar go={() => go('profile')} dataTo='profile'></Navbar>

				<Cover height="fit-content">
					{/* <Cover background={cover()} height="fit-content"> */}
					<Div className="desc"><h1>{rubric['Название']}</h1></Div>
				</Cover>


				<RubricTabs
					rubric={rubric}
					selectedTab={this.state.activeTab}
					lessons={this.state.lessons}
					history={this.state.history}
					onClickHandler={(tabName) => this.setState({ activeTab: tabName })}
				/>

				{(() => {
					if (!rubric['Итог опыт'] || !this.state.history) return

					let exp = this.state.history.filter(el => el['Опыт']).map(el => el['Опыт']).reduce((current, next) => current + next, 0);
					return <Group title="Прогресс" className="progressBarContainer">
						<InfoRow header={`${Math.round((exp * 100) / rubric['Итог опыт'])}%`} className="progressBar">
							<Progress value={(exp * 100) / rubric['Итог опыт']} style={{ width: '100%' }} />
						</InfoRow>
					</Group>
				})()}

				{(this.state.activeTab === 'desc' && rubric['Описание'])
					? <Div style={{ paddingLeft: 'var(--wrapper-padding-2x)' }}><ReactMarkdown source={rubric['Описание']} /> </Div>
					: ''
				}



				{(this.state.activeTab === 'history') ? <HistoryList history={this.state.history} /> : ''}


				{(() => {
					if (this.state.activeTab !== 'schedule') return;
					return <ScheduleList
						lessons={this.state.lessons}
						onCellClick={(e) => {
							console.log('event', e);
							this.props.go('lesson', e) 
						}}
						rubric={rubric}
					/>
				})()}

			</Panel>

		);
	}
}


export default Rubric;