import { h, Component, createRef } from 'preact';

export class AnnotoTimelineComponent extends Component<IAnnotoTimelineProps> {
    readonly ref = createRef();

    /**
     * https://preactjs.com/guide/v10/external-dom-mutations
     */
    shouldComponentUpdate = () => false;

    componentDidMount() {
        if (this.ref.current) {
            this.props.onReady(this.ref.current);
        }
    }

    render() {
        return (
            <div className='playkit-annoto-timeline' ref={this.ref}></div>
        );
    }
}

export interface IAnnotoTimelineProps {
    onReady(el: HTMLElement): void;
}