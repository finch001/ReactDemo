import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';
// 1. ` ` 2. ${} 作为变量  3. 中间插入？
const url = `${PATH_BASE} ${PATH_SEARCH}?${PARAM_SEARCH}${PARAM_PAGE}`;

const largeColum = {
	width: '40%',
};

const midColum = {
	width: '30%',
};

const smallColum = {
	width: '15%'
};

//const isSearched = (searchTerm) => (item) => !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());

const Search = ({value, onChange, onSubmit, children}) =>
	<form onSubmit={onSubmit}>
		<input
			type="text"
			value={value}
			onChange={onChange}
		/>
		<button type="submit">
			{children}
		</button>
	</form>

const Table = ({list, onDismiss}) =>
	<div className="table">
		{list.map(item =>
			<div key={item.objectID} className="table-row">
				<span style={largeColum}>
					<a href="{item.url}">{item.title}</a>
				</span>
				<span style={midColum}>{item.author}</span>
				<span style={smallColum}>{item.points}</span>
				<span style={smallColum}>{item.num_comments}</span>
				<span>
						<button onClick={() => onDismiss(item.objectID)}
								type="button"
								className="button-inline"
						>
							Dismiss
						</button>
					</span>
			</div>
		)}
	</div>

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			results: null,
			searchKey: '',
			searchTerm: DEFAULT_QUERY,
		};

		this.onDismiss = this.onDismiss.bind(this);
		this.onSearchChange = this.onSearchChange.bind(this);
		this.setSearchTopstories = this.setSearchTopstories.bind(this);
		this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
		this.onSearchSubmit = this.onSearchSubmit.bind(this);
		this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
	}

	onDismiss(id) {
		const isNotId = item => item.objectID !== id;
		const updateHits = this.state.results.hits.filter(isNotId);

		this.setState({
			// 合并连个数组 并且返回一个新的数组 如果有=相同的数组则合并其中的一样的数组
			results: {...this.state.results, hits: updateHits}
		});
	}

	// 更新所有的数据
	setSearchTopstories(result) {
		const {hits, page} = result;

		const {searchKey, results} = this.state;
		const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
		const updateHits = [...oldHits, ...hits];

		console.log(results);
		this.setState({
			results: {
				...results,
				[searchKey]: {hits: updateHits, page}
			}
		});
	}

	needsToSearchTopStories(searchTerm) {
		return !this.state.results[searchTerm];
	}

	// 网络请求获取数据
	fetchSearchTopstories(searchTerm, page) {
		// 动态构建URL 请求服务器
		const requestUrl = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`;
		console.log(requestUrl);
		fetch(requestUrl)
			.then(response => response.json())
			.then(result => this.setSearchTopstories(result));
	}

	// EditText变化自动影射到state中去
	onSearchChange(event) {
		this.setState({
			searchTerm: event.target.value
		});
	}

	// 网络请求获取数据
	onSearchSubmit(event) {
		const {searchTerm} = this.state;
		this.setState({searchKey: searchTerm});
		if (this.needsToSearchTopStories(searchTerm)) {
			console.log("fetch data :" + searchTerm);
			this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
		}

		event.preventDefault();
	}

	render() {
		// ES6 语法  解构对象 必须使用相同的属性名  数组对应的解析则是对应的数字
		const {searchTerm, results, searchKey} = this.state;
		const page = (results && results[searchKey] && results[searchKey].page) || 0;
		const list = (results && results[searchKey] && results[searchKey].hits) || [];
		return (
			<div className="page">
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo"/>
					<h2>Welcome to React</h2>
				</div>
				<div className="interactions">
					<Search
						value={searchTerm}
						onChange={this.onSearchChange}
						onSubmit={this.onSearchSubmit}
					>
						Search
					</Search>
				</div>
				{
					//  && 逻辑符 和  ？ express ： express
					results &&
					<Table
						list={list}
						onDismiss={this.onDismiss}
					/>
				}
				<div className="interactions">
					<button onClick={() => this.fetchSearchTopstories(searchTerm, page + 1)}>
						More
					</button>
				</div>
			</div>
		);
	}

	componentDidMount() {
		const {searchTerm} = this.state;
		this.setState({searchKey: searchTerm});
		this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
	}
}

export default App;
