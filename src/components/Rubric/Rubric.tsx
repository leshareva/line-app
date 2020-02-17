import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Div, Group, List, Cell, InfoRow, Progress } from '@vkontakte/vkui';


import "./Rubric.css";
import Cover from '../Cover/Cover';
import ReactMarkdown from 'react-markdown';
// import connect from '@vkontakte/vk-connect';
import Navbar from '../Navbar/Navbar';
import { star } from '../../icons';
// const osname = platform();



class Rubric extends React.Component<any, any> {


	private parseHistory = (history: any[]) => {

		const parseDate = (iso: string) => {
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


		return history.map((el, i) => {
			return <Cell key={i} asideContent={el.rubric} className={(() => (el['Баллы']) < 0 ? "cellNegative" : "historyCell")()} description={(() => {
				return parseDate(el['Датавремя'])
			})()
			} >

				{(() => {

					if (!el['Баллы']) el['Баллы'] = 0;

					if (el['Баллы'] > 0 && el['Опыт']) {
						return <span><span>{el['Баллы']}</span><span className="star">{star('#000000')}</span><span>,&nbsp;{el['Опыт'][0]}&nbsp;опыта {(() => el['Комментарий'] ? "• " +el['Комментарий'] : "")()}</span></span>
					} else if (el['Баллы'] === 0 && el['Опыт']) {
						return <span>{el['Опыт'][0]}&nbsp;опыта {(() => el['Комментарий'] ? "• " +el['Комментарий'] : "")()}</span>

					}
				})()
				}

			</Cell>
		})
	}


	render() {

		let {
			go,
			rubric,
			// post,
			history,
			// sprintData
		} = this.props

		let h = history ? history.filter(el => el.rubric === rubric['Название']) : []



		let cellHistory = this.parseHistory(h);
		


		const cover = () => rubric['Обложка'] ? `url(${rubric['Обложка'][0]['url']}) center/cover no-repeat` : '';
		return (

			<Panel id='rubric'>

				<Navbar go={go} dataTo='profile'></Navbar>

				<Cover background={cover()} height="fit-content">
					<Div className="desc">
						<h1>{rubric['Название']}</h1>
						<ReactMarkdown source={rubric['Описание']} />
					</Div>
				</Cover>

				{(() => {
					if (h.length === 0 || !rubric['Итог опыт']) return;

					let exp = h.filter(el => el['Опыт']).map(el => el['Опыт'][0])
						.reduce((current, next) => current + next);
					return <Group title="Прогресс" className="progressBarContainer">
						<InfoRow title={`${Math.round((exp * 100) / rubric['Итог опыт'])}%`} className="progressBar">
							<Progress value={(exp * 100) / rubric['Итог опыт']} style={{ width: '100%' }} />
						</InfoRow>
					</Group>

				})()}

				{(() => {
					if (h.length === 0) return <Group title="История" className="history">
						<Div>Вы пока не участвовали ни в одной активности в этой рубрике.</Div>
					</Group>
					//Выводим историю начислений по этой рубрике
					return <Group title="История" className="history">
						<List> {cellHistory} </List>
					</Group>
				})()}

				{(() => {
					// if (post) {
					// 	let link = `https://vk.com/wall${post.owner_id}_${post.id}`
					// 	return (
					// 		<div className="decWrapper">
					// 			<FixedLayout className="bottomBar" vertical="bottom">
					// 				<Button size={'l'} stretched={true} onClick={() => connect.send("VKWebAppShare", { "link": link })}>Поделиться</Button>
					// 			</FixedLayout>
					// 			<Div className="rubricPost" style={(() => (osname === ANDROID) ? { paddingBottom: '148px' } : { paddingBottom: '80px' })()}>
					// 				<h2>Актуальное задание</h2>
					// 				{post.text}

					// 				{/* <img src={getCover()} className="postCover" alt="postCover" /> */}
					// 			</Div>
					// 		</div>
					// 	)
					// }
				})()}

			</Panel>

		);
	}
}

Rubric.propTypes = {
	id: PropTypes.string.isRequired,
	post: PropTypes.object,
	fetchedUser: PropTypes.shape({
		photo_200: PropTypes.string,
		first_name: PropTypes.string,
		last_name: PropTypes.string,
		city: PropTypes.shape({
			title: PropTypes.string,
		}),
	}),
};

export default Rubric;