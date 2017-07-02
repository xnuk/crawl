# crawl-it
you can make a religion out of this

## How to use
```javascript
const {parse, SELECTOR, CONVERT, DATA} = require('crawl-it')

const data = parse(require('fs').readFileSync('path/to/file.html'), {
	cats: ['#cats > div.rows > div.name'],
	dogs: [{
		[SELECTOR]: '#dogs > div.rows',
		[CONVERT]: x => {
			x.name = x.name.toUpperCase()
			return x
		},

		name: 'div.name', // You can use CSS selector
		pic: './/img/@src', // or XPath
		link: '.more>a/@href' // or both!
	}],
	copyright: {
		[CONVERT]: x => x.toLowerCase(),
		[DATA]: 'footer > .copyright'
	}
})

/*
data = {
	cats: ['Tim', 'Josh' , 'Kitty'],
	dogs: [
		{name: 'THOMAS', pic: 'foo.bar/thomas.png', link: 'foo.bar/thomas'},
		{name: 'MICHAEL', pic: 'foo.bar/michael.png', link: 'foo.bar/michael'}
	],
	copyright: '2016 foobar coperation all right reserved'
}
*/
```

### `parse(htmlSource: string, schema: object or string or array)`
Parse html and get data

- `htmlSource`: HTML source string
- `schema`: A value which explains how to get data
  - String schema: CSS and XPath selector powered by [css2xpath](https://github.com/css2xpath/css2xpath). Returns matching node's `text`, or `value` if it's self closing tag.
  - Empty array: Returns `[]`.
  - Array contains single schema: Finds all matching data with the schema and returns it's array.
  - Array contains two or more schema: Finds first-matching data with each schema and returns it's array.
  - Object: Finds with each schema and returns it's object.
    - `[SELECTOR]`: (string) Set base selector of each schema to this.
	- `[CONVERT]`: (Function: Any => Any) Convert this data object to another.
	- `[DATA]`: (string or array or object schema) Override schema to this schema, not current object schema.
