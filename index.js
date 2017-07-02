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

// Special properties
const SELECTOR = Symbol('SELECTOR')
const CONVERT = Symbol('CONVERT')
const DATA = Symbol('DATA')

function* traverse(node, ob) {
	// Array
	if(Array.isArray(ob)) {
		if(ob.length === 0) yield []
		else if(ob.length === 1) yield [...traverse(node, ob[0])] // get all
		else yield ob.map(o => traverse(node, o).next().value) // get each
		return null
	}

	// String (selector)
	if(typeof ob === 'string') {
		yield* node.find(ob).map(v => (v.text || v.value).apply(v)) // stringify
		return null // if doesn't exist
	}

	// Object
	if(typeof ob === 'object' && ob != null) {
		// use DATA as schema if it's defined
		let _data = ob[DATA]
		if(ob[DATA] == null) {
			// use itself with removing special keys
			_data = Object.assign(Object.create(null), ob)
			delete _data[SELECTOR]
			delete _data[CONVERT]
			delete _data[DATA]
		}
		const data = _data

		// use SELECTOR as base selector if it's defined, or use `node`
		const nodes = (ob[SELECTOR] == null) ? [node] : node.find(ob[SELECTOR])

		// use CONVERT as convert function(data => newdata)
		const func = (ob[CONVERT] instanceof Function) ? ob[CONVERT] : null

		// if `data` is Object, traverse each values.
		if(typeof data === 'object' && !Array.isArray(data) && data != null) {
			const entries = Object.entries(data)
			for(const newNode of nodes) {
				let o = {}
				for(const [k, v] of entries) o[k] = traverse(newNode, v).next().value
				if(func != null) o = func(o) // CONVERT function apply
				yield o
			}
		} else for(const newNode of nodes) {
			if(func != null) for(const v of traverse(newNode, data)) yield func(v) // CONVERT function apply
			else yield* traverse(newNode, data)
		}

		return null
	}

	return null
}

const parse = (html, ob) => {
	const doc = parseHtml(html, {huge: true})

	if(doc == null) throw new Error("Couldn't parse it")
	if(doc.errors[0] && doc.errors[0].code === 4) throw new Error("Document is empty")
	if(doc.root() == null) throw new Error('Document has no root')

	return traverse(doc, ob).next().value
}

module.exports = {parse, SELECTOR, CONVERT, DATA}
