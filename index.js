'use strict'
const {parseHtml, Document, Element} = require('libxmljs-dom')
const css2xpath = require('css2xpath')

/*
  Code from https://github.com/rchipka/node-osmosis/blob/master/index.js
  because libxmljs-dom is poorly documented.
  It uses MIT License, but @rchipka doesn't add LICENSE file to the repo.
*/

// rchipka/node-osmosis CODE STARTS HERE

const cachedSelectors = Object.create(null)

Document.prototype.findXPath = Document.prototype.find
Element.prototype.findXPath = Element.prototype.find

Document.prototype.find = function(selector, cache) { return this.root().find(selector, cache) }

Element.prototype.find = function(selector) {
	if(selector[0] === '/' || selector[0] === '(' || selector[1] === '/') return this.findXPath(selector)
	return this.findXPath(cachedSelectors[selector] || (cachedSelectors[selector] = css2xpath(selector))) || []
}

// rchipka/node-osmosis CODE ENDS HERE


const SELECTOR = Symbol('SELECTOR')
const CONVERT = Symbol('CONVERT')
const DATA = Symbol('DATA')

function* sex(node, ob){
	if(Array.isArray(ob)) {
		if(ob.length === 0) yield []
		else if(ob.length === 1) yield [...sex(node, ob[0])]
		else yield ob.map(o => sex(node, o).next().value)
		return null
	}

	if(typeof ob === 'string') {
		yield* getValues(node, ob)
		return null
	}

	if(typeof ob === 'object' && ob != null) {
		let data = ob[DATA]
		if(ob[DATA] == null) {
			data = Object.assign(Object.create(null), ob)
			delete data[SELECTOR]
			delete data[CONVERT]
		}
		const nodes = (ob[SELECTOR] == null) ? [node] : node.find(ob[SELECTOR])
		const func = (ob[CONVERT] instanceof Function) ? ob[CONVERT] : null

		if(typeof data === 'object' && !Array.isArray(data) && data != null) {
			const entries = Object.entries(data)
			for(const newNode of nodes) {
				let o = {}
				for(const [k, v] of entries) o[k] = sex(newNode, v).next().value
				if(func != null) o = func(o)
				yield o
			}
		} else if(func != null) {
			for(const newNode of nodes) for(const v of sex(newNode, data)) yield func(v)
		} else for(const newNode of nodes) yield* sex(newNode, data)
		return null
	}

	return null
}

function* getValues(node, selector) {
	yield* (node.find(selector).map(v => (v.text || v.value).apply(v)))
	return null
}

const parse = (html, ob) => {
	'use strict'
	const doc = parseHtml(html, {huge: true})
	if(doc == null) throw new Error('couldn\'t parse it')
	if(doc.errors[0] && doc.errors[0].code === 4) throw new Error('document is empty')
	if(doc.root() == null) throw new Error('document has no root')

	return sex(doc, ob).next().value
}

module.exports = {parse, SELECTOR, CONVERT, DATA, getValues, parseHtml}
