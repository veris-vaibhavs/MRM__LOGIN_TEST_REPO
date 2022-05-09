import React from 'react';
import 'antd/dist/antd.css';
import './ratingStars.css';
// import { Rate } from 'antd';


export default function ReviewComponent(props) {

    return (
        <>
            <div class='vrs-label'>{props.label || 'Rating'}</div>
            {/*<Rate onChange={(value) => {*/}
            {/*    props.onFocus(value);*/}
            {/*    props.onChange(value);*/}
            {/*}} count={parseInt(props.placeholder_text) || 5} defaultValue={parseInt(props.value) || 1} />*/}
            {/*{props.error ? <div class='vrs-error'>{props.error}</div> : ''}*/}
        </>
    );
};
