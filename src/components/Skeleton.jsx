import React from 'react';

const Skeleton = ({ className, width, height, circle }) => {
    const style = {
        width: width || '100%',
        height: height || '20px',
        borderRadius: circle ? '50%' : '8px',
    };

    return (
        <div
            className={`bg-gray-200 skeleton-shimmer overflow-hidden ${className}`}
            style={style}
        />
    );
};

export default Skeleton;
