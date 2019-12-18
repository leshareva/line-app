import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Cell, List, PanelHeader, Group, Avatar, HorizontalScroll, platform, ANDROID } from '@vkontakte/vkui';
import Icon24BrowserForward from '@vkontakte/icons/dist/24/browser_forward';
import "./Profile.css";
import Cover from '../Cover/Cover';
import { star, logo } from '../../icons';








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
                'ноября',
                'декабря',
            ];
            let date = new Date(iso)
            let month = arr[+date.getMonth() - 1];
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


        const plural = (titles) => {
            var cases = [2, 0, 1, 1, 1, 2];
            return function (number) {
                number = Math.abs(number);
                let c =
                    (number % 100 > 4 && number % 100 < 20) ? 2 :
                        cases[(number % 10 < 5) ? number % 10 : 5];
                return titles[c];
            }
        }

        var point = plural(['балл', 'балла', 'баллов']);




        let {
            fetchedUser,
            sprintData,
            history,
            go,
            rubrics,
            market
        } = this.props

        let cellHistory = this.parseHistory(history)
        return (
            // <View activePanel="profile" id="profile" className="header panelImage" >
            <Panel id='profile'  >
                <PanelHeader></PanelHeader>
                <Cover fetchedUser={fetchedUser} sprintData={sprintData} height="184px">
                    <div className="logo" style={{ top: (platform() === ANDROID) ? '25px' : '37px' }}>{logo}</div>
                    <div className="amountContainer">
                        <Avatar src={fetchedUser.photo_200} size={72}></Avatar>
                        <div className="amountWrapper">
                            <span className="amount">{sprintData['Баланс']}</span>
                            <span className="star">{star('#ffffff')}</span>
                            <br />{point(+sprintData['Баланс'])}
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


            </Panel>
            // </View>
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