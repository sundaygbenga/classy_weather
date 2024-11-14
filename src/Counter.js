import React from "react";

class Counter extends React.Component {
	constructor(props) {
		super(props);

		// Declaring state in class component
		this.state = { count: 5 };
		// Binding the this keyword to a function
		this.handleDecrement = this.handleDecrement.bind(this);
		this.handleIncrement = this.handleIncrement.bind(this);
	}

	handleDecrement() {
		// Setting state based on current state
		this.setState((curState) => {
			return { count: curState.count - 1 };
		});
	}

	handleIncrement() {
		// Setting state based on current state
		this.setState((curState) => {
			return { count: curState.count + 1 };
		});
	}

	render() {
		const date = new Date("june 21 2027");
		date.setDate(date.getDate() + this.state.count);

		return (
			<div>
				<button onClick={this.handleDecrement}>-</button>
				<span>
					{date.toDateString()} [{this.state.count}]
				</span>
				<button onClick={this.handleIncrement}>+</button>
			</div>
		);
	}
}

export default Counter;
