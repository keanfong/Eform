import React from "react";
import { quotes } from "./quotes.js";

const RandomQuote = ({ className }) => {
	const randomQuote = () => {
		const randomNumber = Math.floor(Math.random() * quotes.length);
		return quotes[randomNumber];
	};

	const quote = randomQuote();

	return (
		<div id="container" className={`form ${className}`}>
			<div className="fadeIn" key={Math.random()}>
				<h4
					style={{
						wordWrap: "break-word",
						color: quote.color,
						textAlign: "center",
					}}
				>
					"{quote.quote}"
				</h4>
			</div>
		</div>
	);
};

export default RandomQuote;
