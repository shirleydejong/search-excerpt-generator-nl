/**
 * Create an excerpt from a string
 * 
 * @param <type> part : Description for part
 * 
 * @return <type> : description
 * 
 */
function excerptFromArr (body, indicies, maxLength, contextOptions) {
	if (indicies.length === 0) {
		return getWholeWordsWithMaxChars(body, maxLength - 3) + '…';
	}

	const words = body.match(/\S+/g) || [];
	let section = new Section(indicies[0], words, contextOptions);
	let newSection;

	for (let i = 1, max = indicies.length; i < max; i++) {
		newSection = section.join(new Section(indicies[i], words, contextOptions));
		if (newSection.length() > maxLength) {
			break;
		}
		section = newSection;
	}

	return section.toHTML();
};

/**
 * Escape HTML characters
 * 
 * @param {String} string : Input string
 * 
 * @return {String} : String with these HTML characters escaped
 * 
 */
function escapeHtml(string) {
	const entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};
	return String(string).replace(/[&<>"'\/]/g, s => entityMap[s]);
}

/**
 * Strip leading punctuation
 * 
 * @param {String} string : Input string
 * 
 * @return {String} : with leading punctuation stripped
 * 
 */
function stripTrailingLeadingPunctuation(string) {
	return (string.match(/[a-z].*[a-z]/) || [])[0];
};

function getWholeWordsWithMaxChars(string, maxLength) {
	let words = string.match(/\S+/g) || [];
	let length = 0;
	
	if (words.length === 0) {
		return 'No content';
	}
	
	for (var i = 0, max = words.length; i < max; i++) {
		if (words[i].length + length > maxLength) {
			return words.slice(0, i).join(' ');
		}
		
		length += words[i].length;
	}
	
	return words.join(' ');
};

/**
 * Dutch stop word filter
 * 
 * @param {String} word : Word to check
 * 
 * @return {String|false} : Word if it is not a stop word, false if it is
 * 
 */
export function stopWordFilter(word) {
	const dutchStopWords = ['aan', 'af', 'al', 'als', 'bij', 'dan', 'dat', 'de', 'die', 'dit', 'een', 'en', 'er', 'had', 'heb', 'hem', 'het', 'hier', 'hij', 'hoe', 'ik', 'in', 'is', 'je', 'kan', 'me', 'men', 'met', 'mij', 'nog', 'nu', 'of', 'ons', 'ook', 'te', 'tot', 'uit', 'van', 'veel', 'voor', 'was', 'wat', 'we', 'wel', 'wij', 'zal', 'ze', 'zei', 'zelf', 'zich', 'zo', 'zou'];
	if ( !dutchStopWords.includes(word) ) {
		return word;
	}
	return false;
}

function extend() {
	for (let i = 1; i < arguments.length; i++) {
		for (let key in arguments[i]) {
			if (arguments[i].hasOwnProperty(key)) {
				arguments[0][key] = arguments[i][key];
			}
		}
	}
	return arguments[0];
};


/**
 * Search Excerpt Generator
 * 
 * 
 */
export class SearchExcerptGenerator {
	
	
	/**
	 * Constructor
	 * 
	 * @param {String} query : Search query
	 * @param {Number} maxLength : Max length of the excerpt
	 * @param {Object} contextOptions : Options
	 * 
	 * @return <type> : description
	 * 
	 */
	constructor(query, maxLength, contextOptions) {
		
		const tokens = query.toLowerCase().match(/\S+/g) || [];
		
		const newTokens = [];
		let newToken;
		let splitTokens;
		
		for (let i = 0, max = tokens.length; i < max; i++) {
			newToken = stripTrailingLeadingPunctuation(tokens[i]);
			if (!newToken) continue;
			splitTokens = newToken.match(/[a-z]+[:\-][a-z]+/) || [newToken];

			for (let j = 0, jMax = splitTokens.length; j < jMax; j++) {
				newToken = stopWordFilter(splitTokens[j]);
				if (newToken !== false) {
					newTokens.push(newToken);
				}
			}
		}
		
		this.contextOptions = extend({words: 4, regex: null}, contextOptions);
		this.tokens = newTokens;
		this.maxLength = maxLength;
		
	}
	
	/**
	 * Generate excerpt
	 * 
	 * @param {String} body : Input for the excerpt
	 * 
	 * @return {String} : HTML string with the excerpt
	 * 
	 */
	generateExcerpt(body) {
		if (this.tokens.length === 0) {
			return excerptFromArr(body, [], this.maxLength);
		}
	
		const indicies = [];
		let word;
		let splitWords;
		let words = body.toLowerCase().match(/\S+/g) || [];
		
		for (let i = 0, max = words.length; i < max; i++) {
			// remove leading and trailing punctuation
			word = stripTrailingLeadingPunctuation(words[i]);
			if (!word) continue;
			splitWords = word.match(/[a-z]+[:\-][a-z]+/) || [word];
		
			// check each word part
			for (let j = 0, jMax = splitWords.length; j < jMax; j++) {
				// and stem word
				word = splitWords[j];
				if (word && this.tokens.indexOf(word) > -1) {
					indicies.push(i);
					break;
				}
			}
		}
		return excerptFromArr(body, indicies, this.maxLength, this.contextOptions);
	};
	
}

/**
 * Section class
 * 
 * 
 */
export class Section {
	
	
	/**
	 * Constructor
	 * 
	 * @param {Number} index : Index of the section
	 * @param {String} words : Words of the section
	 * @param {Object} contextOptions : Options
	 * 
	 * @return void
	 * 
	 */
	constructor(index, words, contextOptions) {
		if (typeof index !== 'undefined') {
		if (contextOptions.regex) {
			let regex = {};
			let include = {};
			
			if (contextOptions.regex.start && contextOptions.regex.finish) {
				['start', 'finish'].forEach((el) => {
					if (contextOptions.regex[el].hasOwnProperty('regex')) {
						regex[el] = contextOptions.regex[el].regex;
						include[el] = contextOptions.regex[el].include;
						include[el] = typeof include[el] === 'undefined' ? true : include[el];
					} else {
						regex[el] = contextOptions.regex[el];
						include[el] = true;
					}
				});
			} else if (contextOptions.regex.hasOwnProperty('regex')) {
				regex.start = regex.finish = contextOptions.regex.regex;
				include.start = contextOptions.regex.include;
				include.start = typeof include.start === 'undefined' ? true : include.start;
				include.finish = include.start;
			} else {
				regex.start = regex.finish = contextOptions.regex;
				include.start = include.finish = true;
			}
			
			let tmpIndex = words.slice(0, index).reverse().findIndex(el => el.match(regex.start));
			
			if (tmpIndex > -1) {
				this.start = index - tmpIndex - (include.start ? 1 : 0);
			} else {
				this.start = 0;
			}
	
			tmpIndex = words.slice(index + 1).findIndex(el => el.match(regex.finish));
			if (tmpIndex > -1) {
				this.finish = index + 1 + tmpIndex + (include.finish ? 1 : 0);
			} else {
				this.finish = words.length;
			}
		} else {
			this.start = Math.max(index - contextOptions.words, 0);
			this.finish = Math.min(index + contextOptions.words + 1, words.length);
		}
	
		this.words = words.slice(this.start, this.finish);
		this.indicies = [index - this.start];
		}
	};
	
	append(other) {
		if (this.finish >= other.start) {
			this.words = this.words.slice(0, this.words.length - (this.finish - other.start));
		} else {
			this.words.push('…');
		}
	
		for (let i = 0, max = other.indicies; i < max; i++) {
			this.indicies.push(other.indicies[i] + this.words.length);
		}
		this.words = this.words.concat(other.words);
		this.finish = other.finish;
	};
	
	join(other) {
		let newThis = this.deepCopy();
		newThis.append(other);
		return newThis;
	};
	
	length() {
		let total = this.words.length - 1; // all the spaces
		for (let i = 0, max = this.words.length; i < max; i++) {
			total += this.words[i].length;
		}
		return total;
	};
	
	toHTML() {
		let output = (this.start === 0 ? '' : '…');
		
		for (let i = 0, max = this.words.length; i < max; i++) {
			if (this.indicies.indexOf(i) > -1) {
				output += ' <strong>' + escapeHtml(this.words[i]) + '</strong>';
			} else {
				output += ' ' + escapeHtml(this.words[i]);
			}
		}
		
		return output.trim() + ' …';
	};
	
	deepCopy() {
		let newSection = new Section();
		newSection.start = this.start;
		newSection.finish = this.finish;
		newSection.words = this.words.slice(0);
		newSection.indicies = this.indicies.slice(0);
		return newSection;
	};
	
}