import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Div, FixedLayout, Button, } from '@vkontakte/vkui';
import Cover from '../Cover/Cover';
import "./MarketCard.css";
import Linkify from 'react-linkify';
import Navbar from '../Navbar/Navbar';







class MarketCard extends React.Component<any, any> {


    render() {

        let {
            item,
            id,
            go
        } = this.props



        const title = item.title.replace(/\d+★\s/gm, '');
        const price = item.title.replace(/(\d+)★\s.*/gm, '$1');
        const url = `https://vk.com/market${item.owner_id}_${item.id}`
        return (

            <Panel id={id} className="marketCard">
                <Navbar go={go} dataTo='profile'></Navbar>
                <Cover height="auto"><h1>{title}</h1>{price} ★</Cover>
                <Div className="desc">
                    <Linkify>
                        {item.description}
                    </Linkify>
                    
                </Div>
                <FixedLayout className="bottomBar" vertical="bottom">
                    <Button size={'l'} stretched={true} component="a" href={url} >Открыть в магазине</Button>
                </FixedLayout>
            </Panel>

        );
    }
}

MarketCard.propTypes = {
    id: PropTypes.string.isRequired,
    // item: PropTypes.object.isRequired,
    fetchedUser: PropTypes.shape({
        photo_200: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        city: PropTypes.shape({
            title: PropTypes.string,
        }),
    }),
};

export default MarketCard;