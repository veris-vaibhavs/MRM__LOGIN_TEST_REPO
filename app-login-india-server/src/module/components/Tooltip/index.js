import React from 'react';
import Tooltip from 'rc-tooltip/es';

const TooltipWrapper = React.memo((props) => {
    if (props.tooltip) {
        return (
            <Tooltip
                transitionName='rc-tooltip-zoom'
                placement='bottom'
                trigger={['hover', 'click']}
                overlay={props.tooltip}
            >
                {props.children}
            </Tooltip>
        );
    } else {
        return props.children;
    }
});

export default TooltipWrapper;
