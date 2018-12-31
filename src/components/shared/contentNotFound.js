import React from 'react';
import {Icon} from 'antd'

export default ({content}) => (
    <div className={'content-not-found'}>
        <div className={'icon'}>
            <Icon type="exclamation-circle" />
        </div>
        <div className={'content-details'}>
            {content}
        </div>
    </div>
)