import { render } from '@wordpress/element';
import { App } from './App';
import 'antd/dist/reset.css';
import './style.scss';

const containerID = window.pluginData.containerID;

render(<App />, document.getElementById(containerID));
