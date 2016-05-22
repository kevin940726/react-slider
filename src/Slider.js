import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import BezierEasing from 'bezier-easing';

const easeOutQuad = BezierEasing(0.25, 0.46, 0.45, 0.94);

const styles = {
    base: {
        display: 'block',
        height: '300px',
        overflow: 'hidden',
        position: 'relative',
    },
    sliderWrapper: {
        display: 'block',
        position: 'absolute',
        top: '0px',
        left: '-100vw',
        height: '100%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        transition: 'none',
    },
    image: {
        display: 'inline-block',
        width: '100vw',
        height: '100%',
        position: 'relative',
        zIndex: '1',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
    },

    arrow: {
        position: 'absolute',
        top: '0px',
        bottom: '0px',
        margin: 'auto 0',
        height: '40px',
        width: '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: '3',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease-out',

        ':hover': {
            backgroundColor: 'rgba(0, 0, 0, 1)',
        },
    },
    leftArrow: {
        left: '0px',
    },
    rightArrow: {
        right: '0px',
    },

    dots: {
        display: 'block',
        listStyle: 'none',
        position: 'absolute',
        bottom: '10px',
        width: '100%',
        textAlign: 'center',
        zIndex: '3',
        margin: '0px',
    },
    dot: {
        height: '15px',
        width: '15px',
        display: 'inline-block',
        borderRadius: '50%',
        backgroundColor: '#AAA',
        margin: '0 5px',
        transition: 'background-color 0.2s ease-out',
    },
    activeDot: {
        backgroundColor: '#FFF',
    },
};

const SliderImage = Radium(({ src }) => (
    <div
        style={[
            styles.image,
            {
                backgroundImage: `url(${src})`,
            },
        ]}
    ></div>
));

const SliderArrows = Radium(({ prevSlide, nextSlide }) => (
    <div>
        <div
            key="leftArrow"
            onClick={prevSlide}
            style={[styles.arrow, styles.leftArrow]}
        ></div>
        <div
            key="rightArrow"
            onClick={nextSlide}
            style={[styles.arrow, styles.rightArrow]}
        ></div>
    </div>
));

const SliderDots = Radium(({ images, cur, goToSlide }) => (
    <ul style={styles.dots}>
        {images.map((image, index) => (
            <li
                key={index}
                style={[styles.dot, cur === index && styles.activeDot]}
                onClick={() => goToSlide(index)}
            ></li>
        ))}
    </ul>
));

class Slider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cur: 0,
            left: -100,
            timer: null,
            autoTimer: this.setAutoTimer(),
        };
    }
    componentDidMount() {
        const prefixes = [
            '',
            'moz',
            'ms',
            'webkit',
        ];

        const lowerize = (s) => s.charAt(0).toLowerCase() + s.slice(1);

        const prefix = prefixes.filter(p => typeof document[`${p}hidden`] !== 'undefined')[0];
        const visibilityChange = lowerize(`${prefix}visibilitychange`);
        const visibilityState = lowerize(`${prefix}VisibilityState`);

        document.addEventListener(visibilityChange, () => {
            const { autoTimer } = this.state;
            clearInterval(autoTimer);

            if (document[visibilityState] === 'hidden') {
                this.setState({ autoTimer: null });
            }
            else if (document[visibilityState] === 'visible') {
                this.setState({ autoTimer: this.setAutoTimer() });
            }
        }, false);
    }
    componentWillUpdate(nextProps, nextState) {
        const { images, duration } = this.props;
        const { cur, left, timer, autoTimer } = this.state;
        const nextLeft = -100 * (nextState.cur + 1);
        const step = nextLeft - left;

        if (cur !== nextState.cur && cur !== -1 && cur !== images.length) {
            clearInterval(timer);
            clearInterval(autoTimer);

            let nextCur = nextState.cur;

            if (nextState.cur === images.length) {
                nextCur = 0;
            }
            else if (nextState.cur === -1) {
                nextCur = images.length - 1;
            }

            this.setState({
                timer: setInterval(() => {
                    this.setState(prevState => {
                        if (prevState.time >= 1) {
                            clearInterval(prevState.timer);

                            let nextStep = nextLeft;

                            if (nextState.cur === images.length) {
                                nextStep = -100;
                            }
                            else if (nextState.cur === -1) {
                                nextStep = -100 * images.length;
                            }

                            return {
                                cur: nextCur,
                                left: nextStep,
                                timer: null,
                                autoTimer: this.setAutoTimer(),
                            };
                        }

                        return {
                            left: left + step * easeOutQuad(prevState.time),
                            time: prevState.time + 1000 / 60 / duration,
                        };
                    });
                }, 16),
                time: 0,
                cur: nextCur,
                autoTimer: null,
            });
        }
    }

    setAutoTimer() {
        return setInterval(() => {
            this.nextSlide();
        }, this.props.interval);
    }
    getCircularValue(v) {
        const len = this.props.images.length;
        if (v > len - 1) {
            return v % len;
        }
        else if (v < 0) {
            return this.getCircularValue(len + v);
        }

        return v;
    }
    nextSlide() {
        const { cur, timer } = this.state;

        if (!timer) {
            this.setState({ cur: cur + 1 });
        }
    }
    prevSlide() {
        const { cur, timer } = this.state;

        if (!timer) {
            this.setState({ cur: cur - 1 });
        }
    }
    goToSlide(n) {
        const { cur, timer } = this.state;

        if (!timer && cur !== n) {
            this.setState({ cur: n });
        }
    }

    render() {
        const { images, hideArrows, hideDots } = this.props;
        const { cur, left } = this.state;

        return (
            <div style={styles.base}>
                <div
                    style={[
                        styles.sliderWrapper,
                        {
                            left: `${left}vw`,
                        },
                    ]}
                >
                    <SliderImage key="fakeLast" src={images[images.length - 1]} />
                    {images.map(image => (
                        <SliderImage key={image} src={image} />
                    ))}
                    <SliderImage key="fakeFirst" src={images[0]} />
                </div>

                {hideArrows ? '' :
                    <SliderArrows
                        prevSlide={() => this.prevSlide()}
                        nextSlide={() => this.nextSlide()}
                    />}

                {hideDots ? '' :
                    <SliderDots images={images} cur={cur} goToSlide={n => this.goToSlide(n)} />}
            </div>
        );
    }
}

Slider.PropTypes = {
    images: PropTypes.array.isRequired,
};

export default Radium(Slider);
