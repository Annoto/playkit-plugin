import { h, Component, createRef } from 'preact';
import { IPlaykitPanelComponentProps } from '../../interfaces';

export class AnnotoPanelItemComponent extends Component<IAnnotoPanelItemProps> {
    readonly ref = createRef();

    render() {
        return (
            <div className='playkit-annoto-panel' ref={this.ref}></div>
        );
    }
}

export interface IAnnotoPanelItemProps extends IPlaykitPanelComponentProps { }