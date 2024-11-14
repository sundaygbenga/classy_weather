import React, { Component } from "react";
function getWeatherIcon(wmoCode) {
	const icons = new Map([
		[[0], "☀️"],
		[[1], "🌤"],
		[[2], "⛅️"],
		[[3], "☁️"],
		[[45, 48], "🌫"],
		[[51, 56, 61, 66, 80], "🌦"],
		[[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
		[[71, 73, 75, 77, 85, 86], "🌨"],
		[[95], "🌩"],
		[[96, 99], "⛈"],
	]);
	const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
	if (!arr) return "NOT FOUND";
	return icons.get(arr);
}

function convertToFlag(countryCode) {
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map((char) => 127397 + char.charCodeAt());
	return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
	return new Intl.DateTimeFormat("en", {
		weekday: "short",
	}).format(new Date(dateStr));
}

class App extends Component {
	// Class field feature: we can directly declare properties on a component instance in the class definition: outside any method
	state = {
		location: "",
		isLoading: false,
		displayLocation: "",
		weather: {},
		error: "",
	};

	// This is not needed as we don't need to bind the this keyword anymore
	// n

	// async fetchWeather() {
	// Define methods as classfields using arrow function
	fetchWeather = async () => {
		if (this.state.location.length < 2) return this.setState({ weather: {} });
		try {
			this.setState({ isLoading: true });
			this.setState({ error: "" });

			// 1) Getting location (geocoding)
			const geoRes = await fetch(
				`https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
			);
			const geoData = await geoRes.json();
			console.log(geoData);

			if (!geoData.results) throw new Error("Location not found");

			const { latitude, longitude, timezone, name, country_code } =
				geoData.results.at(0);

			this.setState({
				displayLocation: `${name} ${convertToFlag(country_code)}`,
			});

			// 2) Getting actual weather
			const weatherRes = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
			);
			const weatherData = await weatherRes.json();
			this.setState({ weather: weatherData.daily });
		} catch (err) {
			console.error(err);
			this.setState({ error: err.props });
			console.log(this.state.error);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	setLocation = (e) => this.setState({ location: e.target.value });

	// Lifecycle methods:
	//1. MOUNTING- similar with useEffect with empty array: useEffect []
	componentDidMount() {
		// this.fetchWeather();

		this.setState({ location: localStorage.getItem("location") || "" });
	}

	//2. RE-RENDERING- useEffect [location]
	// will enable us to fetch weather when the inout changes onchange
	componentDidUpdate(prevProps, prevState) {
		if (this.state.location !== prevState.location) {
			this.fetchWeather();

			localStorage.setItem("location", this.state.location);
		}
	}

	render() {
		return (
			<div className="app">
				<h1>Classy Weather</h1>
				<Input
					location={this.state.location}
					onChangeLocation={this.setLocation}
				/>
				{/* <button onClick={this.fetchWeather}>Get weather</button> */}

				{this.state.isLoading && <p className="loader">loading...</p>}

				{this.state.weather.weathercode && (
					<Weather
						weather={this.state.weather}
						location={this.state.displayLocation}
					/>
				)}
				{this.state.error && <Error error={this.state.error} />}
			</div>
		);
	}
}

export default App;

class Input extends React.Component {
	render() {
		return (
			<div>
				<input
					type="text"
					placeholder="Search from location..."
					value={this.props.location}
					onChange={this.props.onChangeLocation}
				/>
			</div>
		);
	}
}

// We did not call the constructore method in all these components because we don't need to initialize state or explicitly bind the this keyword to some event handler method (They are just presentational component)

class Error extends React.Component {
	render() {
		return <p>{this.props.error}</p>;
	}
}

class Weather extends React.Component {
	// 3, Similar to returning clean up function in effect, but it runs only after component unmount not btw renders
	componentWillUnmount() {
		console.log("Weather is unmounting");

		// if (this.state.location.length === 1) {
		// 	console.log("Component has unmounted");
		// }
	}

	render() {
		console.log(this.props);
		console.log(this.props.weather.time);
		const {
			temperature_2m_max: max,
			temperature_2m_min: min,
			time: dates,
			weathercode: codes,
		} = this.props.weather;
		console.log(dates);
		return (
			<div>
				<h2>Weather {this.props.location}</h2>
				<ul className="weather">
					{dates.map((date, i) => (
						<Day
							date={date}
							max={max.at(i)}
							min={max.at(i)}
							code={codes.at(i)}
							key={date}
							isToday={i === 0}
						/>
					))}
				</ul>
			</div>
		);
	}
}

class Day extends React.Component {
	render() {
		const { date, max, min, code, isToday } = this.props;
		return (
			<li className="day">
				<span>{getWeatherIcon(code)}</span>
				<p>{isToday ? "Today" : formatDay(date)}</p>
				<p>
					{Math.floor(min)}&deg; &mdash;
					<strong>{Math.ceil(max)}&deg;</strong>
				</p>
			</li>
		);
	}
}
