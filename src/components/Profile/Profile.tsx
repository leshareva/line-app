import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Cell, List, PanelHeader, Group, Avatar, HorizontalScroll, platform, ANDROID } from '@vkontakte/vkui';
import Icon24BrowserForward from '@vkontakte/icons/dist/24/browser_forward';
import "./Profile.css";
import Cover from '../Cover/Cover';
import { star, logo } from '../../icons';
import LevelBubble from '../LevelBubble/LevelBubble';






class Profile extends React.Component<any, any> {

  

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
            } ><span>{el['Баллы']}</span><span className="star">{star('#000000')}</span>

            </Cell>
        })
    }


    



    render() {
       


        let {
            fetchedUser,
            sprintData,
            history,
            go,
            rubrics,
            market,
            openSnackbar,
            snackbar
        } = this.props
        
        let cellHistory = this.parseHistory(history)
        
        return (
           
            <Panel id='profile'  >
                <PanelHeader></PanelHeader>

                <Cover fetchedUser={fetchedUser} sprintData={sprintData} height="184px">
                    <div className="logo" style={{ top: (platform() === ANDROID) ? '25px' : '37px' }}>{logo}</div>
                    <div className="amountContainer">
                        <Avatar src={fetchedUser.photo_200} size={72}></Avatar>
                        <div className="amountWrapper">
                            <span className="amount">{sprintData['Баланс']}</span>
                            <span className="star">{star('#ffffff')}</span>
                            <br />
                            <a href="https://vk.com/@lean.school-kak-zarabotat-v-line-bally-i-zachem" target="_blank" rel="noopener noreferrer">Как и зачем зарабатывать баллы?</a>
                            <LevelBubble className="levelBubble" action={openSnackbar}>{Math.round(sprintData['Уровень'])}</LevelBubble>
                        </div>

                    </div>
                </Cover>


                <Group title="Рубрики" >
                    <List>
                        {(() => rubrics
                            .map((item, i) => {
                                let cover = () => item['Обложка'] ? <Avatar type="image" src={item['Обложка'][0]['url']} size={72} /> : ""
                                return (<Cell key={i} className="rubricsCell" before={cover()} multiline description={item['desc']} asideContent={<Icon24BrowserForward fill="var(--icon_secondary)" />} onClick={go} data-to='rubric' data-meta={JSON.stringify(item)}>{item['Название']}</Cell>)
                            })
                        )()}
                    </List>
                </Group>

                <Group title='Товары за баллы'>
                    <HorizontalScroll>
                        <div style={{ display: 'flex', paddingLeft: '12px', fontFamily: 'Montserrat' }}>

                            {
                                market.length > 0 && market.map((item, i) =>
                                    (<div key={i} className="marketItem">
                                        <Avatar className="marketImage" type="image" key={i} src={item.thumb_photo} onClick={go} data-to='marketItem' data-meta={JSON.stringify(item)} />
                                        {item.title.replace(/(\d+★).*/gs, '$1')}</div>)
                                )
                            }


                        </div>
                    </HorizontalScroll>


                </Group>


                {(() => {
                    if (cellHistory.length !== 0) {
                        return (
                            <Group title="История" className="history"><List> {cellHistory} </List></Group>)
                    }
                })()}

                {snackbar}
            </Panel>
            
        );
    }
}

Profile.propTypes = {
    id: PropTypes.string.isRequired,
    sprintData: PropTypes.object,
    rubrics: PropTypes.array,
    history: PropTypes.array,
    go: PropTypes.func,
    market: PropTypes.array,
    fetchedUser: PropTypes.shape({
        photo_200: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        city: PropTypes.shape({
            title: PropTypes.string,
        }),
    }),
};

export default Profile;