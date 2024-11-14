import React, { useEffect, useState } from "react";

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

function App() {
	// const [location, setLocation] = useState(localStorage.getItem("location"));
	const [location, setLocation] = useState(function () {
		const storedLocation = localStorage.getItem("location");
		return storedLocation ? storedLocation : "";
	});
	const [weather, setWeather] = useState({});
	const [displayLocation, setDisplayLocation] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(
		function () {
			async function fetchWeather() {
				if (location.length < 2) return setWeather({});
				try {
					setIsLoading(true);
					setError("");

					// 1) Getting location (geocoding)
					const geoRes = await fetch(
						`https://geocoding-api.open-meteo.com/v1/search?name=${location}`
					);

					if (!geoRes.ok) throw new Error("Failed to fetch");

					const geoData = await geoRes.json();
					console.log(geoData);

					if (!geoData.results) throw new Error("Location not found");

					const { latitude, longitude, timezone, name, country_code } =
						geoData.results.at(0);

					setDisplayLocation(`${name} ${convertToFlag(country_code)}`);

					// 2) Getting actual weather
					const weatherRes = await fetch(
						`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
					);

					if (!weatherRes.ok)
						throw new Error("Something went wrong while fetching data!");

					const weatherData = await weatherRes.json();

					if (!weatherData) throw new Error("failed to fetch location data");
					console.log(weatherData);

					setWeather(weatherData.daily);
				} catch (err) {
					console.error(err);
					// setError(() => err);
					// console.log(error.props);
				} finally {
					setIsLoading(false);
				}
			}
			fetchWeather();
		},
		[location]
	);

	function setNewLocation(e) {
		setLocation(e.target.value);
	}

	useEffect(
		function () {
			// fetchWeather();

			localStorage.setItem("location", location);
		},
		[location]
	);

	return (
		<div className="app">
			<h1>Classy Weather</h1>
			<Input location={location} onChangeLocation={setNewLocation} />
			{/* <button onClick={fetchWeather}>Get weather</button> */}

			{isLoading && <p className="loader">loading...</p>}

			{weather.weathercode && (
				<Weather weather={weather} location={displayLocation} />
			)}
			{error && <Error weather={weather} />}
		</div>
	);
}

export default App;

function Input({ location, onChangeLocation }) {
	return (
		<div>
			<input
				type="text"
				placeholder="Search from location..."
				value={location}
				onChange={onChangeLocation}
			/>
		</div>
	);
}

function Error({ weather }) {
	return <p>Error</p>;
}

function Weather({ weather, location }) {
	const {
		temperature_2m_max: max,
		temperature_2m_min: min,
		time: dates,
		weathercode: codes,
	} = weather;
	console.log(dates);
	return (
		<div>
			<h2>Weather {location}</h2>
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

function Day({ date, max, min, code, isToday }) {
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
