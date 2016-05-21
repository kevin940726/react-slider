import React from 'react';
import ReactDOM from 'react-dom';
import Slider from './Slider';

const images = [
    'images/image-1.jpeg',
    'images/image-2.jpeg',
    'images/image-3.jpeg',
    'images/image-4.jpeg',
];

ReactDOM.render(
    <Slider images={images} interval={5000} duration={300} />,
    document.getElementById('root')
);
