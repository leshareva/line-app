import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Div, platform, Button, ANDROID, FixedLayout } from '@vkontakte/vkui';


import "./Rubric.css";
import Cover from '../Cover/Cover';
import ReactMarkdown from 'react-markdown';
import connect from '@vkontakte/vk-connect';
import Navbar from '../Navbar/Navbar';





class Rubric extends React.Component<any, any> {




	render() {

		let {
			go,
			rubric,
			post
		} = this.props

		const getCover = () => {
			try {
				let post = this.props.post;
				let attach = post.attachments[0]

				let size = attach.photo ? attach.photo.sizes[attach.photo.sizes.length - 1] : null;
				return size.url
			} catch {
				return null
			}

		}

		const osname = platform();


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
					if (post) {
						let link = `https://vk.com/wall${post.owner_id}_${post.id}`
						return (
							<div className="decWrapper">
								<FixedLayout className="bottomBar" vertical="bottom">
									<Button size={'l'} stretched={true} onClick={() => connect.send("VKWebAppShare", { "link": link })}>Поделиться</Button>
								</FixedLayout>
								<Div className="rubricPost" style={(() => (osname === ANDROID) ? { paddingBottom: '148px' } : { paddingBottom: '80px' })()}>
									<h2>Актуальное задание</h2>
									{post.text}

									{/* <img src={getCover()} className="postCover" alt="postCover" /> */}
								</Div>
							</div>
						)
					}
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