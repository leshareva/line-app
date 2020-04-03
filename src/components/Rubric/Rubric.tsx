import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Div, Group, List, Cell, InfoRow, Progress, Header, Spinner, Tabs, TabsItem } from '@vkontakte/vkui';
import { base } from '../../airtable/airtable';

import "./Rubric.css";
import Cover from '../Cover/Cover';
import ReactMarkdown from 'react-markdown';
// import connect from '@vkontakte/vk-connect';
import Navbar from '../Navbar/Navbar';
import { star } from '../../icons';
// const osname = platform();


class Rubric extends React.Component<any, any> {


	state = {
		purchases: null,
		lessons: null,
		activeTab2: 'desc',
	}



	async componentDidMount() {
		await this.getPurchases()
			.then(data => {
				this.setState({ purchases: data });
				return
			})

		await this.getLessons().then(data => {

			if (Object.keys(data).length !== 0) {
				this.setState({ activeTab2: 'schedule' })
			}
			this.setState({ lessons: data });

			return
		})
	}


	componentWillUnmount() {
		this.setState({ purchases: null, lessons: null })
	}

	select(e) {
		const mode = e.currentTarget.dataset.mode;
		this.setState({ mode });
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

	private parseHistory = (history: any[]) => {

		return history.map((el, i) => {
			return <Cell key={i} asideContent={el.rubric} className={(() => (el['Баллы']) < 0 ? "cellNegative" : "historyCell")()} description={(() => {
				return this.parseDate(el['Датавремя'])
			})()
			} >

				{(() => {

					if (!el['Баллы']) el['Баллы'] = 0;

					if (el['Баллы'] > 0 && el['Опыт']) {
						return <span><span>{el['Баллы']}</span><span className="star">{star('#000000')}</span><span>,&nbsp;{el['Опыт'][0]}&nbsp;опыта {(() => el['Комментарий'] ? "• " + el['Комментарий'] : "")()}</span></span>
					} else if (el['Баллы'] === 0 && el['Опыт']) {
						return <span>{el['Опыт'][0]}&nbsp;опыта {(() => el['Комментарий'] ? "• " + el['Комментарий'] : "")()}</span>

					} else if (!el['Опыт']) {
						return <span><span>{el['Баллы']}</span><span className="star">{star('#000000')}</span>{(() => el['Комментарий'] ? "• " + el['Комментарий'] : "")()}</span>

					}
				})()
				}

			</Cell>
		})
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

	getPurchases = async () => {
		const user = this.props.user;
		const rubric = this.props.rubric;
		let res = await base.list('Покупки', { filterByFormula: `AND({VK-ID}=${user.id}, {Статус}=BLANK() )`, fields: ["Рубрика", "Осталось", "Датавремя", "Кол-во тренировок", "Посещеные тренировки"] }).catch(err => {
			console.log(err);
			return [];
		}) as [];

		let pursh = res.filter(el => el['Осталось'] && el['Рубрика'] && el['Рубрика'][0] === rubric.recID)
		return pursh[0];
	}


	renderMeta = (el) => {
		el.sprintData = this.props.sprintData
		el.purchases = this.state.purchases
		return el
	}

	render() {

		let {
			go,
			rubric,
			history
			// sprintData
		} = this.props

		let h = history ? history.filter(el => el.rubric === rubric['Название']) : []
		// if(!this.state.purchases) return splashLoader;



		let cellHistory = this.parseHistory(h);



		const cover = () => rubric['Обложка'] ? `url(${rubric['Обложка'][0]['url']}) center/cover no-repeat` : '';
		
		return (

			<Panel id='rubric'>

				<Navbar go={go} dataTo='profile'></Navbar>

				<Cover background={cover()}>
					<Div className="desc">
						<h1>{rubric['Название']}</h1>
						<div className="lead">{(() => { return this.state.purchases ? `Доступно ${this.state.purchases['Осталось']} тренировки` : "" })()}</div>
						{/* <ReactMarkdown source={ "" } /> */}
					</Div>
				</Cover>

				{
					(() => {
						//выводим список тренировок
						if (!this.state.lessons) return <Spinner size="medium" style={{ marginTop: 20 }} />


						return <div><Tabs>
							{
								(() => {
									if (!rubric['Тренировки']) return

									return <TabsItem
										onClick={() => this.setState({ activeTab2: 'schedule' })}
										selected={this.state.activeTab2 === 'schedule'}
									>
										Расписание
														</TabsItem>
								})()
							}

							{
								(() => {
									if (!rubric['Описание']) return

									return <TabsItem
										onClick={() => this.setState({ activeTab2: 'desc' })}
										selected={this.state.activeTab2 === 'desc'}
									>
										Описание
												</TabsItem>
								})()
							}



							{
								(() => {
									if (!h || h.length === 0) return

									return <TabsItem
										onClick={() => this.setState({ activeTab2: 'history' })}
										selected={this.state.activeTab2 === 'history'}
									>
										Прогресс
												</TabsItem>
								})()
							}

						</Tabs>


							{(() => {
								if (this.state.activeTab2 !== 'desc' || !rubric['Описание']) return;
								return <Div><ReactMarkdown source={rubric['Описание']} /> </Div>
							})()
							}

							{(() => {
								//прогресс бар по рубрике
								if (this.state.activeTab2 !== 'history' || !rubric['Итог опыт']) return;

								let exp = h.filter(el => el['Опыт']).map(el => el['Опыт'][0])
									.reduce((current, next) => current + next);
								return <Group title="Прогресс" className="progressBarContainer">
									<InfoRow header={`${Math.round((exp * 100) / rubric['Итог опыт'])}%`} className="progressBar">
										<Progress value={(exp * 100) / rubric['Итог опыт']} style={{ width: '100%' }} />
									</InfoRow>
								</Group>

							})()}


							{(() => {

								if (this.state.activeTab2 !== 'history' || h.length === 0) return;

								//Выводим историю начислений по этой рубрике
								return <Group header={<Header mode="secondary">История</Header>} className="history">
									{(() => {
										if (h.length === 0) {
											return <Div>Вы пока не участвовали ни в одной активности в этой рубрике.</Div>
										}
										return <List> {cellHistory} </List>
									})()}

								</Group>
							})()}


							{(() => {
								if (this.state.activeTab2 !== 'schedule') return;

								const lessons = this.state.lessons;
								let days = Object.keys(lessons);
								return days.map((key, i) => {
									let les = lessons[key];
									return <div className="calendarWrapper" key={i}>
										<Group header={<h1 className="calendarHeader">{key.replace(/(\d+\s\D{3}?).+/gs, '$1') + ", " + les['day']}</h1>}  >
											{(() => {
												return lessons[key]['items'].map((el, index) => {
													return (
														<Cell expandable multiline onClick={go} data-to='lesson' before={<div className="time">{el['Время']}<br /><span style={{ color: "#cccccc" }}>{el['Окончание']}  <br /> МСК</span></div>} data-meta={JSON.stringify(this.renderMeta(el))} key={index} description={el['Описание'].substring(0, 70)}>{el['Name']}</Cell>
													)
												})
											})()}
										</Group>
									</div>
								})

							})()}
						</div>



					})()
				}








			</Panel>

		);
	}
}

Rubric.propTypes = {
	id: PropTypes.string.isRequired,
	post: PropTypes.object,
	user: PropTypes.shape({
		photo_200: PropTypes.string,
		first_name: PropTypes.string,
		last_name: PropTypes.string,
		city: PropTypes.shape({
			title: PropTypes.string,
		}),
	}),
};

export default Rubric;