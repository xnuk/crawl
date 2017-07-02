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
